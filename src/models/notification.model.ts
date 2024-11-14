// notification.model.ts
import { Schema, model } from "mongoose";
import { refTypes } from "../types/global.types";
interface INotification extends refTypes {
  user: Schema.Types.ObjectId;
  content: string;
  isRead: boolean;
}
const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    content: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Notifications = model<INotification>("Notifications", notificationSchema);
export default Notifications;
