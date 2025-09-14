import { getProductBySlug, getRelatedProducts } from "@/lib/data-fetching";
import ProductDetails from "./ProductDetails";

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const relatedProducts = await getRelatedProducts(
    product?.id || "",
    product?.category?.name
  );

  return <ProductDetails product={product} relatedProducts={relatedProducts} />;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "محصول یافت نشد",
      description: "محصولی با این مشخصات در فروشگاه وجود ندارد.",
    };
  }

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.description,
    openGraph: {
      title: product.metaTitle || product.name,
      description: product.metaDescription || product.description,
      images: [
        {
          url: product.images[0]?.url || "/images/placeholder.png",
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
  };
}
