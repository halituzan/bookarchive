// note.model.ts
import { Schema, model } from "mongoose";
import { refTypes } from "../types/global.types";
interface INotes extends refTypes {
  user: Schema.Types.ObjectId;
  userBook: Schema.Types.ObjectId;
  note: string;
  notePage: number;
}
const noteSchema = new Schema<INotes>(
  {
    user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    userBook: { type: Schema.Types.ObjectId, ref: "Books", required: true },
    note: { type: String, required: true, maxlength: 256 },
    isDeleted: { type: Boolean, default: false },
    notePage: { type: Number, default: 0 },
  },
  { timestamps: true }
);
const Notes = model<INotes>("Notes", noteSchema);
export default Notes;
