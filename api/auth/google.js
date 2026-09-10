import { createGoogleClient } from "../../config/google.js";

export default async function handler(request, response) {
    try {
        const client = createGoogleClient(request);
        const authorizationUrl = client.generateAuthUrl({
            access_type: "offline",
            scope: ["openid", "email", "profile"],
            prompt: "select_account"
        });

        return response.redirect(authorizationUrl);
    } catch (error) {
        console.error("Google auth start error:", error);
        return response.status(500).json({
            message: "Google login is not configured on the server."
        });
    }
}
