import { Schema, model } from "mongoose";
import { refTypes } from "../types/global.types";

interface IBookPostComments extends refTypes {
  content: string;
  user: Schema.Types.ObjectId;
  post: Schema.Types.ObjectId;
}

const bookPostCommentsSchema = new Schema<IBookPostComments>(
  {
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    post: { type: Schema.Types.ObjectId, ref: "BookPosts", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const BookPostsComments = model<IBookPostComments>(
  "BookPostsComments",
  bookPostCommentsSchema
);
export default BookPostsComments;
