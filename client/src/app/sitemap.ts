import { MetadataRoute } from "next";
import { axiosPublic } from "@/lib/axios";
import { Product } from "@/store/useProductStore";
import { Category } from "@/store/useCategoryStore";
import { Brand } from "@/store/useBrandStore";

const BASE_URL = "http://www.tiamara.ir";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const staticRoutes = [
      "/",
      "/products",
      "/about-us",
      "/contact-us",
      "/terms",
      "/privacy",
      "/chat",
    ].map((route) => ({
      url: `${BASE_URL}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as "weekly",
      priority: route === "/" ? 1 : 0.8,
    }));

    const productsRes = await axiosPublic.get("/products/fetch-admin-products");
    const products = productsRes.data as Product[];
    const productRoutes = products.map((product) => ({
      url: `${BASE_URL}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt).toISOString(),
      changeFrequency: "weekly" as "weekly",
      priority: 0.9,
    }));

    const categoriesRes = await axiosPublic.get("/categories");
    const categories = categoriesRes.data.categories as Category[];
    const categoryRoutes = categories.map((category) => ({
      url: `${BASE_URL}/categories/${category.slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as "weekly",
      priority: 0.7,
    }));

    const brandsRes = await axiosPublic.get("/brands");
    const brands = brandsRes.data.brands as Brand[];
    const brandRoutes = brands.map((brand) => ({
      url: `${BASE_URL}/brands/${brand.slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as "weekly",
      priority: 0.7,
    }));

    return [
      ...staticRoutes,
      ...productRoutes,
      ...categoryRoutes,
      ...brandRoutes,
    ];
  } catch (error) {
    console.error("Failed to generate sitemap:", error);
    return [
      { url: BASE_URL, lastModified: new Date().toISOString() },
      { url: `${BASE_URL}/products`, lastModified: new Date().toISOString() },
    ];
  }
}
