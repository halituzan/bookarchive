import { Request, Response } from "express";
import axios from "axios";

interface OpenLibraryResponse {
  docs: any[];
  numFound: number;
  start: number;
}

interface FormattedBook {
  title: string;
  author_name: string;
  first_publish_year: string | number;
  isbn: string;
  publisher: string;
  language: string;
  cover_url?: string;
  author_image_url?: string;
  pageCount?: any;
}

// OpenLibrary Search Title
export const titleSearchOpenLibrary = async (req: Request, res: Response) => {
  try {
    const { title, page = 1, limit = 10 } = req.query;

    if (!title) {
      return res.status(400).json({ error: "Title parameter is required" });
    }

    const offset = (Number(page) - 1) * Number(limit);

    const response = await axios.get<OpenLibraryResponse>(
      `https://openlibrary.org/search.json`,
      {
        params: {
          title: title,
          page: page,
          limit: limit,
          offset: offset,
        },
      }
    );

    const { docs, numFound } = response.data;

    const formattedResults = await Promise.all(
      docs.map(async (book) => ({
        title: book.title,
        author: book.author_name?.[0] || "Unknown Author",
        firstPublishYear: book.first_publish_year || "Unknown",
        isbn: book.isbn?.[0] || "No ISBN",
        publisher: book.publisher?.[0] || "Unknown Publisher",
        language: book.language?.[0] || "Unknown Language",
        coverUrl: book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : null,
        authorImage: book.author_picture
          ? `https://covers.openlibrary.org/a/id/${book.author_picture}-M.jpg`
          : null,
        pageCount: book.number_of_pages_median ?? null,
      }))
    );

    return res.json({
      data: formattedResults,
      total: numFound,
      page: Number(page),
      limit: Number(limit),
      hasMore: offset + formattedResults.length < numFound,
    });
  } catch (error) {
    console.error("Error searching OpenLibrary by title:", error);
    return res.status(500).json({
      error: "An error occurred while searching OpenLibrary",
    });
  }
};

// OpenLibrary Search Author
export const authorSearchOpenLibrary = async (req: Request, res: Response) => {
  try {
    const { author, page = 1, limit = 10 } = req.query;

    if (!author) {
      return res.status(400).json({ error: "Author parameter is required" });
    }

    const offset = (Number(page) - 1) * Number(limit);

    const response = await axios.get<OpenLibraryResponse>(
      `https://openlibrary.org/search/authors.json`,
      {
        params: {
          q: author,
          page: page,
          limit: limit,
          offset: offset,
        },
      }
    );

    const { docs, numFound } = response.data;

    const formattedResults = await Promise.all(
      docs.map(async (author) => ({
        name: author.title,
        birthDate: author.birth_date || "-",
        deathDate: author.death_date || "-",
        date: author.date || "-",
        categories: author.top_subjects || [],
        publisher: author.publisher?.[0] || "Unknown Publisher",
        language: author.language?.[0] || "Unknown Language",
        imageL: author.key
          ? `https://covers.openlibrary.org/a/olid/${author.key}-L.jpg`
          : null,
        imageM: author.key
          ? `https://covers.openlibrary.org/a/olid/${author.key}-M.jpg`
          : null,
        imageS: author.key
          ? `https://covers.openlibrary.org/a/olid/${author.key}-S.jpg`
          : null,
      }))
    );

    return res.json({
      data: formattedResults,
      total: numFound,
      page: Number(page),
      limit: Number(limit),
      hasMore: offset + formattedResults.length < numFound,
    });
  } catch (error) {
    console.error("Error searching OpenLibrary by author:", error);
    return res.status(500).json({
      error: "An error occurred while searching OpenLibrary",
    });
  }
};
