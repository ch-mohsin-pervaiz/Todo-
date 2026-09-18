import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db.js";
import { authenticate } from "./config/auth.js";
import { Task } from "./models/Task.js";
import loginHandler from "./api/auth/login.js";
import signupHandler from "./api/auth/signup.js";
import googleHandler from "./api/auth/google.js";
import googleCallbackHandler from "./api/auth/google/callback.js";

dotenv.config();
dotenv.config({ path: "../.env" });

export const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/api/auth/login", loginHandler);
app.post("/api/auth/signup", signupHandler);
app.get("/api/auth/google", googleHandler);
app.get("/api/auth/google/callback", googleCallbackHandler);

app.get("/api/tasks", async (request, response) => {
    const user = authenticate(request, response);
    if (!user) return;

    try {
        const tasks = await Task.find({ owner: user.userId }).sort({ createdAt: 1 });
        response.json(tasks.map(formatTask));
    } catch {
        response.status(500).json({ message: "Could not load tasks." });
    }
});

app.post("/api/tasks", async (request, response) => {
    const user = authenticate(request, response);
    if (!user) return;

    try {
        const task = await Task.create({
            owner: user.userId,
            text: request.body.text,
            priority: request.body.priority,
            dueDate: request.body.dueDate || null
        });
        response.status(201).json(formatTask(task));
    } catch {
        response.status(400).json({ message: "Task text is required." });
    }
});

app.patch("/api/tasks/:id", async (request, response) => {
    const user = authenticate(request, response);
    if (!user) return;

    try {
        const changes = {};

        if (typeof request.body.text === "string") {
            changes.text = request.body.text.trim();
        }

        if (typeof request.body.completed === "boolean") {
            changes.completed = request.body.completed;
        }

        if (["low", "medium", "high"].includes(request.body.priority)) {
            changes.priority = request.body.priority;
        }

        if (request.body.dueDate === null || request.body.dueDate === "") {
            changes.dueDate = null;
        } else if (typeof request.body.dueDate === "string") {
            changes.dueDate = request.body.dueDate;
        }

        if (Object.keys(changes).length === 0) {
            return response.status(400).json({ message: "No valid task changes provided." });
        }

        const task = await Task.findOneAndUpdate(
            { _id: request.params.id, owner: user.userId },
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
    const user = authenticate(request, response);
    if (!user) return;

    try {
        const task = await Task.findOneAndDelete({
            _id: request.params.id,
            owner: user.userId
        });
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
        completed: task.completed,
        priority: task.priority,
        dueDate: task.dueDate
    };
}

export async function startServer() {
    await connectDB();
    app.listen(port, () => console.log(`API running on port ${port}`));
}

if (process.env.VERCEL !== "1") {
    startServer().catch(() => process.exit(1));
}