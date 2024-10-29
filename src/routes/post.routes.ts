const router = require("express").Router();

import { CONFIG } from "../config";
import { createBookPost, getPosts, getUserPosts } from "../middlewares/post.middleware";

// Kullanıcının paylaşım ekleme endpointi
router.post(`${CONFIG.apiVersion}/posts/user/create`, createBookPost);
// Kullanıcının paylaşımlarının çekildiği endpoint
router.get(`${CONFIG.apiVersion}/posts/user/get/:userId`, getUserPosts);
// Tüm paylaşımların çekildiği endpoint
router.get(`${CONFIG.apiVersion}/posts/get/`, getPosts);

export { router as bookPostRoutes };
