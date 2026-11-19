
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./config/auth.js";
import verifyToken from "./middlewares/verify-token.js";
import bookRoutes from "./routes/book.routes.js";
import borrowRoutes from "./routes/borrow.routes.js";
import errorHandler from "./middlewares/error-handler.js";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to BookNook API!",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BookNook Server is running successfully.",
  });
});

app.get("/api/protected", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "JWT verification successful!",
    user: req.user,
    userId: req.userId,
  });
});

app.use("/books", bookRoutes);
app.use("/borrows", borrowRoutes);

app.use(errorHandler);

export default app;
