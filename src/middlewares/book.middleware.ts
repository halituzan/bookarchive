import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Books from "../models/book.model";
import Users from "../models/user.model";
import tokenCheck from "../helpers/tokenCheck";
import AllBooks from "../models/allBook.model";
import categoryTypes from "../helpers/categoryTypes";
type BookProps = {
  title: string;
  description: string;
  userId: string;
  author: string;
  type: string;
  isFavorite?: boolean;
  image?: string;
};

// User a kitap ekleniyor
export const createBook = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { title, description, author, isFavorite, image, type } = req.body;
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
        type,
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

// Tüm kitaplar listelenir
export const getAllBook = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortType = req.query.sortType ?? "name";
  const sortDirection = req.query.sort === "asc" ? 1 : -1;

  const searchType = req.query.searchType ?? "name";
  const searchValue =
    typeof req.query.search === "string"
      ? req.query.search.toLocaleLowerCase()
      : "";

  // Dinamik arama kriteri oluştur
  const matchStage: any = {};
  if (searchType && searchValue) {
    matchStage.$expr = {
      $regexMatch: {
        input: { $toLower: `$${searchType}` },
        regex: `.*${searchValue}.*`,
      },
    };
  }

  try {
    const data = await AllBooks.aggregate([
      { $match: matchStage },
      { $sort: { [sortType as string]: sortDirection } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    // Toplam kitap sayısı
    const total = await AllBooks.countDocuments(matchStage);

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
// Kategoriye göre tüm kitaplar listelenir
export const getAllBookByCategory = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { bookType } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortType = req.query.sortType ?? "name";
  const sortDirection = req.query.sort === "asc" ? 1 : -1;

  const categoryType = categoryTypes(bookType);
  console.log("categoryType", categoryType);

  // Geçerli bir kategori bulunmazsa hata döndürür
  if (!categoryType) {
    return res
      .status(400)
      .json({ status: false, message: "Geçersiz kategori" });
  }

  // Dinamik arama kriteri oluşturur
  let searchCriteria: any = {
    book_type: {
      $regex: `.*${categoryType}.*`,
      $options: "i",
    },
  };

  try {
    const data = await AllBooks.aggregate([
      { $match: searchCriteria },
      { $sort: { [sortType as string]: sortDirection } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    // Toplam kitap sayısı
    const total = await AllBooks.countDocuments(searchCriteria);

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
