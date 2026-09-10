import bcrypt from "bcryptjs";
import { connectDB } from "../../config/db.js";
import { User } from "../../models/User.js";

export default async function handler(request, response) {
    if (request.method !== "POST") {
        response.setHeader("Allow", ["POST"]);
        return response
            .status(405)
            .json({ message: "Method not allowed." });
    }

    try {
        await connectDB();

        const { email, password } = request.body || {};

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            email.trim() === "" ||
            password === ""
        ) {
            return response.status(400).json({
                message: "Email and password are required."
            });
        }

        if (password.length < 6) {
            return response.status(400).json({
                message: "Password must be at least 6 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return response.status(409).json({
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            email: normalizedEmail,
            password: hashedPassword
        });

        return response.status(201).json({
            message: "Account created successfully.",
            user: {
                id: user._id.toString(),
                email: user.email
            }
        });
    } catch (error) {
        console.error("Signup error:", error);

        return response.status(500).json({
            message: "Could not create account."
        });
    }
}