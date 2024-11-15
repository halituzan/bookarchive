const router = require("express").Router();

import { CONFIG } from "../config";
import {
  createNotification,
  getNotifications,
  readNotification,
} from "../middlewares/notification.middleware";

router.post(`${CONFIG.version}/create`, createNotification);
router.get(`${CONFIG.version}/read/:notificationId`, readNotification);
router.get(`${CONFIG.version}/all`, getNotifications);

export { router as notificationRoutes };
