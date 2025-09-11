import { axiosPublic } from "@/lib/axios";
import { FeatureBanner, HomepageSection } from "@/store/useHomepageStore";
import { Product } from "@/store/useProductStore";

// home page sections
export async function getHomepageData(): Promise<{
  banners: FeatureBanner[];
  sections: HomepageSection[];
}> {
  try {
    const [bannersRes, sectionsRes] = await Promise.all([
      axiosPublic.get(`/homepage/banners`),
      axiosPublic.get(`/homepage/homepage-sections`),
    ]);

    const banners = bannersRes.data.banners || [];
    const sections = sectionsRes.data.sections || [];

    return { banners, sections };
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
    return { banners: [], sections: [] };
  }
}

// product/[slug] page.tsx
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
