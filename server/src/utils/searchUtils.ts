// server/src/utils/searchUtils.ts

/**
 * متن را تمیز و استاندارد می‌کند (حذف اعراب و کاراکترهای خاص)
 */
export const cleanText = (text: string) => {
  if (!text) return text;
  return text
    .replace(/\u200c/g, " ") // نیم‌فاصله به فاصله
    .replace(/[\u064b-\u065f]/g, "") // حذف اعراب
    .trim();
};

/**
 * تمام حالت‌های نوشتاری ممکن برای یک کلمه را تولید می‌کند.
 * شامل: ک/ك، ی/ي، آ/ا
 */
export const generateVariations = (term: string): string[] => {
  const variations = new Set<string>();

  // ۱. اضافه کردن خود کلمه اصلی
  variations.add(term);

  // ۲. نرمال‌سازی به فارسی خالص (برای حالتی که کاربر عربی تایپ کرده)
  const persianNormalized = term.replace(/ي/g, "ی").replace(/ك/g, "ک");
  variations.add(persianNormalized);

  // ۳. نرمال‌سازی به عربی (برای حالتی که دیتابیس عربی است)
  const arabicNormalized = term.replace(/ی/g, "ي").replace(/ک/g, "ك");
  variations.add(arabicNormalized);

  // ۴. مدیریت الف و آ (شامل آ، ا، أ، إ)
  // این کار را روی تمام وریشن‌های قبلی انجام می‌دهیم
  const currentVariations = Array.from(variations);

  currentVariations.forEach((v) => {
    // تبدیل تمام انواع الف به "ا" ساده
    const simpleAlef = v.replace(/[آأإ]/g, "ا");
    variations.add(simpleAlef);

    // اگر کلمه با "ا" شروع شده، حالت با "آ" را هم اضافه کن
    if (v.startsWith("ا")) {
      variations.add("آ" + v.substring(1));
    }
    // اگر کلمه با "آ" شروع شده، حالت با "ا" را هم اضافه کن
    if (v.startsWith("آ")) {
      variations.add("ا" + v.substring(1));
    }
  });

  return Array.from(variations);
};
