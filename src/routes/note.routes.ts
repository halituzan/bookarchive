const router = require("express").Router();

import { CONFIG } from "../config";
import { createNote } from "../middlewares/note.middleware";

router.post(`${CONFIG.version}/note/create`, createNote);

export { router as noteRoutes };
