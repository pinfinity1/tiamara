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
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  const resolvedSearchParams = (await searchParams) || {};

  const page = parseInt((resolvedSearchParams?.page as string) ?? "1");
  const sortBy = (resolvedSearchParams?.sortBy as string) ?? "createdAt";
  const sortOrder =
    (resolvedSearchParams?.sortOrder as "asc" | "desc") ?? "desc";

  // Fetch only products for this brand
  await useProductStore.getState().fetchProductsForClient({
    page,
    limit: 12,
    brands: brand ? [brand.name] : [],
    sortBy,
    sortOrder,
  });

  // Fetch all filters to still allow sorting and other potential future filters
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
        // We hide the general filters sidebar for a cleaner brand page
        hideFilters
      />
    </div>
  );
}
