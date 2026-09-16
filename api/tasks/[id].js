import { connectDB } from "../../config/db.js";
import { authenticate } from "../../config/auth.js";
import { Task } from "../../models/Task.js";

function formatTask(task) {
    return {
        id: task._id.toString(),
        text: task.text,
        completed: task.completed
    };
}

export default async function handler(request, response) {
    try {
        await connectDB();
        const user = authenticate(request, response);
        if (!user) return;

        if (request.method === "PATCH") {
            const body = typeof request.body === "string"
                ? JSON.parse(request.body)
                : request.body || {};
            const changes = {};

            if (typeof body.text === "string") {
                changes.text = body.text.trim();
            }

            if (typeof body.completed === "boolean") {
                changes.completed = body.completed;
            }

            if (Object.keys(changes).length === 0) {
                return response.status(400).json({
                    message: "No valid task changes provided."
                });
            }

            const task = await Task.findOneAndUpdate(
                { _id: request.query.id, owner: user.userId },
                { $set: changes },
                { new: true, runValidators: true }
            );

            if (!task) {
                return response.status(404).json({ message: "Task not found." });
            }

            return response.json(formatTask(task));
        }

        if (request.method === "DELETE") {
            const task = await Task.findOneAndDelete({
                _id: request.query.id,
                owner: user.userId
            });

            if (!task) {
                return response.status(404).json({ message: "Task not found." });
            }

            return response.status(204).end();
        }

        response.setHeader("Allow", ["PATCH", "DELETE"]);
        return response.status(405).json({ message: "Method not allowed." });
    } catch (error) {
        console.error("Task operation failed:", error);
        return response.status(400).json({
            message: "Could not update or delete task."
        });
    }
}