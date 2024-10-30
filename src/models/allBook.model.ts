// allBook.model.ts
import { Document, Schema, model } from "mongoose";

interface IAllBook extends Document {
  name: string | number;
  author: string;
  publisher: string;
  publication_year: number;
  book_type: string;
  explanation?: string;
  ISBN?: number | null;
  book_img?: string | null;
}

const allBookSchema = new Schema<IAllBook>(
  {
    name: { type: String },
    author: String,
    publisher: String,
    publication_year: Number,
    book_type: String,
    explanation: { type: String, default: "" },
    ISBN: { type: Number, default: null },
    book_img: { type: String, default: "" },
  },
  { timestamps: true }
);
const AllBooks = model<IAllBook>("AllBooks", allBookSchema);
export default AllBooks;
