import { Brand } from "@/store/useBrandStore";
import { Category } from "@/store/useCategoryStore";
import { Product } from "@/store/useProductStore";

// Defines the types of links the admin can choose from
export const LINK_TYPES = {
  MANUAL: "manual",
  PRODUCT: "product",
  BRAND: "brand",
  CATEGORY: "category",
  STATIC: "static",
};

// A list of predefined static pages in the application
export const STATIC_PAGES = [
  { label: "صفحه اصلی", value: "/" },
  { label: "همه محصولات", value: "/products" },
  { label: "درباره ما", value: "/about-us" },
  { label: "تماس با ما", value: "/contact-us" },
  { label: "قوانین و مقررات", value: "/terms" },
  { label: "حریم خصوصی", value: "/privacy" },
];

/**
 * Generates a user-friendly label for a given link URL.
 * @param url The URL to generate a label for.
 * @param products List of all products.
 * @param brands List of all brands.
 * @param categories List of all categories.
 * @returns A human-readable label for the URL.
 */
export const getLinkLabel = (
  url: string,
  products: Product[],
  brands: Brand[],
  categories: Category[]
): string => {
  const staticPage = STATIC_PAGES.find((p) => p.value === url);
  if (staticPage) return `صفحه: ${staticPage.label}`;

  if (url.startsWith("/products/")) {
    const slug = url.substring(10);
    const product = products.find((p) => p.slug === slug);
    return `محصول: ${product?.name || slug}`;
  }
  if (url.startsWith("/brands/")) {
    const slug = url.substring(8);
    const brand = brands.find((b) => b.slug === slug);
    return `برند: ${brand?.name || slug}`;
  }
  if (url.startsWith("/categories/")) {
    const slug = url.substring(12);
    const category = categories.find((c) => c.slug === slug);
    return `دسته‌بندی: ${category?.name || slug}`;
  }

  return url;
};
