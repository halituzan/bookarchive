const router = require("express").Router();

import { CONFIG } from "../config";
import {
  createNote,
  deleteUserBoookNote,
  getUserBookNote,
  updateUserBoookNote,
} from "../middlewares/note.middleware";

router.post(`${CONFIG.version}/create`, createNote);
router.post(`${CONFIG.version}/delete`, deleteUserBoookNote);
router.patch(`${CONFIG.version}/update`, updateUserBoookNote);
router.get(`${CONFIG.version}/getNotes/:userBook`, getUserBookNote);

export { router as noteRoutes };
