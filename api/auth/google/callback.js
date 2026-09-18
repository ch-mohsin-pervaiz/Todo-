import jwt from "jsonwebtoken";
import { createGoogleClient, getFrontendUrl } from "../../../config/google.js";
import { connectDB } from "../../../config/db.js";
import { User } from "../../../models/User.js";

export default async function handler(request, response) {
    try {
        if (request.query.error) {
            const frontendUrl = getFrontendUrl(request);
            const redirectUrl = new URL(frontendUrl);
            redirectUrl.searchParams.set(
                "authError",
                "Google login was cancelled. Please try again."
            );
            return response.redirect(redirectUrl.toString());
        }

        if (!request.query.code) {
            return response.status(400).json({
                message: "Google authorization code is missing."
            });
        }

        if (!process.env.JWT_SECRET) {
            return response.status(500).json({
                message: "JWT_SECRET is not configured."
            });
        }

        const client = createGoogleClient(request);
        const { tokens } = await client.getToken(request.query.code);
        if (!tokens.id_token) {
            throw new Error("Google did not return an ID token.");
        }

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const profile = ticket.getPayload();

        if (!profile?.sub || !profile.email || profile.email_verified !== true) {
            return response.status(401).json({
                message: "Google account email could not be verified."
            });
        }

        await connectDB();

        const normalizedEmail = profile.email.trim().toLowerCase();
        const user = await User.findOneAndUpdate(
            { $or: [{ googleId: profile.sub }, { email: normalizedEmail }] },
            {
                $set: {
                    googleId: profile.sub,
                    email: normalizedEmail,
                    name: profile.name || normalizedEmail.split("@")[0],
                    avatar: profile.picture || ""
                }
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const frontendUrl = getFrontendUrl(request);
        const redirectUrl = new URL(frontendUrl);
        redirectUrl.searchParams.set("authToken", token);

        return response.redirect(redirectUrl.toString());
    } catch (error) {
        console.error("Google callback error:", error);
        const frontendUrl = getFrontendUrl(request);
        const redirectUrl = new URL(frontendUrl);
        redirectUrl.searchParams.set(
            "authError",
            "Google login could not be completed. Check the OAuth redirect URL and try again."
        );
        return response.redirect(redirectUrl.toString());
    }
}
