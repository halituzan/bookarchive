const router = require("express").Router();

import { CONFIG } from "../config";
import { getAuthorTypes } from "../middlewares/Enums/author.middleware";
import { getBookTypes } from "../middlewares/Enums/bookType.middleware";
import { getPublisherTypes } from "../middlewares/Enums/publisher.middleware";

router.get(`${CONFIG.version}/publishers`, getPublisherTypes);
router.get(`${CONFIG.version}/authors`, getAuthorTypes);
router.get(`${CONFIG.version}/bookTypes`, getBookTypes);

export { router as enumRoutes };
