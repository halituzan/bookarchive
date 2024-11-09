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
  noteRoutes,
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
    )}@cluster0.ux1rlrp.mongodb.net/${dbName}?retryWrites=true&w=majority`
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
app.use("/", bookRoutes);
app.use("/", userRoutes);
app.use("/", bookPostRoutes);
app.use("/", enumRoutes);
app.use("/", followRoutes);
app.use("/note/", noteRoutes);
app.use("/upgrade/", upgradeRoutes);
app.use("/comment/", bookPostCommentRoutes);
app.use("/third/openLibrary/", openLibraryRoutes);
