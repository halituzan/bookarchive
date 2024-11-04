const router = require("express").Router();

import { CONFIG } from "../config";
import { uploadProfileImage } from "../middlewares/bucket.middleware";
import { getUserProfile, me, updateProfile } from "../middlewares/user.middleware";
router.get(`${CONFIG.version}/user/me`, me);
router.patch(`${CONFIG.version}/user/uploadProfileImage`, uploadProfileImage);
router.patch(`${CONFIG.version}/user/updateProfile`, updateProfile);
router.get(`${CONFIG.version}/user/profile/:userName`,getUserProfile);

export { router as userRoutes };
