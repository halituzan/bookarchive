import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import tokenCheck from "../helpers/tokenCheck";
import { tokenErrorMessage } from "../helpers/tokenErrorMessage";
import Users from "../models/user.model";
import BookPostsLikes from "../models/bookPostsLike.model";
import BookPosts from "../models/bookPost.model";
import Notifications from "../models/notification.model";
import { notificationCreate } from "../helpers/notificationCreate";

export const like = async (req: Request, res: Response) => {
  const { postId } = req.params;

  const token = tokenCheck(req, res) as any;
  const secretKey = process.env.JWT_SECRET_KEY || "";

  if (!postId) {
    return res
      .status(400)
      .json({ status: false, message: "postId gereklidir." });
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

      let likes = await BookPostsLikes.findOne({
        user: user._id,
        isDeleted: false,
        post: postId,
      });

      if (likes) {
        likes.isDeleted = true;
        await likes.save();

        // Yorumun post dökümanına eklenmesi
        await BookPosts.findByIdAndUpdate(postId, {
          $pull: { likes: likes._id },
        });
        res
          .status(200)
          .json({ status: true, message: "Paylaşım beğenisi çekildi." });
      } else {
        likes = new BookPostsLikes({ user: user._id, post: postId });
        await likes.save();

        // Like ın post dokumanına eklenmesi
        const post = await BookPosts.findByIdAndUpdate(postId, {
          $push: { likes: likes._id },
        });
        if (!post) {
          return;
        }
        // const notificationPayload: any = {
        //   user: userId,
        //   content: `Paylaşımınız beğenildi.`,
        //   isRead: false,
        //   isDeleted: false,
        //   connection: "post",
        //   connectionId: post._id,
        // };
        // const notification = new Notifications(notificationPayload);
        // await notification.save();
        const content = `Paylaşımınız beğenildi.`;
        await notificationCreate(userId, content, "post", post._id);

        res.status(200).json({ status: true, message: "Paylaşım beğenildi." });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
