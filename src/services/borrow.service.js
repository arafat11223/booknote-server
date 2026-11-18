
import { ObjectId } from "mongodb";
import { client, db } from "../config/db.js";

const borrowBook = async (borrowData) => {
  const session = client.startSession();

  try {
    let borrowRecord;

    await session.withTransaction(async () => {
      const bookId = new ObjectId(borrowData.bookId);

      const existingBorrow = await db.collection("borrows").findOne(
        {
          bookId,
          userId: borrowData.userId,
          status: "borrowed",
        },
        { session }
      );

      if (existingBorrow) {
        throw new Error("You have already borrowed this book.");
      }

      const book = await db.collection("books").findOneAndUpdate(
        {
          _id: bookId,
          availableCopies: { $gt: 0 },
        },
        {
          $inc: { availableCopies: -1 },
          $set: { updatedAt: new Date() },
        },
        {
          returnDocument: "after",
          session,
        }
      );

      if (!book) {
        throw new Error("Book not found or no copies available.");
      }

      const now = new Date();
      const returnDate = new Date(now);
      returnDate.setDate(returnDate.getDate() + 14);

      borrowRecord = {
        bookId,
        bookTitle: book.title,
        bookImage: book.image,
        userId: borrowData.userId,
        userEmail: borrowData.userEmail,
        borrowDate: now,
        returnDate,
        status: "borrowed",
      };

      const result = await db.collection("borrows").insertOne(
        borrowRecord,
        { session }
      );

      borrowRecord._id = result.insertedId;
    });

    return borrowRecord;
  } finally {
    await session.endSession();
  }
};

const getUserBorrows = async (userId) => {
  return await db
    .collection("borrows")
    .find({ userId })
    .sort({ borrowDate: -1 })
    .toArray();
};

const returnBook = async (borrowId, userId) => {
  const session = client.startSession();

  try {
    let returnedRecord;

    await session.withTransaction(async () => {
      const borrow = await db.collection("borrows").findOne(
        {
          _id: new ObjectId(borrowId),
          userId,
          status: "borrowed",
        },
        { session }
      );

      if (!borrow) {
        throw new Error("Active borrow record not found.");
      }

      const result = await db.collection("borrows").updateOne(
        {
          _id: borrow._id,
          status: "borrowed",
        },
        {
          $set: {
            status: "returned",
            returnedAt: new Date(),
          },
        },
        { session }
      );

      if (result.modifiedCount !== 1) {
        throw new Error("Book return failed.");
      }

      await db.collection("books").updateOne(
        { _id: borrow.bookId },
        {
          $inc: { availableCopies: 1 },
          $set: { updatedAt: new Date() },
        },
        { session }
      );

      returnedRecord = {
        ...borrow,
        status: "returned",
        returnedAt: new Date(),
      };
    });

    return returnedRecord;
  } finally {
    await session.endSession();
  }
};

export {
  borrowBook,
  getUserBorrows,
  returnBook,
};
