const router = require("express").Router();

import { CONFIG } from "../config";
import {
  createBook,
  createBookFromList,
  deleteUserBook,
  getAllBook,
  getAllBookByCategory,
  getUserBook,
  updateBookFromList,
} from "../middlewares/book.middleware";

// Kullanıcının kitap listesine kitap ekleme endpointi
router.post(`${CONFIG.version}/createBook`, createBook);
// Kullanıcının kendisi için kitap ekleme endpointi (Kitap Listesinden)
router.post(`${CONFIG.version}/user/createBookFromList`, createBookFromList);
// Kullanıcının kendisi için eklediği kitabı update ediyor
router.patch(`${CONFIG.version}/user/updateBookFromList`, updateBookFromList);
// Kullanıcıya ait kitapların listesi
router.get(`${CONFIG.version}/user/books/:userName/:type`, getUserBook);
// Kullanıcının kitabını soft delete eden endpoint
router.delete(`${CONFIG.version}/user/books/:bookId`, deleteUserBook);
// Tüm kitapların döndüğü endpoine
router.get(`${CONFIG.version}/book/allBooks`, getAllBook);
// Kategoriye gmre tüm kitapların döndüğü endpoine
router.get(`${CONFIG.version}/book/byCategory/:bookType`, getAllBookByCategory);

export { router as bookRoutes };
