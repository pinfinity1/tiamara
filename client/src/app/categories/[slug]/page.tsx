import CategoryHero from "@/components/categories/CategoryHero";
import ProductList from "@/components/products/ProductList";
import { getCategoryBySlug } from "@/lib/data-fetching";
import { useFilterStore } from "@/store/useFilterStore";
import { useProductStore } from "@/store/useProductStore";
import { Metadata } from "next";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params; // ✅ چون Promise هست
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "دسته‌بندی یافت نشد",
    };
  }

  return {
    title: category.metaTitle || category.name,
    description:
      category.metaDescription ||
      `خرید بهترین محصولات در دسته‌بندی ${category.name}.`,
    openGraph: {
      title: category.metaTitle || category.name,
      description:
        category.metaDescription ||
        `خرید بهترین محصولات در دسته‌بندی ${category.name}.`,
      images: [category.imageUrl || "/images/placeholder.png"],
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params; // ✅
  const resolvedSearchParams = (searchParams ? await searchParams : {}) || {};
  const category = await getCategoryBySlug(slug);

  const page = parseInt((resolvedSearchParams.page as string) ?? "1");
  const brands = (resolvedSearchParams.brands as string)?.split(",");
  const skin_types = (resolvedSearchParams.skin_types as string)?.split(",");
  const concerns = (resolvedSearchParams.concerns as string)?.split(",");
  const minPrice = resolvedSearchParams.minPrice
    ? parseInt(resolvedSearchParams.minPrice as string)
    : undefined;
  const maxPrice = resolvedSearchParams.maxPrice
    ? parseInt(resolvedSearchParams.maxPrice as string)
    : undefined;
  const sortBy = (resolvedSearchParams.sortBy as string) ?? "createdAt";
  const sortOrder =
    (resolvedSearchParams.sortOrder as "asc" | "desc") ?? "desc";

  await Promise.all([
    useProductStore.getState().fetchProductsForClient({
      page,
      limit: 12,
      categories: category ? [category.name] : [],
      brands,
      skin_types,
      concerns,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    }),
    useFilterStore.getState().fetchFilters(),
  ]);

  const { products, totalPages, totalProducts } = useProductStore.getState();
  const { filters } = useFilterStore.getState();

  return (
    <div>
      <CategoryHero category={category} />
      <ProductList
        initialProducts={products}
        initialTotalPages={totalPages}
        initialTotalProducts={totalProducts}
        filters={filters}
        activeCategoryName={category?.name}
      />
    </div>
  );
}
