import { Metadata } from "next";
import { getBrandBySlug } from "@/lib/data-fetching";
import BrandHero from "@/components/brands/BrandHero";
import BrandShop from "@/components/brands/BrandShop";
import { notFound } from "next/navigation";
import { Sparkles, Quote } from "lucide-react";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) return { title: "برند یافت نشد" };

  return {
    title: brand.metaTitle || `${brand.name} | محصولات اورجینال`,
    description:
      brand.metaDescription ||
      `خرید اینترنتی محصولات برند ${brand.name} با ضمانت اصالت کالا از تیامارا.`,
    openGraph: {
      images: [
        brand.coverImageUrl || brand.logoUrl || "/images/placeholder.png",
      ],
    },
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* ۱. هدر اصلی (بدون تغییر، چون خوب بود) */}
      <BrandHero brand={brand} />

      {/* ۲. بخش معرفی و داستان برند (اضافه شده برای حس لوکس بودن) */}
      <section className="relative z-10 -mt-8 mb-12">
        <div className="container mx-auto px-4">
          {/* استفاده از طرح شیشه‌ای (Glassmorphism) ملایم به جای باکس سفید ساده */}
          <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md border border-white/40 shadow-sm rounded-3xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-neutral-50 rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-neutral-400" />
            </div>

            <h2 className="text-2xl md:text-4xl font-black text-neutral-900 mb-6 tracking-tight">
              درباره {brand.englishName}
            </h2>

            <div className="relative">
              <Quote className="absolute -top-4 -right-4 w-8 h-8 text-neutral-100 rotate-180" />
              <p className="text-neutral-600 text-lg leading-relaxed font-light">
                {brand.metaDescription ||
                  `برند ${brand.name} یکی از پیشگامان صنعت زیبایی است که با محصولات نوآورانه خود، استانداردهای جدیدی را تعریف کرده است. تمام محصولات این برند در تیامارا با ضمانت اصالت عرضه می‌شوند.`}
              </p>
              <Quote className="absolute -bottom-4 -left-4 w-8 h-8 text-neutral-100" />
            </div>
          </div>
        </div>
      </section>

      {/* ۳. فروشگاه محصولات */}
      <div className="container mx-auto px-4 relative z-0">
        {/* خط جداکننده مینیمال */}
        <div className="flex items-center gap-4 mb-12 opacity-50">
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-neutral-300 to-transparent" />
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            مجموعه محصولات
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
        </div>

        {/* اینجا دیگر باکس سفید و سایه سنگین نداریم. 
            محصولات مستقیم روی پس‌زمینه سفید قرار می‌گیرند که حس تمیزی و مدرن بودن می‌دهد.
        */}
        <div className="min-h-[600px]">
          <BrandShop brandName={brand.name} />
        </div>
      </div>
    </div>
  );
}
