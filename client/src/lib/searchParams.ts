import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";

// تعریف پارامترهای مجاز در URL
export const searchParamsParsers = {
  // جستجوی متنی
  q: parseAsString.withDefault(""),

  // دسته‌بندی‌ها (آرایه‌ای از رشته‌ها) -> ?categories=skin,hair
  categories: parseAsArrayOf(parseAsString).withDefault([]),

  // برندها
  brands: parseAsArrayOf(parseAsString).withDefault([]),

  // قیمت (پیش‌فرض‌ها را بعداً دقیق‌تر می‌کنیم)
  minPrice: parseAsInteger.withDefault(0),
  maxPrice: parseAsInteger.withDefault(100000000), // مثلا ۱۰۰ میلیون

  // مرتب‌سازی
  sort: parseAsString.withDefault("newest"),

  // صفحه‌بندی
  page: parseAsInteger.withDefault(1),
};

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);
