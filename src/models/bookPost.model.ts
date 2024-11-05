import { Schema, model } from "mongoose";
import { refTypes } from "../types/global.types";

interface IBookPost extends refTypes {
  content: string;
  user: Schema.Types.ObjectId;
  book: Schema.Types.ObjectId;
}

const bookPostSchema = new Schema<IBookPost>(
  {
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    book: { type: Schema.Types.ObjectId, ref: "Books", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const BookPosts = model<IBookPost>("BookPosts", bookPostSchema);
export default BookPosts;
