import mongoose from "mongoose";

let connectionPromise;
export const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI).catch((error) => {
            connectionPromise = undefined;
            throw error;
        });
    }

    try {
        await connectionPromise;
        return mongoose.connection;
    } catch (error) {
        console.error("Error in DB connection:", error);
        throw error;
    }
};

