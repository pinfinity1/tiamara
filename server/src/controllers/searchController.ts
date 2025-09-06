// server/src/controllers/searchController.ts

import { Request, Response } from "express";
import { prisma } from "../server";

/**
 * Handles product search requests.
 * It searches for a given query string 'q' across multiple fields:
 * product name, description, tags, brand name, and category name.
 *
 * @param req - The Express request object, expecting a query parameter 'q'.
 * @param res - The Express response object.
 */
export const searchProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract the search query from the request's query parameters.
    const query = req.query.q as string;

    // If no query is provided, return a bad request error.
    if (!query) {
      res.status(400).json({
        success: false,
        message: "Search query is required",
      });
      return;
    }

    // Perform a case-insensitive search across multiple related fields.
    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive", // Case-insensitive matching
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            tags: {
              has: query.toLowerCase(), // Search within the tags array
            },
          },
          {
            // Correct way to filter on a related record's field
            brand: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
          {
            // Correct way to filter on a related record's field
            category: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        ],
      },
      // Include related brand, category, and image data in the search results.
      include: {
        brand: true,
        category: true,
        images: {
          take: 1, // Only take the first image for the preview
        },
      },
      // Limit the number of results, ideal for autocomplete suggestions.
      take: 10,
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (e) {
    console.error("Error in searchProducts controller:", e);
    res
      .status(500)
      .json({ success: false, message: "An error occurred during search." });
  }
};
