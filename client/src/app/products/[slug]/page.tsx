import { axiosPublic } from "@/lib/axios";
import { Product } from "@/store/useProductStore";

import Loading from "./loading";
import { getProductBySlug, getRelatedProducts } from "@/lib/data-fetching";
import ProductDetails from "./ProductDetails";

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
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
  const product = await getProductBySlug(params.slug);

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
          url: product.images[0]?.url || "/placeholder.png",
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
  };
}
