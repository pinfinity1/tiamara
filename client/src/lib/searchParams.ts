import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";

export const searchParamsParsers = {
  search: parseAsString.withDefault(""),

  categories: parseAsArrayOf(parseAsString).withDefault([]),
  brands: parseAsArrayOf(parseAsString).withDefault([]),
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  sort: parseAsString.withDefault("newest"),
  page: parseAsInteger.withDefault(1),

  inStock: parseAsString.withDefault("false"),

  // پارامترهای بولین (رشته‌ای پارس می‌شوند)
  hasDiscount: parseAsString.withDefault("false"),
  profileBasedFilter: parseAsString.withDefault("false"),
};

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);
