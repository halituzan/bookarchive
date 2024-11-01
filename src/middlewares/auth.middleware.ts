import bcrypt from "bcrypt"; // Make sure to install bcrypt
import { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Users from "../models/user.model";

export const register = async (
  req: Request,
  res: Response,
  next: () => void
) => {
  try {
    const { firstName, lastName, email, password, userName } = req.body;

    // Check if the user already exists
    const existingUser = await Users.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "Bu eposta ile kullanıcı mevcut",
      });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new Users({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      userName,
    });

    await newUser.save();
    const secretKey =
      process.env.JWT_SECRET_KEY ||
      "SACLARINALEVGIBIGOZLERINRUYAGIBIGUZELSINHAYALLERLESUSLENENCENNETGIBI";
    const token = jwt.sign({ userId: newUser.id }, secretKey, {
      expiresIn: "1w",
    });

    res.json({
      status: true,
      message: "Registration successful",
      token,
      userId: newUser.id,
    });
  } catch (error) {
    console.error(error);
    res.json({ status: false, message: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  const options: CookieOptions = {
    secure: false, // localde HTTPS olmadan çalışır
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({
          status: false,
          message: "Giriş bilgileriniz yanlış veya şifreniz yanlış",
        });
    }
    if (!user.isActive) {
      return res.status(400).json({
        status: false,
        message:
          "Kaydınız onaylı değildir. Lütfen e-posta adresinize gelen bağlantıdan üyeliğinizi onaylayın.",
      });
    }

    const secretKey = process.env.JWT_SECRET_KEY || "";

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({
            status: false,
            message: "Giriş bilgileriniz yanlış veya şifreniz yanlış",
          });
      }

      const token = jwt.sign({ userId: user._id }, secretKey, {
        expiresIn: "1w",
      });
      res.cookie("access_token", token, options);

      return res.json({
        status: true,
        message: "Giriş başarılı",
        userId: user._id,
        access_token: token,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};

export const logOut = async (req: Request, res: Response) => {
  try {
    // Çerezi silmek için cookie'yi boşaltıp anında sona erdiriyoruz
    res.cookie("access_token", "", {
      maxAge: 0,
      httpOnly: true,
      secure: false, // localde HTTPS olmadan çalışır
      sameSite: "lax",
    });

    return res.status(200).json({
      status: true,
      message: "Oturum sonlandırılmıştır",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Sunucu hatası",
    });
  }
};
