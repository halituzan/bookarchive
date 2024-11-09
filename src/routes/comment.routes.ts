// src/routes/comment.routes.ts
const router = require("express").Router();

import { CONFIG } from "../config";
import {
  createBookPostComments,
  getBookPostComments,
} from "../middlewares/comment.middleware";

// Kullanıcının paylaşıma yorum ekleme endpointi
router.post(`${CONFIG.version}/posts/create`, createBookPostComments);
router.get(`${CONFIG.version}/posts/:postId`, getBookPostComments);

export { router as bookPostCommentRoutes };
