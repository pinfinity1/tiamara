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
      // 1. Search for products
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { tags: { has: query.toLowerCase() } },
            { skin_type: { has: query.toLowerCase() } },
            { concern: { has: query.toLowerCase() } },
            { product_form: { contains: query, mode: "insensitive" } },
            // جستجو در نام فارسی و انگلیسی برندِ محصول
            {
              brand: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { englishName: { contains: query, mode: "insensitive" } },
                ],
              },
            },
            // جستجو در نام فارسی و انگلیسی دسته‌بندیِ محصول
            {
              category: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { englishName: { contains: query, mode: "insensitive" } },
                ],
              },
            },
          ],
          // اضافه کردن شرط عدم نمایش محصولات آرشیو شده (اختیاری ولی توصیه می‌شود)
          isArchived: false,
        },
        include: {
          brand: true,
          category: true,
          images: { take: 1 },
        },
        take: 10,
      }),
      // 2. Search for brands (Persian & English)
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
      // 3. Search for categories (Persian & English)
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
