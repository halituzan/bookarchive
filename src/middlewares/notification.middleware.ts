import { Response, Request } from "express";
import jwt from "jsonwebtoken";
import tokenCheck from "../helpers/tokenCheck";
import { tokenErrorMessage } from "../helpers/tokenErrorMessage";
import Users from "../models/user.model";
import Notifications from "../models/notification.model";

export const createNotification = async (req: Request, res: Response) => {
  const { content } = req.body;
  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";

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

      let payload: any = {
        user: userId,
      };

      const newNotification = new Notifications(payload);
      await newNotification.save();
      return res.json({
        status: true,
        message: "Bildirim başarılı bir şekilde eklendi",
        data: newNotification,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};

export const readNotification = async (req: Request, res: Response) => {
  const { notificationId } = req.params;
  if (!notificationId) {
    return res.status(400).json({
      status: false,
      message: "notificationId gereklidir.",
    });
  }

  try {
    await Notifications.findByIdAndUpdate(notificationId, {
      $set: { isRead: true },
    });
    return res.json({
      status: true,
      message: "Bildirim Okundu.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortDirection = req.query.sort === "asc" ? 1 : -1;

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
      const data = await Notifications.find({ user: userId, isDeleted: false })
        .populate({
          path: "user",
          select: "-password -__v",
        })
        .sort({ createdAt: sortDirection }) // oluşturma tarihine göre sıralama
        .select("-__v")
        .skip((page - 1) * limit) // Sayfalama için atlama
        .limit(limit)
        .exec();

      const total = await Notifications.countDocuments({
        user: userId,
        isDeleted: false,
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
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
