const router = require("express").Router();

import { CONFIG } from "../config";
import {
  createNote,
  deleteUserBoookNote,
  getUserBookNote,
  updateUserBoookNote,
} from "../middlewares/note.middleware";

router.post(`${CONFIG.version}/note/create`, createNote);
router.post(`${CONFIG.version}/note/delete`, deleteUserBoookNote);
router.patch(`${CONFIG.version}/note/update`, updateUserBoookNote);
router.get(`${CONFIG.version}/note/getNotes/:userBook`, getUserBookNote);

export { router as noteRoutes };
