
import { db } from "./db.js";

const booksCollection = db.collection("books");
const borrowsCollection = db.collection("borrows");

export { booksCollection, borrowsCollection };
