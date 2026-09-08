import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        completed: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);

