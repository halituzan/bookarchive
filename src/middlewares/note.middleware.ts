import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import tokenCheck from "../helpers/tokenCheck";
import { tokenErrorMessage } from "../helpers/tokenErrorMessage";
import Users from "../models/user.model";
import Notes from "../models/note.model";

type NoteTypes = {
  user: string;
  userBook: string;
  note: string;
  notePage: number | null;
};
// Bir kitaba not eklemek için kullanılır
export const createNote = async (req: Request, res: Response) => {
  const { userBookId, note, notePage } = req.body;
  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";

  if (note.length > 256) {
    return res.status(400).json({
      status: false,
      message: "Not 256 karakterden fazla olamaz.",
    });
  }

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
      const noteList = await Notes.find({ user: userId });

      if (noteList && noteList.length >= 10) {
        return res.status(400).json({
          status: false,
          message: "Bu kitap için not ekleme sınırına ulaştınız.",
        });
      }

      let payload: NoteTypes = {
        user: userId,
        userBook: userBookId,
        note,
        notePage,
      };
      if (notePage) {
        payload.notePage = notePage;
      } else {
        payload.notePage = null;
      }
      const newNote = new Notes(payload);
      await newNote.save();
      return res.json({
        status: true,
        message: "Not başarılı bir şekilde eklendi",
        data: newNote,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
// Kitaptaki bir notu silmeye yarar
export const deleteUserBoookNote = async (req: Request, res: Response) => {
  const { userBookId } = req.body;
  console.log("userBookId", userBookId);

  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";
  try {
    jwt.verify(token, secretKey, async (err: any, decoded: any) => {
      const errorResponse = await tokenErrorMessage(err, res, decoded?.userId);
      if (errorResponse) return;
      const userId = decoded?.userId;
      if (!userId)
        return res.status(403).json({
          status: false,
          message: "Böyle bir kullanıcı mevcut değil.",
        });
      await Notes.findOneAndUpdate(
        { _id: userBookId },
        { $set: { isDeleted: true } }
      );
      return res.json({
        status: true,
        message: "Not başarılı bir şekilde silindi.",
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
// Kitaptaki bir notu update etmeye yarar
export const updateUserBoookNote = async (req: Request, res: Response) => {
  const { noteId, note, notePage } = req.body;
  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";

  if (note && note.length > 256) {
    return res.status(400).json({
      status: false,
      message: "Not 256 karakterden fazla olamaz.",
    });
  }

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
      let payload: any = {};

      if (note) payload.note = note;
      if (notePage) payload.notePage = notePage;

      const noteUpdate = await Notes.findOneAndUpdate(
        { _id: noteId, isDeleted: false },
        { $set: { ...payload } },
        { new: true } // güncellenmiş notu geri döndürmek için
      );

      if (noteUpdate) {
        return res.json({
          status: true,
          message: "Not başarılı bir şekilde güncellendi.",
        });
      } else {
        return res.status(400).json({
          status: false,
          message: "Böyle bir not mevcut değil.",
        });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};

// bir kitabın notlarını çekmek için kullanılır.
export const getUserBookNote = async (req: Request, res: Response) => {
  const { userBook } = req.params;
  // userBookId ye göre notları getirme

  try {
    const data = await Notes.find({ userBook }).select("-__v");

    res.json({
      status: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
