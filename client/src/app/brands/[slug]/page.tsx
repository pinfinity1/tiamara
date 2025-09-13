import BrandHero from "@/components/brands/BrandHero";
import ProductList from "@/components/products/ProductList";
import { getBrandBySlug } from "@/lib/data-fetching";
import { useFilterStore } from "@/store/useFilterStore";
import { useProductStore } from "@/store/useProductStore";

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { slug } = params;
  const brand = await getBrandBySlug(slug);

  const page = parseInt((searchParams?.page as string) ?? "1");
  const sortBy = (searchParams?.sortBy as string) ?? "createdAt";
  const sortOrder = (searchParams?.sortOrder as "asc" | "desc") ?? "desc";

  await useProductStore.getState().fetchProductsForClient({
    page,
    limit: 12,
    brands: brand ? [brand.name] : [],
    sortBy,
    sortOrder,
  });

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
