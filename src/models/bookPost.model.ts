import { Date, Document, Schema, model } from "mongoose";

interface IBookPost extends Document {
  content: string;
  user: Schema.Types.ObjectId;
  book: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
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
