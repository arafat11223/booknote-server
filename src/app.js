const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

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
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;