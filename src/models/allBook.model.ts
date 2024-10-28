// allBook.model.ts
import { Document, Schema, model } from "mongoose";

interface IAllBook extends Document {
  name: string;
  author: string;
  publisher: string;
  publication_year: number;
  ISBN: number;
  book_type: string;
  explanation: string;
  book_img: string;
}

const allBookSchema = new Schema<IAllBook>(
  {
    name: String,
    author: String,
    publisher: String,
    publication_year: Number,
    ISBN: Number,
    book_type: String,
    explanation: String,
    book_img: String,
  },
  { timestamps: true }
);
const AllBooks = model<IAllBook>("AllBooks", allBookSchema);
export default AllBooks;
