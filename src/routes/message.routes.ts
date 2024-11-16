const router = require("express").Router();

import { CONFIG } from "../config";
import {
  createMessage,
  userMessage,
  userMessageList,
} from "../middlewares/message.middleware";
router.post(`${CONFIG.version}/create`, createMessage);
router.get(`${CONFIG.version}/userList`, userMessageList);
router.get(`${CONFIG.version}/user/:messageRowId`, userMessage);

export { router as messageRoutes };
