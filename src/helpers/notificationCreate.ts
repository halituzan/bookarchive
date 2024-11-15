import Notifications from "../models/notification.model";

export const notificationCreate = async (
  user: any,
  content: string,
  connection: string,
  connectionId: any,
  type: "like" | "comment" | "follow" | "announcement" | "message"
) => {
  const notificationPayload: any = {
    user,
    content,
    connection,
    connectionId,
    type,
    isRead: false,
    isDeleted: false,
  };
  const notification = new Notifications(notificationPayload);
  await notification.save();
};
