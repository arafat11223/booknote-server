
import { ObjectId } from "mongodb";

import {
  borrowBook,
  getUserBorrows,
  returnBook,
} from "../services/borrow.service.js";

const createBorrow = async (req, res, next) => {
  try {
    const { bookId } = req.body;

    if (!bookId || !ObjectId.isValid(bookId)) {
      return res.status(400).json({
        success: false,
        message: "A valid book ID is required.",
      });
    }

    const borrow = await borrowBook({
      bookId,
      userId: req.userId,
      userEmail: req.user.email,
    });

    res.status(201).json({
      success: true,
      message: "Book borrowed successfully.",
      data: borrow,
    });
  } catch (error) {
    if (
      error.code === 11000 ||
      error.message === "You have already borrowed this book."
    ) {
      return res.status(409).json({
        success: false,
        message: "You have already borrowed this book.",
      });
    }

    if (
      error.message === "Book not found or no copies available."
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

const getBorrows = async (req, res, next) => {
  try {
    const borrows = await getUserBorrows(req.userId);

    res.status(200).json({
      success: true,
      message: "Borrow records retrieved successfully.",
      data: borrows,
    });
  } catch (error) {
    next(error);
  }
};

const returnBorrowedBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid borrow ID.",
      });
    }

    const borrow = await returnBook(id, req.userId);

    res.status(200).json({
      success: true,
      message: "Book returned successfully.",
      data: borrow,
    });
  } catch (error) {
    if (error.message === "Active borrow record not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

export {
  createBorrow,
  getBorrows,
  returnBorrowedBook,
};
