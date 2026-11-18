
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing in environment variables");
}

const client = new MongoClient(uri);

const db = client.db(process.env.DB_NAME || "booknook");

const connectDB = async () => {
  try {
    await client.connect();

    console.log("MongoDB connected successfully!");

    return db;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

const getDB = () => db;

export { client, db, connectDB, getDB };
