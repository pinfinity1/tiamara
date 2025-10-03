import BrandHero from "@/components/brands/BrandHero";
import ProductList from "@/components/products/ProductList";
import { getBrandBySlug } from "@/lib/data-fetching";
import { useFilterStore } from "@/store/useFilterStore";
import { useProductStore } from "@/store/useProductStore";
import { Metadata } from "next";

// ✅ حالا params و searchParams باید Promise باشن
type BrandPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { slug } = await params; // ✅ await چون Promise هست
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    return {
      title: "برند یافت نشد",
    };
  }

  return {
    title: brand.metaTitle || brand.name,
    description:
      brand.metaDescription ||
      `خرید محصولات اورجینال برند ${brand.name} با بهترین قیمت.`,
    openGraph: {
      title: brand.metaTitle || brand.name,
      description:
        brand.metaDescription ||
        `خرید محصولات اورجینال برند ${brand.name} با بهترین قیمت.`,
      images: [brand.logoUrl || "/images/placeholder.png"],
    },
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: BrandPageProps) {
  const { slug } = await params; // ✅ await چون Promise هست
  const brand = await getBrandBySlug(slug);

  // ✅ searchParams هم Promise هست
  const resolvedSearchParams = (searchParams ? await searchParams : {}) || {};

  const page = parseInt((resolvedSearchParams.page as string) ?? "1");
  const sortBy = (resolvedSearchParams.sortBy as string) ?? "createdAt";
  const sortOrder =
    (resolvedSearchParams.sortOrder as "asc" | "desc") ?? "desc";

  // محصولات این برند رو بگیر
  await useProductStore.getState().fetchProductsForClient({
    page,
    limit: 12,
    brands: brand ? [brand.name] : [],
    sortBy,
    sortOrder,
  });

  // فیلترها رو هم بگیر
  await useFilterStore.getState().fetchFilters();

  const { products, totalPages, totalProducts } = useProductStore.getState();
  const { filters } = useFilterStore.getState();

  return (
    <div>
      <BrandHero brand={brand} />
      <ProductList
        initialProducts={products}
        initialTotalPages={totalPages}
        initialTotalProducts={totalProducts}
        filters={filters}
        hideFilters
      />
    </div>
  );
}
