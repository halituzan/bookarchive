import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Books from "../models/book.model";
import Users from "../models/user.model";
type BookProps = {
  title: string;
  description: string;
  userId: string;
  author: string;
  isFavorite?: boolean;
  image?: string;
};

export const createBook = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { title, description, author, isFavorite, image } = req.body;
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token gerekli" });
  }
  const secretKey = process.env.JWT_SECRET_KEY || "";

  try {
    jwt.verify(token, secretKey, async (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Geçersiz token" });
      } else {
        const userId = decoded?.userId;
        if (!userId) {
          return res
            .status(403)
            .json({ message: "Böyle bir kullanıcı mevcut değil." });
        } else {
          const user = await Users.findById(userId);
          if (!user) {
            console.error("Kullanıcı bulunamadı!");
            return;
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
        }
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
