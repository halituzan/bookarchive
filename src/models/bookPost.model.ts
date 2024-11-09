// src/models/bookPost.model.ts
import { Schema, model } from "mongoose";
import { refTypes } from "../types/global.types";

interface IBookPost extends refTypes {
  content: string;
  user: Schema.Types.ObjectId;
  book: Schema.Types.ObjectId;
  comments: Schema.Types.ObjectId[];
  commentCount?: number; // Optional olarak tanımlanır, sanal alan
  likeCount?: number;
}

const bookPostSchema = new Schema<IBookPost>(
  {
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    book: { type: Schema.Types.ObjectId, ref: "Books", required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: "BookPostsComments" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Sanal alan olarak yorum sayısını ekleyin
bookPostSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

const BookPosts = model<IBookPost>("BookPosts", bookPostSchema);
export default BookPosts;
