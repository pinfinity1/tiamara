// client/src/lib/data/get-filters.ts

// آدرس پایه API
const BASE_URL = process.env.API_BASE_URL_SERVER || "http://localhost:5001/api";

export interface FilterOption {
  id: string;
  name: string;
  slug: string;
}

export async function getFilters() {
  try {
    // درخواست موازی برای سرعت بیشتر
    const [brandsRes, categoriesRes] = await Promise.all([
      fetch(`${BASE_URL}/brands`, { next: { revalidate: 3600 } }), // کش ۱ ساعته
      fetch(`${BASE_URL}/categories`, { next: { revalidate: 3600 } }),
    ]);

    const brandsData = await brandsRes.json();
    const categoriesData = await categoriesRes.json();

    return {
      brands: (brandsData.brands || []) as FilterOption[],
      categories: (categoriesData.categories || []) as FilterOption[],
    };
  } catch (error) {
    console.error("Error fetching filters:", error);
    return { brands: [], categories: [] };
  }
}
