import { Date, Document, Schema, model } from "mongoose";

interface IBookPost extends Document {
  content: string;
  userId: Schema.Types.ObjectId;
  bookId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isDelete: boolean;
}

const bookPostSchema = new Schema<IBookPost>(
  {
    content: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Books", required: true },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const BookPosts = model<IBookPost>("BookPosts", bookPostSchema);
export default BookPosts;
