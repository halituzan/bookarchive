import { Request, Response } from "express";
import Follows from "../models/follow.model";
import jwt from "jsonwebtoken";
import tokenCheck from "../helpers/tokenCheck";
//! Takibe alma fonksiyonu
export const followUser = async (req: Request, res: Response) => {
  const { targetUserId } = req.body;
  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";

  try {
    jwt.verify(token, secretKey, async (err: any, decoded: any) => {
      if (err) {
        return res
          .status(403)
          .json({ status: false, message: "Geçersiz token" });
      }

      const userId = decoded?.userId;

      if (!userId) {
        return res.status(403).json({
          status: false,
          message: "Böyle bir kullanıcı mevcut değil.",
        });
      }
      // Takip etmeye çalıştığı kişi kendisi ise error mesajı gönderiyoruz
      if (targetUserId === userId) {
        return res
          .status(403)
          .json({ status: false, message: "Kendinizi takip edemezsiniz." });
      }

      let follow = await Follows.findOne({
        follower: userId,
        following: targetUserId,
      });

      if (follow) {
        // Eğer önceden bir takip ilişkisi varsa
        // Mevcut ilişki kaldırılmışmı kontorlünü yapıyoruz.
        if (!follow.isDeleted) {
          return res.status(400).json({
            status: false,
            message: "Bu kullanıcıyı takip ediyorsunuz.",
          });
        }
        // Mevcutta ilişki varsa
        // Kullanıcı takipten çıkarmışsa
        // Kullanıcı tekrar takip etmek istiyorsa
        // isDeleted ı kaldırıyoruz ve deleteAt i undefined yapıyoruz.
        follow.isDeleted = false;
        follow.deletedAt = undefined;
        await follow.save();
      } else {
        // Eğer önceden bir takip ilişkisi yoksa yeni takip ilişkisi oluşturuyoruz.
        follow = new Follows({ follower: userId, following: targetUserId });
        await follow.save();
      }

      res
        .status(200)
        .json({ status: true, message: "Kullanıcı takibe alındı." });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }

  // TODO: userId takip etmek isteyen kullanıcı
  // TODO: targetUserId takip edilmek istenilen kullanıcı
  try {
  } catch (error) {
    res.status(500).json({ message: "Bir hata oluştu!", error });
  }
};

//! Takipten çıkarma fonksiyonu (soft delete)
export const unfollowUser = async (req: Request, res: Response) => {
  const { targetUserId } = req.body;
  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";
  // TODO: targetUserId takipten çıkarılmak istenen kullanıcı
  jwt.verify(token, secretKey, async (err: any, decoded: any) => {
    if (err)
      return res.status(403).json({ status: false, message: "Geçersiz token" });

    const userId = decoded?.userId;

    if (!userId)
      return res.status(403).json({
        status: false,
        message: "Böyle bir kullanıcı mevcut değil.",
      });

    // Takip etmeye çalıştığı kişi kendisi ise error mesajı gönderiyoruz
    if (targetUserId === userId)
      return res.status(403).json({
        status: false,
        message: "Kendinizi takipten çıkartamazsınız.",
      });

    try {
      const follow = await Follows.findOne({
        follower: userId,
        following: targetUserId,
        isDeleted: false,
      });

      if (!follow)
        return res
          .status(404)
          .json({ message: "Kullanıcı zaten takip edilmiyor." });

      // Soft delete işlemi
      follow.isDeleted = true;
      follow.deletedAt = new Date();

      await follow.save();

      res.status(200).json({ message: "Kullanıcı takipten çıkarıldı." });
    } catch (error) {
      res.status(500).json({ message: "Bir hata oluştu!", error });
    }
  });
};
export const getFollowers = async (req: Request, res: Response) => {
  const { userId } = req.params;

  // Takip etmeye çalıştığı kişi kendisi ise error mesajı gönderiyoruz

  try {
    const data = await Follows.findOne({
      follower: userId,
      isDeleted: false,
    });

    res.status(200).json({ status: true, data });
  } catch (error) {
    res.status(500).json({ message: "Bir hata oluştu!", error });
  }
};
export const getFollowing = async (req: Request, res: Response) => {
  const { userId } = req.params;

  // Takip etmeye çalıştığı kişi kendisi ise error mesajı gönderiyoruz

  try {
    // Kullanıcının takip ettiği kişiler (following)
    const following = await Follows.find({
      follower: userId,
      isDeleted: false,
    }).populate("following", "-password -__v");

    // Kullanıcıyı takip eden kişiler (followers)
    const followers = await Follows.find({
      following: userId,
      isDeleted: false,
    }).populate("follower", "-password -__v");

    res.status(200).json({ status: true, following, followers });
  } catch (error) {
    res.status(500).json({ message: "Bir hata oluştu!", error });
  }
};
