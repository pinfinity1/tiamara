import qs from "qs";

// آدرس پایه API (برای ارتباط سرور به سرور)
// در داکر معمولا http://server:3001/api است، اما از متغیر محیطی می‌خوانیم
const BASE_URL = process.env.API_BASE_URL_SERVER || "http://localhost:5001/api";

interface GetProductsParams {
  q?: string;
  categories?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
  hasDiscount?: boolean;
}

export async function getProducts(params: GetProductsParams) {
  const {
    q,
    categories,
    brands,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 12,
    hasDiscount,
  } = params;

  const queryParams = {
    page,
    limit,
    search: q,
    categories: categories?.join(","),
    brands: brands?.join(","),
    minPrice,
    maxPrice,
    hasDiscount,
    sortBy: sort?.includes("price") ? "price" : "createdAt",
    sortOrder: sort?.includes("asc") ? "asc" : "desc",
  };

  const queryString = qs.stringify(queryParams, { skipNulls: true });

  try {
    console.log(
      "Fetching URL:",
      `${BASE_URL}/products/fetch-client-products?${queryString}`
    );

    // استفاده از fetch با no-store برای جلوگیری از کش شدن نتیجه
    const res = await fetch(
      `${BASE_URL}/products/fetch-client-products?${queryString}`,
      {
        cache: "no-store", // 👈 کلید حل مشکل شما: همیشه دیتای تازه بگیر
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const data = await res.json();

    if (!data.success) {
      return emptyResult;
    }

    return {
      products: data.products,
      metadata: {
        totalCount: data.totalProducts,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        hasNextPage: data.currentPage < data.totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return emptyResult;
  }
}

const emptyResult = {
  products: [],
  metadata: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
  },
};
