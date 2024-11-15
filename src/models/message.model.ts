// message.model.ts
import { Schema, model, Mixed, isValidObjectId, Types } from "mongoose";
import { refTypes } from "../types/global.types";
interface IMessages extends refTypes {
  receiver: Schema.Types.ObjectId; // alıcı
  sender: Schema.Types.ObjectId; // gönderen
  messageRowId: Schema.Types.ObjectId;
  message: string;
  isRead: boolean;
  deletedFor: object;
  connectionType?:
    | "text"
    | "textWithPost"
    | "textWithProfile"
    | "textWithBook"
    | null;
  connection?: "postId" | "profile" | "bookId" | null;
}
const messagesSchema = new Schema<IMessages>(
  {
    receiver: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    messageRowId: {
      type: Schema.Types.ObjectId,
      required: true,
      default: () => new Types.ObjectId(), // Eğer gelmezse otomatik oluştur
    },
    message: { type: String },
    isRead: { type: Boolean, default: false },
    deletedFor: { type: Array, default: [] },
    connectionType: { type: String, default: null },
    connection: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Messages = model<IMessages>("Messages", messagesSchema);
export default Messages;
