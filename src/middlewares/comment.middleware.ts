// src/middlaware/comment.middleware.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import tokenCheck from "../helpers/tokenCheck";
import { tokenErrorMessage } from "../helpers/tokenErrorMessage";
import Users from "../models/user.model";
import BookPostsComments from "../models/bookPostsComment.model";
import BookPosts from "../models/bookPost.model";
import Notifications from "../models/notification.model";
import { notificationCreate } from "../helpers/notificationCreate";

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

      // Yorumun post dökümanına eklenmesi
      const post = await BookPosts.findByIdAndUpdate(postId, {
        $push: { comments: newComment._id },
      });
      if (!post) {
        return;
      }

      // const notificationPayload: any = {
      //   user: userId,
      //   content: `Paylaşımınıza yorum geldi.`,
      //   isRead: false,
      //   isDeleted: false,
      //   connection: "post",
      //   connectionId: post._id,
      // };
      // const notification = new Notifications(notificationPayload);
      // await notification.save();
      const message = `Paylaşımınıza yorum geldi.`;
      await notificationCreate(post.user, message, "post", post._id, "comment");

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

export const getBookPostComments = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { postId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortDirection = req.query.sort === "asc" ? 1 : -1;
  try {
    const comments = await BookPostsComments.find({ post: postId })
      .populate({
        path: "user",
        select: "-password -__v",
      })
      .sort({ createdAt: sortDirection }) // oluşturma tarihine göre sıralama
      .select("-__v")
      .skip((page - 1) * limit) // Sayfalama için atlama
      .limit(limit)
      .exec();

    const total = await BookPostsComments.countDocuments({
      post: postId,
      isDeleted: false,
    });

    return res.json({
      page,
      totalPages: Math.ceil(total / limit),
      total,
      limit,
      sort: req.query.sort || "desc",
      data: comments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
