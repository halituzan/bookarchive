// book.model.ts
import { Date, Document, Schema, model } from "mongoose";

interface IBook extends Document {
  title: string;
  description: string;
  author: string;
  userId: Schema.Types.ObjectId;
  isFavorite: boolean;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  isDelete: boolean;
  type: string;
}

// type:
// 0-okundu, 1-okunmakta olan, 2-okumak istenilen

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: String, required: true },
    type: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    isFavorite: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);
const Books = model<IBook>("Books", bookSchema);
export default Books;
