const router = require("express").Router();

import { CONFIG } from "../config";
import { followUser, unfollowUser } from "../middlewares/follow.middleware";
router.post(`${CONFIG.version}/follow/followUser`, followUser);
router.post(`${CONFIG.version}/follow/unFollowUser`, unfollowUser);

export { router as followRoutes };

