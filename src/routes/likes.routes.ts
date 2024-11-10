const router = require("express").Router();

import { CONFIG } from "../config";
import { like } from "../middlewares/likes.middleware";
router.get(`${CONFIG.version}/post/:postId`, like);

export { router as likesRoutes };
