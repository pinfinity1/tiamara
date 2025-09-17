import { getProductBySlug, getRelatedProducts } from "@/lib/data-fetching";
import ProductDetails from "./ProductDetails";
import { Product } from "@/store/useProductStore";
import Script from "next/script";

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
    // اگر سیستم امتیازدهی دارید، این بخش را از کامنت خارج کنید
    // aggregateRating: {
    //   '@type': 'AggregateRating',
    //   ratingValue: product.average_rating || '4.5',
    //   reviewCount: product.review_count || '89',
    // },
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
        item: `http://localhost:3000/categories/${product.category?.slug}`,
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

  return (
    <>
      {product && <JsonLd product={product} />}
      <ProductDetails product={product} relatedProducts={relatedProducts} />
    </>
  );
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
