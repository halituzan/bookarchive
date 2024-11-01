const router = require("express").Router();

import { CONFIG } from "../config";
import { getAuthorTypes } from "../middlewares/Enums/author.middleware";
import { getBookTypes } from "../middlewares/Enums/bookType.middleware";
import { getPublisherTypes } from "../middlewares/Enums/publisher.middleware";

router.get(`${CONFIG.apiVersion}/enum/publishers`, getPublisherTypes);
router.get(`${CONFIG.apiVersion}/enum/authors`, getAuthorTypes);
router.get(`${CONFIG.apiVersion}/enum/bookTypes`, getBookTypes);

export { router as enumRoutes };
