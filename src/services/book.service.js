
import { booksCollection, borrowsCollection } from "../config/collections.js";

const getAllBooks = async () => {
  return await booksCollection
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
};

const getBookById = async (id) => {
  return await booksCollection.findOne({ _id: id });
};

const createBook = async (bookData) => {
  const now = new Date();

  const newBook = {
    ...bookData,
    availableCopies: bookData.totalCopies,
    createdAt: now,
    updatedAt: now,
  };

  const result = await booksCollection.insertOne(newBook);

  return {
    ...newBook,
    _id: result.insertedId,
  };
};

const updateBook = async (id, updateData) => {
  return await booksCollection.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );
};

const deleteBook = async (id) => {
  const activeBorrow = await borrowsCollection.findOne({
    bookId: id,
    status: "borrowed",
  });

  if (activeBorrow) {
    return {
      deleted: false,
      reason: "ACTIVE_BORROWS_EXIST",
    };
  }

  const result = await booksCollection.deleteOne({ _id: id });

  return {
    deleted: result.deletedCount === 1,
  };
};

export {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
