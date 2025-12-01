// client/src/lib/data/get-filters.ts

const BASE_URL = process.env.API_BASE_URL_SERVER || "http://localhost:5001/api";

export interface FilterOption {
  id: string;
  name: string;
  englishName?: string;
  slug: string;
}

export interface FilterResponse {
  brands: FilterOption[];
  categories: FilterOption[];
  priceRange: {
    min: number;
    max: number;
  };
}

export async function getFilters(): Promise<FilterResponse> {
  try {
    const res = await fetch(`${BASE_URL}/products/filters`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error("Failed to fetch filters");

    const data = await res.json();

    if (data.success && data.filters) {
      const serverMin = data.filters.priceRange.min;
      const serverMax = data.filters.priceRange.max;

      return {
        brands: data.filters.brands || [],
        categories: data.filters.categories || [],
        priceRange: {
          min: serverMin ?? 0,
          max: serverMax && serverMax > 0 ? serverMax : 1000000,
        },
      };
    }

    return { brands: [], categories: [], priceRange: { min: 0, max: 1000000 } };
  } catch (error) {
    console.error("Error fetching filters:", error);
    return { brands: [], categories: [], priceRange: { min: 0, max: 1000000 } };
  }
}
