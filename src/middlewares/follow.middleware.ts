import { Request, Response } from "express";
import Follows from "../models/follow.model";

//! Takibe alma fonksiyonu
export const followUser = async (req: Request, res: Response) => {
  const { userId, targetUserId } = req.body;
  // TODO: userId takip etmek isteyen kullanıcı
  // TODO: targetUserId takip edilmek istenilen kullanıcı
  try {
    let follow = await Follows.findOne({
      follower: userId,
      following: targetUserId,
    });

    if (follow) {
      // Eğer önceden bir takip ilişkisi varsa
      // Mevcut ilişki kaldırılmışmı kontorlünü yapıyoruz.
      if (!follow.isDeleted) {
        return res
          .status(400)
          .json({ message: "Bu kullanıcıyı takip etmiyorsunuz." });
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

    res.status(200).json({ message: "Kullanıcı takibe alındı." });
  } catch (error) {
    res.status(500).json({ message: "Bir hata oluştu!", error });
  }
};

//! Takipten çıkarma fonksiyonu (soft delete)
export const unfollowUser = async (req: Request, res: Response) => {
  const { userId, targetUserId } = req.body;
  // TODO: userId takipten çıkarmak isteyen kullanıcı
  // TODO: targetUserId takipten çıkarılmak istenen kullanıcı

  try {
    const follow = await Follows.findOne({
      follower: userId,
      following: targetUserId,
      isDeleted: false,
    });

    if (!follow) {
      return res
        .status(404)
        .json({ message: "Kullanıcı zaten takip ediliyor." });
    }
    // Soft delete işlemi
    follow.isDeleted = true;
    follow.deletedAt = new Date();

    await follow.save();

    res.status(200).json({ message: "Kullanıcı takipten çıkarıldı." });
  } catch (error) {
    res.status(500).json({ message: "Bir hata oluştu!", error });
  }
};
