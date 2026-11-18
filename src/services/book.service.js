
import { booksCollection } from "../config/collections.js";

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
  const result = await booksCollection.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  return result;
};

const deleteBook = async (id) => {
  return await booksCollection.deleteOne({ _id: id });
};

export {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
