const router = require("express").Router();

import { CONFIG } from "../config";
import {
  createBook,
  deleteUserBook,
  getUserBook,
} from "../middlewares/book.middleware";

// Kullanıcının kitap ekleme endpointi
router.post(`${CONFIG.apiVersion}/user/createBook`, createBook);
// Kullanıcıya ait kitapların listesi
router.get(`${CONFIG.apiVersion}/user/books/:userId`, getUserBook);
// Kullanıcının kitabını soft delete eden endpoint
router.delete(`${CONFIG.apiVersion}/user/books/:bookId`, deleteUserBook);

export { router as bookRoutes };
