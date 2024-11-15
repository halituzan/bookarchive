import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import tokenCheck from "../helpers/tokenCheck";
import { tokenErrorMessage } from "../helpers/tokenErrorMessage";
import Users from "../models/user.model";
import Messages from "../models/message.model";

// Mesaj gönderme servisi
export const createMessage = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { receiver, message, connectionType, connection } = req.body;
  // receiver: Alıcı
  // sender: Gönderen, gönderen zaten tokenı olan kullanıcının idsi

  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";

  try {
    jwt.verify(token, secretKey, async (err: any, decoded: any) => {
      const errorResponse = await tokenErrorMessage(err, res, decoded?.userId);
      if (errorResponse) return;
      const sender = decoded?.userId;
      const user = await Users.findById(sender);
      if (!user)
        return res.status(403).json({
          status: false,
          message: "Böyle bir kullanıcı mevcut değil.",
        });

      const isExistMessageRow = await Messages.findOne({ sender, receiver });
      let payload: any = {
        receiver,
        sender,
        message,
      };
      if (connection) payload.connection = connection;
      if (connectionType) payload.connectionType = connectionType;
      if (isExistMessageRow)
        payload.messageRowId = isExistMessageRow.messageRowId;

      const data = new Messages(payload);
      await data.save();
      return res.json({
        status: true,
        message: "Mesaj gönderildi.",
        data,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
// kullanıcının mesajlaşma listesi

export const userMessageList = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";

  try {
    jwt.verify(token, secretKey, async (err: any, decoded: any) => {
      const errorResponse = await tokenErrorMessage(err, res, decoded?.userId);
      if (errorResponse) return;
      const userId = decoded?.userId;
      const user = await Users.findById(userId);
      if (!user)
        return res.status(403).json({
          status: false,
          message: "Böyle bir kullanıcı mevcut değil.",
        });

      const data = await Messages.find({
        $or: [{ sender: userId }, { receiver: userId }],
      });

      return res.json({
        status: true,
        data,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
