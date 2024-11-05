import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import tokenCheck from "../helpers/tokenCheck";
import Users from "../models/user.model";
import { UserProps } from "../types/global.types";
import Follows from "../models/follow.model";
import Books from "../models/book.model";

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

      // Kitabı isDeleted alanını true yaparak soft delete işlemi
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

      const user = await Users.findById(userId).select("-password -__v");
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

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { userName } = req.params;
  try {
    const user: any = await Users.findOne({ userName }).select(
      "-password -__v"
    );
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const token = req.headers.authorization?.split("Bearer ")[1] as string;
    const secretKey = process.env.JWT_SECRET_KEY || "";

    jwt.verify(token, secretKey, async (err: any, decoded: any) => {
      let payload: any = {
        status: true,
      };
      const userId = decoded?.userId;
      const profile: any = await Users.findOne({ userName }).select(
        "-password -__v"
      );
      const followsCount = await Follows.countDocuments({
        follower: profile._id,
        isDeleted: false,
      });
      const followersCount = await Follows.countDocuments({
        following: profile._id,
        isDeleted: false,
      });
      const readBooksCount = await Books.countDocuments({
        userId: profile._id,
        type: "0",
        isDeleted: false,
      });
      const readingBooksCount = await Books.countDocuments({
        userId: profile._id,
        type: "1",
        isDeleted: false,
      });
      const wishlistBooksCount = await Books.countDocuments({
        userId: profile._id,
        type: "2",
        isDeleted: false,
      });
      payload.user = profile;
      payload.counts = {
        followsCount,
        followersCount,
        readBooksCount,
        readingBooksCount,
        wishlistBooksCount,
        totalBookCount: readBooksCount + readingBooksCount + wishlistBooksCount,
      };
      if (!userId) {
        payload.isLoggedIn = false; // token olmadığı için logil değildir.
        payload.isSelf = false; // token olmadığı için kendisi olup olmadığını bilemiyoruz çünkü login değildir.
        payload.isEditable = false; // login olmadığı için editleme doğal olarak false olur.
      } else {
        payload.isLoggedIn = true; // token olduğu için logindir.
        if (profile._id.toString() === userId) {
          payload.isSelf = true;
          // profilin id si userId ile eşittir ve kendisidir.
          payload.isEditable = true;
          // profilin id si userId ile eşittir ve duzenlenebilir profildir. Yani aslında kendisidir.
        } else {
          payload.isSelf = false;
          // profilin id si userId ile eşit değildir ve kendisi değildir.
          payload.isEditable = false;
          // profilin id si userId ile eşit değildir ve duzenlenebilir profil değildir. Yani kendisi değildir.
        }
      }
      return res.json(payload);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
