// src/index.ts
import express, { Express } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import {
  authRoutes,
  bookPostRoutes,
  bookRoutes,
  enumRoutes,
  followRoutes,
  likesRoutes,
  messageRoutes,
  noteRoutes,
  notificationRoutes,
  openLibraryRoutes,
  upgradeRoutes,
  userRoutes,
} from "./routes";
import { bookPostCommentRoutes } from "./routes/comment.routes";
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;
const userName = process.env.MONGODB_USERNAME ?? "";
const password = process.env.MONGODB_PASSWORD ?? "";
const dbName = process.env.MONGO_DB_NAME ?? "";

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
mongoose
  .connect(
    `mongodb+srv://${encodeURIComponent(userName)}:${encodeURIComponent(
      password
    )}@cluster0.ux1rlrp.mongodb.net/${dbName}?retryWrites=true&w=majority&socketTimeoutMS=10000&connectTimeoutMS=10000`
  )
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => console.log(err));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use("/", authRoutes);
app.use("/book/", bookRoutes);
app.use("/user/", userRoutes);
app.use("/posts/", bookPostRoutes);
app.use("/enum/", enumRoutes);
app.use("/follow/", followRoutes);
app.use("/like/", likesRoutes);
app.use("/note/", noteRoutes);
app.use("/notification/", notificationRoutes);
app.use("/comment/", bookPostCommentRoutes);
app.use("/message/", messageRoutes);
app.use("/third/openLibrary/", openLibraryRoutes);
// kaldırılacak routelar
app.use("/upgrade/", upgradeRoutes);
