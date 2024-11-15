// notification.model.ts
import { Schema, model } from "mongoose";
import { refTypes } from "../types/global.types";
interface INotification extends refTypes {
  user: Schema.Types.ObjectId;
  content: string;
  connection: "post" | "profile" | "recommended" | undefined;
  connectionId: string;
  type: "like" | "comment" | "follow" | "announcement" | "message";
  isRead: boolean;
}

const enumTypes = ["post", "profile", "recommended", ""];
const typeType = ["like", "comment", "follow", "announcement", "message"];

// connection and connectionId
// post || profile ||
const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    content: { type: String, default: "" },
    connection: { type: String, enum: [...enumTypes] },
    type: { type: String, enum: [...typeType] },
    connectionId: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Notifications = model<INotification>("Notifications", notificationSchema);
export default Notifications;
