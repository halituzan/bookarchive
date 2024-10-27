const router = require("express").Router();

import { CONFIG } from "../config";
import { createBook } from "../middlewares/book.middleware";

// Kitap Ekleme Endpointi
router.post(`${CONFIG.apiVersion}/createBook`, createBook);

export { router as bookRoutes };
