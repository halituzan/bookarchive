import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Books from "../models/book.model";
import Users from "../models/user.model";
import tokenCheck from "../helpers/tokenCheck";
import BookPosts from "../models/bookPost.model";
type BookPostProps = {
  content: string;
  userId: string;
  bookId: string;
};
// Kullanıcının paylaşım oluşturduğu endpoint
export const createBookPost = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { content, bookId } = req.body;
  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";

  if (!bookId) {
    return res
      .status(400)
      .json({ status: false, message: "Lütfen bir kitap seçin." });
  }

  try {
    jwt.verify(token, secretKey, async (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: "Geçersiz token" });
      }
      const userId = decoded?.userId;
      if (!userId) {
        return res.status(401).json({
          status: false,
          message: "Böyle bir kullanıcı mevcut değil.",
        });
      }
      // Tablodan ilgili userId ile user a ulaşıyoruz.
      const user = await Users.findById(userId);
      if (!user) {
        return res
          .status(401)
          .json({ message: "Böyle bir kullanıcı mevcut değil." });
      }

      const book = await Books.findById(bookId);
      if (!book) {
        return res
          .status(401)
          .json({ message: "Böyle bir kitap mevcut değil." });
      }

      let payload: BookPostProps = {
        content,
        bookId,
        userId,
      };

      const newBook = new BookPosts(payload);

      await newBook.save();
      return res.json({
        status: true,
        message: "Paylaşım başarılı bir şekilde oluşturuldu.",
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
// Kullanıcının paylaşımlarını çektiği endpoint
export const getUserPosts = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortDirection = req.query.sort === "asc" ? 1 : -1;
  // Tablodan ilgili userId ile user a ulaşıyoruz.
  const user = await Users.findById(userId);
  if (!user) {
    return res
      .status(400)
      .json({ message: "Böyle bir kullanıcı mevcut değil." });
  }
  const posts = await BookPosts.find({ userId, isDelete: false })
    .sort({ createdAt: sortDirection }) // oluşturma tarihine göre sıralama
    .skip((page - 1) * limit) // Sayfalama için atlama
    .limit(limit)
    .exec();
  // Toplam kitap sayısı
  const total = await BookPosts.countDocuments({ userId, isDelete: false });
  return res.json({
    status: true,
    page,
    totalPages: Math.ceil(total / limit),
    total,
    limit,
    sort: req.query.sort || "desc",
    data: posts,
  });
};
// Tüm paylaşımların çekildiği endpoint
export const getPosts = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortDirection = req.query.sort === "asc" ? 1 : -1;

  const posts = await BookPosts.find({ isDelete: false })
    .sort({ createdAt: sortDirection }) // oluşturma tarihine göre sıralama
    .skip((page - 1) * limit) // Sayfalama için atlama
    .limit(limit)
    .exec();
  // Toplam kitap sayısı
  const total = await BookPosts.countDocuments({ isDelete: false });
  return res.json({
    status: true,
    page,
    totalPages: Math.ceil(total / limit),
    total,
    limit,
    sort: req.query.sort || "desc",
    data: posts,
  });
};
