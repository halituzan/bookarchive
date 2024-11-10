// src/models/bookPostComment.model.ts
import { Schema, model } from "mongoose";
import { refTypes } from "../types/global.types";

interface IBookPostLikes extends refTypes {
  user: Schema.Types.ObjectId;
  post: Schema.Types.ObjectId;
}

const bookPostLikesSchema = new Schema<IBookPostLikes>(
  {
    user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    post: { type: Schema.Types.ObjectId, ref: "BookPosts", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const BookPostsLikes = model<IBookPostLikes>(
  "BookPostsLikes",
  bookPostLikesSchema
);
export default BookPostsLikes;
