import qs from "qs";

const BASE_URL = process.env.API_BASE_URL_SERVER || "http://localhost:5001/api";

interface GetProductsParams {
  search?: string;
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
    search, // دریافت search
    categories,
    brands,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 12,
    hasDiscount,
  } = params;

  let sortBy = "createdAt";
  let sortOrder = "desc";

  if (sort === "price_asc") {
    sortBy = "price";
    sortOrder = "asc";
  } else if (sort === "price_desc") {
    sortBy = "price";
    sortOrder = "desc";
  } else if (sort === "popular") {
    sortBy = "soldCount";
    sortOrder = "desc";
  }

  const queryParams = {
    page,
    limit,
    search, // ارسال مستقیم search به API
    categories,
    brands,
    minPrice,
    maxPrice,
    hasDiscount,
    sortBy,
    sortOrder,
  };

  const queryString = qs.stringify(queryParams, {
    skipNulls: true,
    arrayFormat: "repeat",
  });

  try {
    const res = await fetch(
      `${BASE_URL}/products/fetch-client-products?${queryString}`,
      {
        cache: "no-store",
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
