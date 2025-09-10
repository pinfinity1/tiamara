import ProductList from "@/components/products/ProductList";
import { useProductStore } from "../../store/useProductStore";
import Loading from "./loading";
import { Suspense } from "react";

export default async function ProductsPage() {
  await useProductStore
    .getState()
    .fetchProductsForClient({ page: 1, limit: 12 });
  const initialProducts = useProductStore.getState().products;
  const { totalPages, totalProducts } = useProductStore.getState();

  return (
    <Suspense fallback={<Loading />}>
      <ProductList
        initialProducts={initialProducts}
        initialTotalPages={totalPages}
        initialTotalProducts={totalProducts}
      />
    </Suspense>
  );
}
