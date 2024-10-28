const router = require("express").Router();

import { CONFIG } from "../config";
import { uploadProfileImage } from "../middlewares/bucket.middleware";

router.patch(`${CONFIG.apiVersion}/user/uploadProfileImage`, uploadProfileImage);

export { router as userRoutes };
