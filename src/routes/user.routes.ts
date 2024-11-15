const router = require("express").Router();

import { CONFIG } from "../config";
import { uploadProfileImage } from "../middlewares/bucket.middleware";
import { getUserProfile, me, updateProfile } from "../middlewares/user.middleware";
router.get(`${CONFIG.version}/me`, me);
router.patch(`${CONFIG.version}/uploadProfileImage`, uploadProfileImage);
router.patch(`${CONFIG.version}/updateProfile`, updateProfile);
router.get(`${CONFIG.version}/profile/:userName`,getUserProfile);

export { router as userRoutes };
