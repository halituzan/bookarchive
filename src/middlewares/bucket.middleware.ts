// uploadProfileImage.ts
import { Request, Response } from "express";
import formidable from "formidable";
import fs from "fs";
import jwt from "jsonwebtoken";
import Users from "../models/user.model";
import { bucket } from "../configs/firebase.config";

// Profil resmi yükleme fonksiyonu
export const uploadProfileImage = async (req: Request, res: Response) => {
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

      const form = formidable({ multiples: false });

      form.parse(req, async (err: any, fields: any, files: any) => {
        if (err) {
          return res.status(500).json({ error: "Dosya yükleme hatası." });
        }

        const file = files.image[0];
        // Yalnızca resim dosyalarını ve PNG/JPEG formatlarını kabul etme
        if (
          !file ||
          !file?.mimetype?.startsWith("image") ||
          !["image/png", "image/jpeg"].includes(file.mimetype)
        ) {
          return res.status(400).json({
            status: false,
            message: "Yalnızca PNG veya JPEG resim dosyaları kabul edilir.",
          });
        }

        const filePath = file.filepath;
        const fileName = `${user.userName}.${file.mimetype.split("/")[1]}`;

        try {
          // Dosyayı Firebase Storage'a yükle
          await bucket.upload(filePath, {
            destination: `profile_images/${fileName}`,
            metadata: { contentType: file.mimetype },
          });

          const fileRef = bucket.file(`profile_images/${fileName}`);
          await fileRef.makePublic();

          // Dosyanın genel URL'sini al
          const url = `https://storage.googleapis.com/${bucket.name}/profile_images/${fileName}`;

          // Kullanıcının profil resmini güncelle
          user.image = url;
          await user.save();

          return res.json({
            status: true,
            message: "Profil resmi başarıyla yüklendi.",
            url,
          });
        } catch (error) {
          console.error("Hata:", error);
          return res.status(500).json({ error: "Dosya yüklenemedi." });
        } finally {
          // Geçici dosya temizleme
          fs.unlinkSync(filePath);
        }
      });
    });
  } catch (error) {
    console.error("Hata:", error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
