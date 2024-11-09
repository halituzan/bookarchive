const router = require("express").Router();

import { CONFIG } from "../config";
import { createBookPostComments } from "../middlewares/comment.middleware";

// Kullanıcının paylaşıma yorum ekleme endpointi
router.post(`${CONFIG.version}/posts/create`, createBookPostComments);

export { router as bookPostCommentRoutes };
