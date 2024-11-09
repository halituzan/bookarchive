import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import tokenCheck from "../helpers/tokenCheck";
import { tokenErrorMessage } from "../helpers/tokenErrorMessage";
import Users from "../models/user.model";
import BookPostsComments from "../models/bookPostsComment.model";

interface CommentTypes {
  user: string;
  post: string;
  content: string;
}

export const createBookPostComments = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { content, postId } = req.body;

  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";

  if (!postId) {
    return res
      .status(400)
      .json({ status: false, message: "postId zorunludur." });
  }
  if (!content) {
    return res
      .status(400)
      .json({ status: false, message: "content boş olamaz." });
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

      let payload: CommentTypes = {
        user: userId,
        post: postId,
        content,
      };
      const newComment = new BookPostsComments(payload);
      await newComment.save();
      return res.json({
        status: true,
        message: "Yorum başarılı bir şekilde eklendi",
        data: newComment,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
