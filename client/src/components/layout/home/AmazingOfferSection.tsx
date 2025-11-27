import { getCollectionByType } from "@/lib/data-fetching";
import ItemsCarousel from "@/components/common/carousel/ItemsCarousel";
import AmazingOfferProductCard from "@/components/products/AmazingOfferProductCard";
import CountdownTimer from "./CountdownTimer";
import { GridPattern } from "@/components/ui/grid-pattern";
import Link from "next/link";
import { ArrowLeft, Gift, Timer } from "lucide-react";
import Image from "next/image";

interface ExtendedCollection {
  id: string;
  title: string;
  products: any[];
  expiresAt?: string | null;
  imageUrl?: string | null;
}

export default async function AmazingOfferSection() {
  const collection = (await getCollectionByType(
    "DISCOUNTED"
  )) as ExtendedCollection | null;

  if (!collection || !collection.products || collection.products.length === 0) {
    return null;
  }

  let targetDate = collection.expiresAt;
  if (!targetDate) {
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    targetDate = tomorrow.toISOString();
  }

  return (
    <section className="container mx-auto px-4 my-8 md:my-10">
      <div className="relative w-full rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-xl shadow-rose-100/40 flex flex-col lg:flex-row">
        {/* ========================================= */}
        {/* 🎨 باکس اطلاعات (بالا در موبایل / راست در دسکتاپ) */}
        {/* ========================================= */}
        <div className="relative z-20 w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 bg-rose-50/50 border-b lg:border-b-0 lg:border-l border-rose-100 p-5 lg:p-4 flex flex-col items-center justify-center text-center overflow-hidden shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] lg:shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
          <GridPattern
            width={20}
            height={20}
            x={-1}
            y={-1}
            className="absolute inset-0 h-full w-full fill-rose-600/5 stroke-rose-600/10 [mask-image:linear-gradient(to_bottom_left,white,transparent)]"
          />

          <div className="relative z-10 w-full flex flex-col items-center gap-4 lg:gap-5">
            {/* لوگو و عنوان */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-20 h-10 lg:w-24 lg:h-12 drop-shadow-md">
                <Image
                  src="/images/Logo/tiamara-logo.png"
                  alt="Amazing Offer"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-black text-gray-900 leading-tight">
                  {collection.title || "پیشنهاد شگفت‌انگیز"}
                </h2>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-rose-100 shadow-sm text-rose-600 text-[10px] lg:text-[11px] font-bold">
                  <Gift className="w-3 h-3" />
                  <span>تخفیف‌های ویژه</span>
                </div>
              </div>
            </div>

            {/* تایمر (جمع و جورتر) */}
            <div className="w-full max-w-[280px] bg-white/60 backdrop-blur-sm border border-rose-100/50 rounded-xl p-2 lg:p-3 shadow-sm">
              <div className="flex items-center justify-center gap-1.5 mb-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                <Timer className="w-3 h-3" />
                زمان باقی‌مانده
              </div>
              <CountdownTimer targetDate={targetDate} />
            </div>

            {/* دکمه مشاهده همه */}
            <Link
              href="/products?hasDiscount=true"
              className="w-full max-w-[280px] group flex items-center justify-center gap-2 bg-gray-900 text-white py-3 px-4 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              مشاهده همه
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ========================================= */}
        {/* 🛍️ اسلایدر محصولات (پایین در موبایل / چپ در دسکتاپ) */}
        {/* ========================================= */}
        <div className="relative z-10 flex-1 min-w-0 bg-white pt-4 lg:pt-0">
          {" "}
          {/* pt-4 اضافه شد تا فاصله از سایه بالا داشته باشد */}
          <div className="h-full min-h-[360px] lg:min-h-[380px] flex items-center pb-4 lg:py-4">
            <div className="w-full px-0 lg:px-4">
              <ItemsCarousel>
                {collection.products.map((product) => (
                  <div className="h-full py-2 px-1.5 md:px-3" key={product.id}>
                    <AmazingOfferProductCard product={product} />
                  </div>
                ))}
              </ItemsCarousel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
