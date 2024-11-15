const router = require("express").Router();

import { CONFIG } from "../config";
import {
  createMessage,
  userMessageList,
} from "../middlewares/message.middleware";
router.post(`${CONFIG.version}/create`, createMessage);
router.get(`${CONFIG.version}/userList`, userMessageList);

export { router as messageRoutes };
