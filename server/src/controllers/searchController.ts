import { Request, Response } from "express";
import { prisma } from "../server";
import { Prisma } from "@prisma/client";

// --- ۱. تابع تمیزکاری اولیه (ی/ک و فاصله‌ها) ---
const cleanText = (text: string) => {
  if (!text) return text;
  return text
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ") // نیم‌فاصله به فاصله
    .replace(/[\u064b-\u065f]/g, "") // حذف اعراب
    .trim();
};

// --- ۲. تابع تولید حالت‌های مختلف کلمه (برای حل مشکل آ/ا) ---
const generateVariations = (term: string): string[] => {
  const variations = new Set<string>();

  // حالت ۱: خود کلمه تمیز شده
  variations.add(term);

  // حالت ۲: تبدیل تمام "آ" ها به "ا" (برای کسانی که "ابرسان" سرچ می‌کنند)
  const normalizedToAlef = term.replace(/آ/g, "ا").replace(/[أإ]/g, "ا");
  variations.add(normalizedToAlef);

  // حالت ۳: اگر کلمه با "ا" شروع شده، حالت با "آ" را هم اضافه کن (برای کسانی که "ابرسان" می‌نویسند ولی دیتابیس "آبرسان" است)
  if (term.startsWith("ا")) {
    variations.add("آ" + term.substring(1));
  }

  return Array.from(variations);
};

export const searchProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query = req.query.q as string;

    // اعتبارسنجی
    if (!query || query.trim().length < 2) {
      res.status(200).json({
        success: true,
        results: { products: [], brands: [], categories: [] },
      });
      return;
    }

    // ۱. تمیز کردن کوئری
    const cleanedQuery = cleanText(query);

    // ۲. شکستن جمله به کلمات (برای جستجوی چند کلمه‌ای)
    const words = cleanedQuery.split(/\s+/).filter((w) => w.length > 1);

    if (words.length === 0) {
      res
        .status(200)
        .json({
          success: true,
          results: { products: [], brands: [], categories: [] },
        });
      return;
    }

    // ۳. ساخت شرط‌های جستجو برای هر کلمه
    // برای هر کلمه کاربر، تمام حالت‌های ممکن (با آ و بی آ) را تولید می‌کنیم
    const productAndConditions = words.map((word) => {
      const variations = generateVariations(word);

      // شرط: کلمه باید در یکی از فیلدها باشد، با یکی از حالت‌های املایی
      return {
        OR: variations.flatMap((variation) => [
          { name: { contains: variation, mode: "insensitive" } },
          { englishName: { contains: variation, mode: "insensitive" } },
          { description: { contains: variation, mode: "insensitive" } },
          { sku: { contains: variation, mode: "insensitive" } },
          { brand: { name: { contains: variation, mode: "insensitive" } } },
          { category: { name: { contains: variation, mode: "insensitive" } } },
        ]),
      };
    }) as Prisma.ProductWhereInput[];

    // ۴. شرط جامع برای برندها و دسته‌بندی‌ها (جستجوی کلی)
    const allVariationsOfQuery = generateVariations(cleanedQuery);
    const brandCategoryConditions = allVariationsOfQuery.map(
      (v) => ({ contains: v, mode: "insensitive" } as const)
    );

    const [products, brands, categories] = await prisma.$transaction([
      // جستجوی محصولات (باید تمام کلمات کاربر را شامل شود - منطق AND بین کلمات)
      prisma.product.findMany({
        where: {
          AND: productAndConditions,
          isArchived: false,
        },
        include: {
          brand: true,
          category: true,
          images: { take: 1 },
        },
        take: 20,
        orderBy: { soldCount: "desc" },
      }),

      // جستجوی برندها (کافیست یکی از حالت‌های کل عبارت در آن باشد)
      prisma.brand.findMany({
        where: {
          OR: brandCategoryConditions.flatMap((cond) => [
            { name: cond },
            { englishName: cond },
          ]),
          isArchived: false,
        },
        take: 5,
      }),

      // جستجوی دسته‌بندی‌ها
      prisma.category.findMany({
        where: {
          OR: brandCategoryConditions.flatMap((cond) => [
            { name: cond },
            { englishName: cond },
          ]),
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
    res.status(200).json({
      success: false,
      message: "Search error",
      results: { products: [], brands: [], categories: [] },
    });
  }
};
