
import express from "express";

import {
  createBorrow,
  getBorrows,
  returnBorrowedBook,
} from "../controllers/borrow.controller.js";

import verifyToken from "../middlewares/verify-token.js";

const router = express.Router();

router.post("/", verifyToken, createBorrow);

router.get("/", verifyToken, getBorrows);

router.delete("/:id", verifyToken, returnBorrowedBook);

export default router;
