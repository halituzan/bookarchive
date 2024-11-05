const router = require("express").Router();

import { CONFIG } from "../config";
import { updateUserBookNote } from "../middlewares/upgradeBooklists";

router.get(`${CONFIG.version}/bookLists`, updateUserBookNote);

export { router as upgradeRoutes };
