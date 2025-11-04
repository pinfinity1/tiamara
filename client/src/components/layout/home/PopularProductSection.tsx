import { getCollectionByType } from "@/lib/data-fetching";
import ProductSlider from "./ProductSlider";

export default async function PopularProductSection() {
  const collection = await getCollectionByType("POPULAR");

  if (!collection || !collection.products || collection.products.length === 0) {
    return null;
  }

  return (
    <ProductSlider
      title={collection.title}
      products={collection.products}
      viewAllLink={`/products?collection=${collection.id}`}
    />
  );
}
