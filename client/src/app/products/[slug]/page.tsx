import { getProductBySlug, getRelatedProducts } from "@/lib/data-fetching";
import ProductDetails from "./ProductDetails";
import { Product } from "@/store/useProductStore";
import Script from "next/script";
import { Metadata } from "next";

function JsonLd({ product }: { product: Product }) {
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => img.url),
    description: product.metaDescription || product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand?.name,
    },
    offers: {
      "@type": "Offer",
      url: `https://www.tiamara.ir/products/${product.slug}`,
      priceCurrency: "IRR",
      price: (product.discount_price || product.price) * 10,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toISOString(),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "خانه",
        item: "https://www.tiamara.ir",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category?.name || "محصولات",
        item: `https://www.tiamara.ir/categories/${product.category?.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
      },
    ],
  };

  return (
    <>
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  const relatedProducts = await getRelatedProducts(
    product?.id || "",
    product?.category?.name
  );

  return (
    <>
      {product && <JsonLd product={product} />}
      <ProductDetails product={product} relatedProducts={relatedProducts} />
    </>
  );
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "محصول یافت نشد",
      description: "محصولی با این مشخصات در فروشگاه وجود ندارد.",
    };
  }

  return {
    title: product.metaTitle || product.name || undefined,
    description: product.metaDescription || product.description || undefined,
    openGraph: {
      title: product.metaTitle || product.name || undefined,
      description: product.metaDescription || product.description || undefined,
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
