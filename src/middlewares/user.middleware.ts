import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Books from "../models/book.model";
import Users from "../models/user.model";
import tokenCheck from "../helpers/tokenCheck";
import { UserProps } from "../types/global.types";

export const updateProfile = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { firstName, lastName, birthDate, gender, userName } = req.body;
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

      let payload: UserProps = {};
      if (firstName) payload.firstName = firstName;
      if (lastName) payload.lastName = lastName;
      if (userName) payload.userName = userName;
      if (birthDate) payload.birthDate = birthDate;
      if (gender || gender === 0 || gender === 1 || gender === 2)
        payload.gender = gender;

      const userNameExist = await Users.find({ userName });

      if (userNameExist.length > 0 && userName) {
        return res.status(400).json({
          status: false,
          message: "Kullanmak istediğiniz kullanıcı adı uygun değildir.",
        });
      }

      // Kitabı isDelete alanını true yaparak soft delete işlemi
      const updatedUser = await Users.findOneAndUpdate(
        { _id: userId },
        payload,
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          status: false,
          message: "Kullanıcı bulunamadı.",
        });
      }

      return res.json({
        status: true,
        message: "Kullanıcı başarılı bir şekilde güncellendi",
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
export const me = async (req: Request, res: Response, next: () => void) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token gerekli" });
  }

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

      return res.json({ status: true, data: user });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
