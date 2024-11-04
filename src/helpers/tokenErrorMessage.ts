import { Response } from "express";

export const tokenErrorMessage = async (
  err: any,
  res: Response,
  userId: string
) => {
  if (err) {
    res.status(403).json({ status: false, message: "Geçersiz token" });
    return true; // Hata durumu var, üst fonksiyona true döndür
  }
  if (!userId) {
    res.status(403).json({
      status: false,
      message: "Böyle bir kullanıcı mevcut değil.",
    });
    return true; // Hata durumu var, üst fonksiyona true döndür
  }
  return false; // Hata yoksa false döndür
};
