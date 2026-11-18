
import express from "express";

import {
  getBooks,
  getSingleBook,
  addBook,
  editBook,
  removeBook,
} from "../controllers/book.controller.js";

import verifyToken from "../middlewares/verify-token.js";

const router = express.Router();

router.get("/", getBooks);

router.get("/:id", getSingleBook);

router.post("/", verifyToken, addBook);

router.patch("/:id", verifyToken, editBook);

router.delete("/:id", verifyToken, removeBook);

export default router;
