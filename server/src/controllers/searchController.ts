import { Request, Response } from "express";
import { prisma } from "../server";

export const searchProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query = req.query.q as string;

    if (!query) {
      res.status(400).json({
        success: false,
        message: "Search query is required",
      });
      return;
    }

    const [products, brands, categories] = await prisma.$transaction([
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { englishName: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { tags: { has: query.toLowerCase() } },
            { skin_type: { has: query.toLowerCase() } },
            { concern: { has: query.toLowerCase() } },
            { product_form: { contains: query, mode: "insensitive" } },

            {
              brand: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { englishName: { contains: query, mode: "insensitive" } },
                ],
              },
            },
            {
              category: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { englishName: { contains: query, mode: "insensitive" } },
                ],
              },
            },
          ],
          isArchived: false,
        },
        include: {
          brand: true,
          category: true,
          images: { take: 1 },
        },
        take: 10,
      }),

      prisma.brand.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { englishName: { contains: query, mode: "insensitive" } },
          ],
          isArchived: false,
        },
        take: 5,
      }),

      prisma.category.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { englishName: { contains: query, mode: "insensitive" } },
          ],
          isArchived: false,
        },
        take: 5,
      }),
    ]);

    res.status(200).json({
      success: true,
      results: {
        products,
        brands,
        categories,
      },
    });
  } catch (e) {
    console.error("Error in searchProducts controller:", e);
    res
      .status(500)
      .json({ success: false, message: "An error occurred during search." });
  }
};
