import CategoryHero from "@/components/categories/CategoryHero";
import ProductList from "@/components/products/ProductList";
import { getCategoryBySlug } from "@/lib/data-fetching";
import { useFilterStore } from "@/store/useFilterStore";
import { useProductStore } from "@/store/useProductStore";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = await params;
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
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  const page = parseInt((searchParams?.page as string) ?? "1");
  const brands = (searchParams?.brands as string)?.split(",");
  const skin_types = (searchParams?.skin_types as string)?.split(",");
  const concerns = (searchParams?.concerns as string)?.split(",");
  const minPrice = searchParams?.minPrice
    ? parseInt(searchParams.minPrice as string)
    : undefined;
  const maxPrice = searchParams?.maxPrice
    ? parseInt(searchParams.maxPrice as string)
    : undefined;
  const sortBy = (searchParams?.sortBy as string) ?? "createdAt";
  const sortOrder = (searchParams?.sortOrder as "asc" | "desc") ?? "desc";

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
