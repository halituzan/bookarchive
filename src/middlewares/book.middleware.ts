import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Books from "../models/book.model";
import Users from "../models/user.model";
import tokenCheck from "../helpers/tokenCheck";
type BookProps = {
  title: string;
  description: string;
  userId: string;
  author: string;
  isFavorite?: boolean;
  image?: string;
};

// User a kitap ekleniyor
export const createBook = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { title, description, author, isFavorite, image } = req.body;
  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";

  try {
    jwt.verify(token, secretKey, async (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Geçersiz token" });
      }
      const userId = decoded?.userId;
      if (!userId) {
        return res
          .status(403)
          .json({ message: "Böyle bir kullanıcı mevcut değil." });
      }
      // Tablodan ilgili userId ile user a ulaşıyoruz.
      const user = await Users.findById(userId);
      if (!user) {
        return res
          .status(403)
          .json({ message: "Böyle bir kullanıcı mevcut değil." });
      }

      let payload: BookProps = {
        title,
        description,
        author,
        userId,
      };

      if (isFavorite) payload.isFavorite = true;
      if (image) payload.image = image;

      const newBook = new Books(payload);

      await newBook.save();
      return res.json({
        status: true,
        message: "Kitap başarılı bir şekilde eklendi",
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};

// User a ait kitaplar listeleniyor
export const getUserBook = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortType = req.query.sortType ?? "createdAt";
  const sortDirection = req.query.sort === "asc" ? 1 : -1;

  try {
    const data = await Books.find({ userId, isDelete: false })
      .sort({ [sortType as string]: sortDirection }) // sortType alanına göre sıralama
      .skip((page - 1) * limit) // Sayfalama için atlama
      .limit(limit)
      .exec();

    // Toplam kitap sayısı
    const total = await Books.countDocuments({ userId, isDelete: false });

    return res.json({
      status: true,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      limit,
      sort: req.query.sort || "desc",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};

// User a ait kitabı soft delete eder
export const deleteUserBook = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { bookId } = req.params;
  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";

  try {
    jwt.verify(token, secretKey, async (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Geçersiz token" });
      }

      const userId = decoded?.userId;

      if (!userId) {
        return res
          .status(403)
          .json({ message: "Böyle bir kullanıcı mevcut değil." });
      }

      const user = await Users.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı." });
      }
      // Kitabı isDelete alanını true yaparak soft delete işlemi
      const updatedBook = await Books.findOneAndUpdate(
        { _id: bookId, userId },
        { isDelete: true },
        { new: true }
      );
      console.log("updatedBook", updatedBook);

      if (!updatedBook) {
        return res.status(404).json({
          status: false,
          message: "Kitap bulunamadı veya zaten silinmiş.",
        });
      }

      return res.json({
        status: true,
        message: "Kitap başarılı bir şekilde silindi.",
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
