const router = require("express").Router();

import { CONFIG } from "../config";
import { uploadProfileImage } from "../middlewares/bucket.middleware";
import { me, updateProfile } from "../middlewares/user.middleware";
router.get(`${CONFIG.apiVersion}/user/me`, me);
router.patch(
  `${CONFIG.apiVersion}/user/uploadProfileImage`,
  uploadProfileImage
);
router.patch(`${CONFIG.apiVersion}/user/updateProfile`, updateProfile);

export { router as userRoutes };
