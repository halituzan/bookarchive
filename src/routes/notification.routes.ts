const router = require("express").Router();

import { CONFIG } from "../config";
import {
  createNotification,
  readNotification,
} from "../middlewares/notification.middleware";

router.post(`${CONFIG.version}/create`, createNotification);
router.get(`${CONFIG.version}/read/:notificationId`, readNotification);

export { router as notificationRoutes };
