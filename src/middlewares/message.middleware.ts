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

      let isExistMessageRow = await Messages.findOne({
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender },
        ],
      });
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
      })
        .populate({
          path: "sender",
          select:
            "_id firstName lastName image userName createdAt messageRowId",
        })
        .populate({
          path: "receiver",
          select:
            "_id firstName lastName image userName createdAt messageRowId",
        });

      // Tüm kullanıcıları toplamak için Set kullanımı
      const userSet = new Set<string>();
      const userList: Array<any> = [];

      data.forEach((msg: any) => {
        const { sender, receiver, isRead, messageRowId, message, createdAt } =
          msg;

        if (
          sender._id.toString() !== userId &&
          !userSet.has(sender._id.toString())
        ) {
          userSet.add(sender._id.toString());
          userList.push({
            ...sender._doc,
            messageRowId,
            isRead,
            lastMessage: message,
            createdAt,
          });
        }

        if (
          receiver._id.toString() !== userId &&
          !userSet.has(receiver._id.toString())
        ) {
          userSet.add(receiver._id.toString());
          userList.push({
            ...receiver._doc,
            messageRowId,
            isRead,
            lastMessage: message,
            createdAt,
          });
        }
      });

      return res.json({
        status: true,
        data: userList,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
// Bir kullanıcı ile mesajları çeken servis
export const userMessage = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";
  const { messageRowId } = req.params;

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

      // Mesajı mesaj ID'sine göre bul
      const messages = await Messages.find({
        messageRowId,
      })
        .populate({
          path: "sender",
          select: "_id firstName lastName image userName",
        })
        .populate({
          path: "receiver",
          select: "_id firstName lastName image userName",
        });

      if (!messages || messages.length === 0) {
        return res.status(404).json({
          status: false,
          message: "Mesaj bulunamadı.",
        });
      }

      // Mesajlar üzerinde isMe kontrolü yaparak düzenle
      const formattedMessages = messages.map((msg: any) => {
        return {
          _id: msg._id,
          sender: msg.sender,
          receiver: msg.receiver,
          message: msg.message,
          createdAt: msg.createdAt,
          isMe: msg.sender._id.toString() === userId,
        };
      });

      return res.json({
        status: true,
        data: formattedMessages,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
