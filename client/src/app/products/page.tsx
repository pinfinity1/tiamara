import ProductList from "@/components/products/ProductList";
import { useProductStore } from "../../store/useProductStore";
import { useFilterStore } from "@/store/useFilterStore";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const page = parseInt(params?.page ?? "1");
  const categories = params?.categories?.split(",");
  const brands = params?.brands?.split(",");
  const skin_types = params?.skin_types?.split(",");
  const concerns = params?.concerns?.split(",");
  const minPrice = params?.minPrice ? parseInt(params.minPrice) : undefined;
  const maxPrice = params?.maxPrice ? parseInt(params.maxPrice) : undefined;
  const sortBy = params?.sortBy ?? "createdAt";
  const sortOrder = (params?.sortOrder as "asc" | "desc") ?? "desc";
  const profileBasedFilter = params?.profileBasedFilter === "true";

  await Promise.all([
    useProductStore.getState().fetchProductsForClient({
      page,
      limit: 12,
      categories,
      brands,
      skin_types,
      concerns,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      profileBasedFilter,
    }),
    useFilterStore.getState().fetchFilters(),
  ]);

  const { products, totalPages, totalProducts } = useProductStore.getState();
  const { filters } = useFilterStore.getState();

  return (
    <ProductList
      initialProducts={products}
      initialTotalPages={totalPages}
      initialTotalProducts={totalProducts}
      filters={filters}
    />
  );
}
