import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Books from "../models/book.model";
import Users from "../models/user.model";
import tokenCheck from "../helpers/tokenCheck";
import categoryTypes from "../helpers/categoryTypes";
import { tokenErrorMessage } from "../helpers/tokenErrorMessage";
import BookLists from "../models/allBook.model";
import slugify from "slugify";
import { generateCode } from "../helpers/slugHelpers/generateCode";
import { generateSlug } from "../helpers/slugHelpers/slugGenerator";
type CreateBookProps = {
  name: string;
  author: string;
  publisher: string;
  publication_year: number;
  ISBN?: number;
  book_type: string;
  explanation?: string;
  book_img?: string;
  userId: string;
  slug?: string;
};
type BookProps = {
  title?: string;
  description?: string;
  userId?: string;
  author?: string;
  type?: string;
  isFavorite?: boolean;
  image?: string;
  bookId?: string;
  book?: string;
  process?: any;
  slug?: string;
  userBookId?: string;
};

// Tüm kitapların listesine kitap ekleniyor
export const createBook = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const {
    name,
    author,
    publisher,
    publication_year,
    ISBN,
    book_type,
    explanation,
    book_img,
  } = req.body;
  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";

  try {
    jwt.verify(token, secretKey, async (err: any, decoded: any) => {
      const errorResponse = await tokenErrorMessage(err, res, decoded?.userId);
      if (errorResponse) return;
      const userId = decoded?.userId;
      const user = await Users.findById(userId);
      if (!user) {
        return res
          .status(403)
          .json({ message: "Böyle bir kullanıcı mevcut değil." });
      }

      let payload: CreateBookProps = {
        name,
        author,
        publisher,
        publication_year,
        book_type,
        explanation,
        userId,
      };
      const slug = slugify(name);
      console.log("slug", slug);

      const bookSlugChecked = await Books.findOne({ slug });

      if (bookSlugChecked) {
        const code = generateCode();
        payload.slug = slug + "-" + code.toUpperCase();
      } else {
        payload.slug = slug;
      }

      if (book_img) payload.book_img = book_img;
      if (ISBN) payload.ISBN = ISBN;

      const newBook = new BookLists(payload);

      await newBook.save();
      return res.json({
        status: true,
        message: "Kitap başarılı bir şekilde eklendi",
        data: newBook,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
// User a kitap ekleniyor
export const createBookFromList = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { bookId, isFavorite, type, readCount } = req.body;
  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";

  try {
    jwt.verify(token, secretKey, async (err: any, decoded: any) => {
      const errorResponse = await tokenErrorMessage(err, res, decoded?.userId);
      // Token da bir sıkıntı varsa üstteki fonksiyon error response döndüren bir helper
      // koda kalabalığını önlemek için yapıldı.
      if (errorResponse) return;
      const userId = decoded?.userId;

      const user = await Users.findById(userId);
      if (!user) {
        return res.status(403).json({
          status: false,
          message: "Böyle bir kullanıcı mevcut değil.",
        });
      }

      const userBookList = await Books.find({ userId });

      const isBookExist = userBookList.some(
        (book) => book.bookId.toString() === bookId && !book.isDeleted
      );

      if (isBookExist) {
        return res.status(400).json({
          status: false,
          message: "Eklemek istediğiniz kitap kütüphanenizde mevcuttur.",
        });
      }

      const isBookExistButDeleted = userBookList.some(
        (book) => book.bookId.toString() === bookId && book.isDeleted
      );

      if (isBookExistButDeleted) {
        const currentBook = await Books.findOneAndUpdate(
          { bookId },
          { $set: { isDeleted: false } },
          { new: true } // Güncellenmiş veriyi almak için
        );

        return res.json({
          status: true,
          message: "Kitap başarıyla geri eklendi.",
          book: currentBook,
        });
      }

      const book = await BookLists.findById(bookId);

      let payload: BookProps = {
        type,
        userId,
        bookId,
      };

      if (isFavorite) payload.isFavorite = true;
      if (!book) {
        return;
      }
      if (readCount > book?.pages_count) {
        return res.status(400).json({
          status: false,
          message:
            "Girilen sayfa sayısı kitabın sayfa sayısından büyük olamaz.",
        });
      }

      const slug = await generateSlug(book.name as string);

      if (slug) {
        payload.slug = slug;
      }
      if (!book.pages_count) {
        payload.process = {
          pageCount: null,
          readCount: null,
          percent: null,
        };
      } else {
        if (type === "0")
          payload.process = {
            pageCount: book.pages_count,
            readCount: book.pages_count,
            percent: "100", // 0 - 100 arası yüzdelik
          };
        if (type === "1")
          payload.process = {
            pageCount: book.pages_count,
            readCount: readCount ?? 0,
            percent: readCount
              ? ((readCount / book.pages_count) * 100).toFixed(2)
              : "0", // 0 - 100 arası yüzdelik
          };
        if (type === "2")
          payload.process = {
            pageCount: book.pages_count,
            readCount: 0,
            percent: "0", // 0 - 100 arası yüzdelik
          };
      }

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
// User a kitap ekleniyor
export const updateBookFromList = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { userBookId, isFavorite, type, readCount } = req.body;
  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";
  if (!type) {
    return res.status(400).json({
      status: false,
      message: "type is required",
    });
  }
  if (!userBookId) {
    return res.status(400).json({
      status: false,
      message: "userBookId is required",
    });
  }

  try {
    jwt.verify(token, secretKey, async (err: any, decoded: any) => {
      const errorResponse = await tokenErrorMessage(err, res, decoded?.userId);
      if (errorResponse) return;
      const userId = decoded?.userId;

      const user = await Users.findById(userId);
      if (!user) {
        return res.status(403).json({
          status: false,
          message: "Böyle bir kullanıcı mevcut değil.",
        });
      }

      const currentBook: any = await Books.findOne({ _id: userBookId });
      console.log("currentBook", currentBook);

      if (!currentBook) {
        return res.status(400).json({
          status: false,
          message: "Kitap bulunamadı",
        });
      } else {
        if (
          currentBook.process?.pageCount &&
          readCount > currentBook.process?.pageCount
        ) {
          return res.status(400).json({
            status: false,
            message:
              "Girilen sayfa sayısı kitabın sayfa sayısından büyük olamaz.",
          });
        }
        let payload: any = {
          type,
        };
        if (typeof isFavorite === "boolean") payload.isFavorite = isFavorite;

        if (!currentBook.process.pageCount) {
          payload.process = {
            pageCount: null,
            readCount: null,
            percent: null,
          };
        } else {
          if (type === "0")
            payload.process = {
              pageCount: currentBook.process?.pageCount,
              readCount: currentBook.process?.pageCount,
              percent: "100", // 0 - 100 arası yüzdelik
            };
          if (type === "1" && readCount)
            payload.process = {
              pageCount: currentBook.process?.pageCount,
              readCount: readCount ?? 0,
              percent: readCount
                ? ((readCount / currentBook.process?.pageCount) * 100).toFixed(
                    2
                  )
                : "0", // 0 - 100 arası yüzdelik
            };
          if (type === "2")
            payload.process = {
              pageCount: currentBook.process?.pageCount,
              readCount: 0,
              percent: "0", // 0 - 100 arası yüzdelik
            };
        }

        const data = await Books.findOneAndUpdate(
          { _id: userBookId },
          payload,
          {
            new: true,
          }
        );

        return res.json({
          status: true,
          message: "Kitap başarılı bir şekilde güncellendi.",
          data,
        });
      }
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
  const { userName, type } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortType = req.query.sortType ?? "createdAt";
  const sortDirection = req.query.sort === "asc" ? 1 : -1;

  try {
    const user: any = await Users.findOne({ userName });

    if (!user) {
      return res.status(403).json({
        status: false,
        message: "Böyle bir kullanıcı mevcut değil.",
      });
    }
    const data = await Books.find({
      userId: user._id,
      isDeleted: false,
      type,
    })
      .populate({
        path: "bookId",
        populate: [
          { path: "author" }, // bookId içindeki author alanını populate et
          { path: "publisher" }, // bookId içindeki publisher alanını populate et
        ],
      })
      .sort({ [sortType as string]: sortDirection }) // sortType alanına göre sıralama
      .skip((page - 1) * limit) // Sayfalama için atlama
      .limit(limit)
      .exec();

    // Toplam kitap sayısı
    const total = await Books.countDocuments({
      userId: user._id,
      isDeleted: false,
      type,
    });

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
      // Kitabı isDeleted alanını true yaparak soft delete işlemi
      const updatedBook = await Books.findOneAndUpdate(
        { _id: bookId, userId },
        { isDeleted: true },
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
        regex: `.*${searchValue.toLowerCase()}.*`,
      },
    };
  }

  try {
    const data = await BookLists.aggregate([
      { $match: matchStage },
      { $sort: { [sortType as string]: sortDirection } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $lookup: {
          from: "publishertypes", // İlişkilendirilmiş koleksiyonun adı
          localField: "publisher", // BookLists koleksiyonundaki referans alanı
          foreignField: "_id", // publishertypes koleksiyonundaki eşleşen alan
          as: "publisherData", // Sonuçta elde edilecek alan adı
        },
      },
      {
        $lookup: {
          from: "booktypes",
          localField: "book_type",
          foreignField: "_id",
          as: "bookTypeData",
        },
      },
      {
        $lookup: {
          from: "authortypes",
          localField: "author",
          foreignField: "_id",
          as: "authorData",
        },
      },
    ]);

    const formattedData = data.map((dt) => ({
      ...dt,
      publisherData: dt.publisherData[0],
      bookTypeData: dt.bookTypeData[0],
      authorData: dt.authorData[0],
    }));

    // Toplam kitap sayısı
    const total = await BookLists.countDocuments(matchStage);

    return res.json({
      status: true,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      limit,
      sort: req.query.sort || "desc",
      data: formattedData,
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
  console.log("BURADA HATA VAR ERROR");
  console.log("ENUM lara göre düzenle");
  // ! Buralara bak hacı
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
    const data = await BookLists.aggregate([
      { $match: searchCriteria },
      { $sort: { [sortType as string]: sortDirection } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    // Toplam kitap sayısı
    const total = await BookLists.countDocuments(searchCriteria);

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
// Kitap detayını listeler
export const getSingleBook = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { slug } = req.params;
  console.log("slug", slug);

  if (!slug) {
    return res.status(403).json({
      status: false,
      message: "slug gereklidir.",
    });
  }
  try {
    const data = await Books.findOne({ slug })
      .populate("userId", "-password -__v")
      .populate({
        path: "bookId",
        populate: {
          path: "author publisher",
        },
      });

    if (!data) {
      return res.status(403).json({
        status: false,
        message: "Böyle bir kitap mevcut değil.",
      });
    } else {
      return res.json({
        status: true,
        data,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
