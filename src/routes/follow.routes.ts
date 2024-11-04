const router = require("express").Router();

import { CONFIG } from "../config";
import {
  followUser,
  getFollowers,
  getFollowing,
  unfollowUser,
} from "../middlewares/follow.middleware";
router.post(`${CONFIG.version}/follow/followUser`, followUser);
router.post(`${CONFIG.version}/follow/unFollowUser`, unfollowUser);
router.get(`${CONFIG.version}/follow/followers/:userId`, getFollowers);
router.get(`${CONFIG.version}/follow/following/:userId`, getFollowing);

export { router as followRoutes };
