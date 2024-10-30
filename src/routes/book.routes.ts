const router = require("express").Router();

import { CONFIG } from "../config";
import {
  createBook,
  createBookFromList,
  deleteUserBook,
  getAllBook,
  getAllBookByCategory,
  getUserBook,
} from "../middlewares/book.middleware";

// Kullanıcının kitap listesine kitap ekleme endpointi
router.post(`${CONFIG.apiVersion}/createBook`, createBook);
// Kullanıcının kendisi için kitap ekleme endpointi (Kitap Listesinden)
router.post(`${CONFIG.apiVersion}/user/createBookFromList`, createBookFromList);
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
