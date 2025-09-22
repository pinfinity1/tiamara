import { axiosPublic } from "@/lib/axios";
import { FeatureBanner, ProductCollection } from "@/store/useHomepageStore";
import { Product } from "@/store/useProductStore";
import { Brand } from "@/store/useBrandStore";
import { Category } from "@/store/useCategoryStore";

// Explicitly define the return type for the function
export async function getHomepageData(): Promise<{
  banners: FeatureBanner[];
  collections: ProductCollection[];
  error: string | null;
}> {
  try {
    const bannerGroup = "home-banner";

    const [bannersRes, collectionsRes] = await Promise.all([
      axiosPublic.get(`/homepage/banners?group=${bannerGroup}`),
      axiosPublic.get("/homepage/collections?location=homepage"),
    ]);

    return {
      banners: bannersRes.data.banners || [],
      collections: collectionsRes.data.collections || [],
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
    return {
      banners: [],
      collections: [],
      error: "Could not load homepage data.",
    };
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await axiosPublic.get(`/products/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch product with slug "${slug}":`, error);
    return null;
  }
}

export async function getRelatedProducts(
  productId: string,
  categoryName: string | null | undefined
): Promise<Product[]> {
  if (!categoryName) return [];
  try {
    const response = await axiosPublic.get(`/products/fetch-client-products`, {
      params: {
        categories: categoryName,
        limit: 5,
      },
    });
    const related = response.data.products.filter(
      (p: Product) => p.id !== productId
    );
    return related.slice(0, 4);
  } catch (error) {
    console.error("Failed to fetch related products:", error);
    return [];
  }
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  try {
    const response = await axiosPublic.get(`/brands/slug/${slug}`);
    return response.data.brand;
  } catch (error) {
    console.error(`Failed to fetch brand with slug "${slug}":`, error);
    return null;
  }
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  try {
    const response = await axiosPublic.get(`/categories/slug/${slug}`);
    return response.data.category;
  } catch (error) {
    console.error(`Failed to fetch category with slug "${slug}":`, error);
    return null;
  }
}
