import { Request, Response } from "express";
import slugify from "slugify";
import BookLists from "../models/allBook.model";

export const updateUserBookNote = async (req: Request, res: Response) => {
  try {
    const batchSize = 200; // Her seferde işlem yapılacak kayıt sayısı

    let updatedCount = 0;
    let booksWithoutSlug = await BookLists.find({
      slug: { $exists: false },
    }).limit(batchSize);

    while (booksWithoutSlug.length > 0) {
      const bulkOperations = booksWithoutSlug.map((book) => {
        const slug = generateUniqueSlug(book.name as string); // Slug'ı hemen oluşturalım
        return {
          updateOne: {
            filter: { _id: book._id },
            update: { $set: { slug } },
          },
        };
      });

      await BookLists.bulkWrite(bulkOperations); // Toplu güncelleme işlemi
      updatedCount += booksWithoutSlug.length;
      console.log(`${updatedCount} kayıt güncellendi.`);

      booksWithoutSlug = await BookLists.find({
        slug: { $exists: false },
      }).limit(batchSize);
    }

    res.status(200).json({ message: "Tüm sluglar başarıyla güncellendi." });
  } catch (error) {
    console.error("Slug güncelleme hatası:", error);
    res.status(500).json({ error: "Slug güncelleme işleminde hata oluştu." });
  }
};

function generateUniqueSlug(name: string) {
  let slug = slugify(name, { lower: true, remove: /[*+~.()'"!:@?,]/g });
  // Benzersiz kod eklemek için yeterli olabilir
  const uniqueCode = generateCode(5);
  return `${slug}-${uniqueCode}`;
}

function generateCode(length: number = 10) {
  const codeChars = "0123456789ABCDEFGHIJKLMNOPRSTUVYZXWQ";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * codeChars.length);
    code += codeChars.charAt(randomIndex);
  }
  return code;
}
