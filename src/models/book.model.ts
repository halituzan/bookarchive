// book.model.ts
import { Date, Document, Schema, model } from "mongoose";
interface IBook extends Document {
  type: string;
  userId: Schema.Types.ObjectId;
  bookId: Schema.Types.ObjectId;
  // book: Schema.Types.ObjectId;
  process: object;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  slug?: string;
}

// type:
// 0-okundu, 1-okunmakta olan, 2-okumak istenilen

const bookSchema = new Schema<IBook>(
  {
    type: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "BookLists", required: true },
    // book: { type: Schema.Types.ObjectId, ref: "BookLists", required: true },
    process: { type: Object, required: true },
    slug: { type: String },
    isFavorite: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Books = model<IBook>("Books", bookSchema);
export default Books;
