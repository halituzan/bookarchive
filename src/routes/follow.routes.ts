const router = require("express").Router();

import { CONFIG } from "../config";
import {
  followUser,
  getFollowers,
  getFollowing,
  unfollowUser,
} from "../middlewares/follow.middleware";
router.post(`${CONFIG.version}/followUser`, followUser);
router.post(`${CONFIG.version}/unFollowUser`, unfollowUser);
router.get(`${CONFIG.version}/followers/:userId`, getFollowers);
router.get(`${CONFIG.version}/following/:userId`, getFollowing);

export { router as followRoutes };
