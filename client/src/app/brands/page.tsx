import Image from "next/image";
import { fetchAllBrands } from "@/lib/data-fetching";
import { Metadata } from "next";
import BrandsDirectory from "@/components/brands/BrandsDirectory"; // کامپوننت جدید
import { AnimatedGrid } from "@/components/ui/animated-grid"; // برای هدر زیبا

export const metadata: Metadata = {
  title: "برندهای معتبر",
  description:
    "مجموعه‌ای کامل از بهترین و معتبرترین برندهای زیبایی جهان در تیامارا.",
  openGraph: {
    title: "برندهای تیامارا",
    images: ["/images/brand-banner.webp"],
  },
};

const BrandsPage = async () => {
  // دریافت دیتا در سمت سرور
  const brands = await fetchAllBrands();

  return (
    <div className="min-h-screen bg-white">
      {/* --- هدر ایمرسیو و جذاب --- */}
      <div className="relative h-[35vh] min-h-[300px] w-full bg-neutral-950 flex flex-col items-center justify-center overflow-hidden">
        <AnimatedGrid className="opacity-30" />

        <div className="relative z-10 text-center px-4 space-y-6 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
            تالار برندها
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed">
            مجموعه‌ای از اصیل‌ترین نام‌ها در دنیای زیبایی،{" "}
            <br className="hidden md:block" />
            گردآوری شده با وسواس برای شما.
          </p>
        </div>

        {/* افکت محو شدن پایین هدر برای ادغام با بدنه */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-20" />
      </div>

      {/* --- بدنه اصلی (کلاینت کامپوننت) --- */}
      <div className="relative z-30 -mt-12">
        <BrandsDirectory allBrands={brands} />
      </div>
    </div>
  );
};

export default BrandsPage;
