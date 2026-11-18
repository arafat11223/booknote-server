
import { ObjectId } from "mongodb";

import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../services/book.service.js";

import {
  BOOK_CATEGORIES,
  BOOK_VALIDATION,
} from "../constants/book.constants.js";

const getBooks = async (req, res, next) => {
  try {
    const books = await getAllBooks();

    res.status(200).json({
      success: true,
      message: "Books retrieved successfully.",
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID.",
      });
    }

    const book = await getBookById(new ObjectId(id));

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book retrieved successfully.",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

const addBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      category,
      image,
      description,
      totalCopies,
    } = req.body;

    if (
      typeof title !== "string" ||
      typeof author !== "string" ||
      typeof category !== "string" ||
      typeof image !== "string" ||
      typeof description !== "string" ||
      totalCopies === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All book fields are required and must have valid types.",
      });
    }

    if (
      !title.trim() ||
      !author.trim() ||
      !image.trim() ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Book fields cannot be empty.",
      });
    }

    if (
      title.trim().length > BOOK_VALIDATION.MAX_TITLE_LENGTH ||
      author.trim().length > BOOK_VALIDATION.MAX_AUTHOR_LENGTH ||
      description.trim().length >
        BOOK_VALIDATION.MAX_DESCRIPTION_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    if (!BOOK_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book category.",
      });
    }

    const copies = Number(totalCopies);

    if (
      !Number.isInteger(copies) ||
      copies < BOOK_VALIDATION.MIN_COPIES
    ) {
      return res.status(400).json({
        success: false,
        message: "Total copies must be a positive integer.",
      });
    }

    const bookData = {
      title: title.trim(),
      author: author.trim(),
      category,
      image: image.trim(),
      description: description.trim(),
      addedBy: {
        userId: req.userId,
        name: req.user.name,
        email: req.user.email,
      },
      totalCopies: copies,
    };

    const book = await createBook(bookData);

    res.status(201).json({
      success: true,
      message: "Book added successfully.",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

const editBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID.",
      });
    }

    const existingBook = await getBookById(new ObjectId(id));

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    if (existingBook.addedBy.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own books.",
      });
    }

    const { title, author, category, image, description, totalCopies } =
      req.body;

    const updateData = {};

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        !title.trim() ||
        title.trim().length > BOOK_VALIDATION.MAX_TITLE_LENGTH
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid book title.",
        });
      }

      updateData.title = title.trim();
    }

    if (author !== undefined) {
      if (
        typeof author !== "string" ||
        !author.trim() ||
        author.trim().length > BOOK_VALIDATION.MAX_AUTHOR_LENGTH
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid author name.",
        });
      }

      updateData.author = author.trim();
    }

    if (category !== undefined) {
      if (!BOOK_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid book category.",
        });
      }

      updateData.category = category;
    }

    if (image !== undefined) {
      if (typeof image !== "string" || !image.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid image URL.",
        });
      }

      updateData.image = image.trim();
    }

    if (description !== undefined) {
      if (
        typeof description !== "string" ||
        !description.trim() ||
        description.trim().length >
          BOOK_VALIDATION.MAX_DESCRIPTION_LENGTH
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid book description.",
        });
      }

      updateData.description = description.trim();
    }

    if (totalCopies !== undefined) {
      const copies = Number(totalCopies);
      const borrowedCopies =
        existingBook.totalCopies - existingBook.availableCopies;

      if (
        !Number.isInteger(copies) ||
        copies < borrowedCopies ||
        copies < BOOK_VALIDATION.MIN_COPIES
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid total copies value.",
        });
      }

      updateData.totalCopies = copies;
      updateData.availableCopies = copies - borrowedCopies;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    const book = await updateBook(new ObjectId(id), updateData);

    res.status(200).json({
      success: true,
      message: "Book updated successfully.",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};


const removeBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID.",
      });
    }

    const existingBook = await getBookById(new ObjectId(id));

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    if (existingBook.addedBy.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own books.",
      });
    }

    const result = await deleteBook(new ObjectId(id));

    if (!result.deleted) {
      return res.status(409).json({
        success: false,
        message: "This book cannot be deleted while it has active borrows.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};


export {
  getBooks,
  getSingleBook,
  addBook,
  editBook,
  removeBook,
};
