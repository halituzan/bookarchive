const router = require("express").Router();

import { CONFIG } from "../config";
import {
  createBook,
  deleteUserBook,
  getAllBook,
  getAllBookByCategory,
  getUserBook,
} from "../middlewares/book.middleware";

// Kullanıcının kitap ekleme endpointi
router.post(`${CONFIG.apiVersion}/user/createBook`, createBook);
// Kullanıcıya ait kitapların listesi
router.get(`${CONFIG.apiVersion}/user/books/:userId/:type`, getUserBook);
// Kullanıcının kitabını soft delete eden endpoint
router.delete(`${CONFIG.apiVersion}/user/books/:bookId`, deleteUserBook);
// Tüm kitapların döndüğü endpoine
router.get(`${CONFIG.apiVersion}/book/allBooks`, getAllBook);
// Kategoriye gmre tüm kitapların döndüğü endpoine
router.get(
  `${CONFIG.apiVersion}/book/byCategory/:bookType`,
  getAllBookByCategory
);

export { router as bookRoutes };
