import { Request, Response } from "express";
import BookTypes from "../../models/Enums/bookTypes.model";

export const getBookTypes = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortType = req.query.sortType ?? "name";
  const sortDirection = req.query.sort === "asc" ? 1 : -1;

  const searchType = req.query.searchType ?? "name";
  const searchValue =
    typeof req.query.search === "string"
      ? req.query.search.toLocaleLowerCase()
      : "";

  // Dinamik arama kriteri oluştur
  const matchStage: any = {};
  if (searchType && searchValue) {
    matchStage.$expr = {
      $regexMatch: {
        input: { $toLower: `$${searchType}` },
         regex: `.*${searchValue.toLowerCase()}.*`,
      },
    };
  }

  try {
    const data = await BookTypes.aggregate([
      { $match: matchStage },
      { $sort: { [sortType as string]: sortDirection } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    // Toplam kitap sayısı
    const total = await BookTypes.countDocuments(matchStage);

    return res.json({
      status: true,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      limit,
      sort: req.query.sort || "desc",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Sunucu hatası" });
  }
};
