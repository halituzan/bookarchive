// notification.model.ts
import { Schema, model } from "mongoose";
import { refTypes } from "../types/global.types";
interface INotification extends refTypes {
  user: Schema.Types.ObjectId;
  content: string;
  connection: "post" | "profile" | "recommended" | undefined;
  connectionId: string;
  isRead: boolean;
}

const enumTypes = ["post", "profile", "recommended", ""];

// connection and connectionId
// post || profile ||
const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    content: { type: String, default: "" },
    connection: { type: String, enum: [...enumTypes] },
    connectionId: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Notifications = model<INotification>("Notifications", notificationSchema);
export default Notifications;
