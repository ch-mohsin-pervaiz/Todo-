import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db.js";
import { Task } from "./models/Task.js";
import loginHandler from "./api/auth/login.js";
import signupHandler from "./api/auth/signup.js";

dotenv.config();
dotenv.config({ path: "../.env" });

export const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/api/auth/login", loginHandler);
app.post("/api/auth/signup", signupHandler);

app.get("/api/tasks", async (_request, response) => {
    try {
        const tasks = await Task.find().sort({ createdAt: 1 });
        response.json(tasks.map(formatTask));
    } catch {
        response.status(500).json({ message: "Could not load tasks." });
    }
});

app.post("/api/tasks", async (request, response) => {
    try {
        const task = await Task.create({ text: request.body.text });
        response.status(201).json(formatTask(task));
    } catch {
        response.status(400).json({ message: "Task text is required." });
    }
});

app.patch("/api/tasks/:id", async (request, response) => {
    try {
        const changes = {};

        if (typeof request.body.text === "string") {
            changes.text = request.body.text.trim();
        }

        if (typeof request.body.completed === "boolean") {
            changes.completed = request.body.completed;
        }

        if (Object.keys(changes).length === 0) {
            return response.status(400).json({ message: "No valid task changes provided." });
        }

        const task = await Task.findByIdAndUpdate(
            request.params.id,
            { $set: changes },
            { new: true, runValidators: true }
        );

        if (!task) return response.status(404).json({ message: "Task not found." });
        response.json(formatTask(task));
    } catch {
        response.status(400).json({ message: "Could not update task." });
    }
});

app.delete("/api/tasks/:id", async (request, response) => {
    try {
        const task = await Task.findByIdAndDelete(request.params.id);
        if (!task) return response.status(404).json({ message: "Task not found." });
        response.status(204).end();
    } catch {
        response.status(400).json({ message: "Could not delete task." });
    }
});

function formatTask(task) {
    return {
        id: task._id.toString(),
        text: task.text,
        completed: task.completed
    };
}

export async function startServer() {
    await connectDB();
    app.listen(port, () => console.log(`API running on port ${port}`));
}

if (process.env.VERCEL !== "1") {
    startServer().catch(() => process.exit(1));
}