import { app } from "../server.js";
import { connectDB } from "../db.js";

export default async function handler(request, response) {
    try {
        await connectDB();
        return app(request, response);
    } catch {
        return response.status(500).json({
            message: "Could not connect to the database."
        });
    }
}