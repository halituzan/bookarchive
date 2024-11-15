import Notifications from "../models/notification.model";

export const notificationCreate = async (
  user: string,
  content: string,
  connection: string,
  connectionId: any
) => {
  const notificationPayload: any = {
    user,
    content,
    connection,
    connectionId,
    isRead: false,
    isDeleted: false,
  };
  const notification = new Notifications(notificationPayload);
  await notification.save();
};
