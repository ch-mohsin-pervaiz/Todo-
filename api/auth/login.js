import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

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

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return response.status(401).json({
                message: "Invalid email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return response.status(401).json({
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return response.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user._id.toString(),
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        return response.status(500).json({
            message: "Could not log in."
        });
    }
}