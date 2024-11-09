const router = require("express").Router();

import { CONFIG } from "../config";
import {
  createBookPost,
  getPosts,
  getSinglePost,
  getUserPosts,
} from "../middlewares/post.middleware";

// Kullanıcının paylaşım ekleme endpointi
router.post(`${CONFIG.version}/posts/user/create`, createBookPost);
// Kullanıcının paylaşımlarının çekildiği endpoint
router.get(`${CONFIG.version}/posts/user/get/:userName`, getUserPosts);
// Tüm paylaşımların çekildiği endpoint
router.get(`${CONFIG.version}/posts/get/`, getPosts);
// Tek Bir paylaşımın çekildiği endpoint
router.get(`${CONFIG.version}/posts/single/:postId`, getSinglePost);

export { router as bookPostRoutes };
