// allBook.model.ts
import { Document, Schema, model } from "mongoose";

interface IAllBook extends Document {
  name: string | number;
  author: Schema.Types.ObjectId;
  publisher: Schema.Types.ObjectId;
  publication_year: number;
  book_type: Schema.Types.ObjectId;
  pages_count: number;
  explanation?: string;
  ISBN?: number | null;
  book_img?: string | null;
}

const allBookSchema = new Schema<IAllBook>(
  {
    name: { type: String },
    author: { type: Schema.Types.ObjectId, ref: "AuthorTypes", required: true },
    publisher: {
      type: Schema.Types.ObjectId,
      ref: "PublisherTypes",
      required: true,
    },
    publication_year: Number,
    book_type: {
      type: Schema.Types.ObjectId,
      ref: "BookTypes",
      required: true,
    },
    pages_count: { type: Number, required: true },
    explanation: { type: String, default: "" },

    ISBN: { type: Number, default: null },
    book_img: { type: String, default: "" },
  },
  { timestamps: true }
);
const BookLists = model<IAllBook>("BookLists", allBookSchema);
export default BookLists;
