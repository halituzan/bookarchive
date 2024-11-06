const router = require("express").Router();

import { CONFIG } from "../../config";
import {
  authorSearchOpenLibrary,
  titleSearchOpenLibrary,
} from "../../middlewares/ThirdPartiesApi/openLibrary.middleware";

router.get(`${CONFIG.version}/title/search`, titleSearchOpenLibrary);
router.get(`${CONFIG.version}/author/search`, authorSearchOpenLibrary);

export { router as openLibraryRoutes };
