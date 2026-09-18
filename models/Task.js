import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        completed: {
            type: Boolean,
            default: false
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },
        dueDate: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);

