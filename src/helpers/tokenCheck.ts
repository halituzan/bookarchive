import { Request, Response } from "express";

export default (req: Request, res: Response) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) {
    return res.status(403).json({ status: false, message: "Token gerekli" });
  } else {
    return token;
  }
};
