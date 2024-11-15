import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import tokenCheck from "../helpers/tokenCheck";
import Books from "../models/book.model";
import BookPosts from "../models/bookPost.model";
import Users from "../models/user.model";
type BookPostProps = {
  content: string;
  user: string;
  book: string;
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
        book: bookId,
        user: userId,
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
  const token = req.headers.authorization?.split("Bearer ")[1];
  let userId: any = {};
  if (typeof token == "string" && token !== "undefined") {
    const secretKey = process.env.JWT_SECRET_KEY || "";
    userId = jwt.verify(token, secretKey);
  }
  const { userName } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortDirection = req.query.sort === "asc" ? 1 : -1;

  const user = await Users.findOne({ userName: userName });
  if (!user) {
    return res
      .status(400)
      .json({ message: "Böyle bir kullanıcı mevcut değil." });
  }

  const posts = await BookPosts.find({ user: user.id, isDeleted: false })
    .populate({
      path: "book",
      populate: {
        path: "bookId",
        populate: {
          path: "author",
        },
      },
    })
    .populate({
      path: "user",
      select: "-password -__v",
    })
    .populate({
      path: "comments",
      match: { isDeleted: false },
      populate: {
        path: "user",
        select: "-password -__v",
      },
    })
    .populate({
      path: "likes",
      match: { isDeleted: false },
      populate: {
        path: "post",
      },
    })
    .select("-__v")
    .sort({ createdAt: sortDirection })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

  let updatedPosts: any = [];

  if (userId.userId) {
    updatedPosts = posts.map((post) => {
      if (!userId.userId) {
        return;
      }
      const isLiked = post.likes.some((like: any) =>
        like?.user?.equals(userId.userId)
      ); // userId burada mevcut kullanıcı ID'si

      return {
        ...post.toObject(), // Mongoose dokümanını düz obje olarak alır
        isLiked, // isLiked alanını ekliyoruz
      };
    });
  }

  const total = await BookPosts.countDocuments({
    user: user._id,
    isDeleted: false,
  });

  return res.json({
    status: true,
    page,
    totalPages: Math.ceil(total / limit),
    total,
    limit,
    sort: req.query.sort || "desc",
    data: userId.userId ? updatedPosts : posts,
  });
};

// Tüm paylaşımların çekildiği endpoint
export const getPosts = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  let userId: any = {};
  if (typeof token == "string" && token !== "undefined") {
    const secretKey = process.env.JWT_SECRET_KEY || "";
    userId = jwt.verify(token, secretKey);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortDirection = req.query.sort === "asc" ? 1 : -1;

  const posts = await BookPosts.find({ isDeleted: false })
    // .populate("user", "userName firstName lastName image") // Users koleksiyonundaki user bilgilerini çekmek için
    // .populate("book", "title author description type image") // Books koleksiyonundaki book bilgilerini çekmek için
    .populate({
      path: "book",
      populate: {
        path: "bookId", // Populate the bookId within book
        populate: {
          path: "author",
        },
      },
    })
    .populate({
      path: "user",
      select: "-password -__v",
    })
    .populate({
      path: "comments",
      match: { isDeleted: false },
      populate: {
        path: "user",
        select: "-password -__v",
      },
    })
    .populate({
      path: "likes",
      match: { isDeleted: false },
      populate: {
        path: "user",
      },
    })
    .sort({ createdAt: sortDirection }) // oluşturma tarihine göre sıralama
    .skip((page - 1) * limit) // Sayfalama için atlama
    .limit(limit)
    .exec();

  let updatedPosts: any = [];

  if (userId.userId) {
    updatedPosts = posts.map((post) => {
      if (!userId.userId) {
        return;
      }
      const isLiked = post.likes.some((like: any) =>
        like?.user?.equals(userId.userId)
      ); // userId burada mevcut kullanıcı ID'si

      return {
        ...post.toObject(), // Mongoose dokümanını düz obje olarak alır
        isLiked, // isLiked alanını ekliyoruz
      };
    });
  }

  // Toplam kitap sayısı
  const total = await BookPosts.countDocuments({ isDeleted: false });
  return res.json({
    status: true,
    page,
    totalPages: Math.ceil(total / limit),
    total,
    limit,
    sort: req.query.sort || "desc",
    data: userId.userId ? updatedPosts : posts,
  });
};

export const getSinglePost = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { postId } = req.params;
  if (!postId)
    return res.json({ status: false, message: "postId gereklidir." });

  try {
    const data = await BookPosts.findById(postId)
      .populate({
        path: "book",
        populate: {
          path: "bookId", // Populate the bookId within book
          populate: {
            path: "author",
          },
        },
      })
      .populate({
        path: "user",
        select: "-password -__v",
      })
      .populate({
        path: "comments",
        match: { isDeleted: false },
        populate: {
          path: "user",
          select: "-password -__v",
        },
      })
      .populate({
        path: "likes",
        match: { isDeleted: false },
        populate: {
          path: "user",
          select: "-password -__v",
        },
      });
    return res.json({
      status: true,
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: error });
  }
};
