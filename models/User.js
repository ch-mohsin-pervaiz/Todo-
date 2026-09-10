import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
        },
        name: {
            type: String,
            trim: true
        },
        avatar: {
            type: String,
            trim: true
        },
        password: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

export const User = mongoose.model("User", userSchema);