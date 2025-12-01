import Link from "next/link";
import Image from "next/image";
import { fetchAllBrands } from "@/lib/data-fetching"; // تابع دریافت دیتا از سرور
import { Brand } from "@/store/useBrandStore";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "همه برندها",
  description:
    "مجموعه‌ای کامل از بهترین و معتبرترین برندهای زیبایی و مراقبت از پوست جهان، گردآوری شده در فروشگاه تیامارا.",
  openGraph: {
    title: "کشف برندهای برتر در تیامارا",
    description: "بهترین برندهای آرایشی و بهداشتی را در تیامارا پیدا کنید.",
    images: [
      {
        url: "/images/brand-banner.webp",
        width: 1200,
        height: 630,
        alt: "برندهای تیامارا",
      },
    ],
  },
  alternates: {
    canonical: "/brands",
  },
};

const BrandsPage = async () => {
  const brands: Brand[] = await fetchAllBrands();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header/Banner */}
      <div className="relative bg-gray-100 rounded-2xl p-8 md:p-12 mb-10 overflow-hidden text-center">
        <div className="absolute inset-0">
          <Image
            src="/images/abstract-design-1.png"
            alt="Tiamara Categories"
            width={750}
            height={200}
            className="m-auto opacity-20 object-fit"
          />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800">
            کشف برندهای برتر
          </h1>
          <p className="mt-4 text-md md:text-lg text-gray-600 max-w-2xl mx-auto">
            مجموعه‌ای از بهترین و معتبرترین برندهای زیبایی و مراقبت از پوست،
            گردآوری شده برای شما.
          </p>
        </div>
      </div>

      {/* Brands Grid */}
      {/* دیگر نیازی به Skeleton نیست چون دیتا از قبل آماده است */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {brands.map((brand) => (
          <Link href={`/brands/${brand.slug}`} key={brand.id} legacyBehavior>
            <a className="group flex flex-col items-center text-center gap-3 p-4 rounded-xl transition-all duration-300 hover:bg-gray-100 hover:shadow-lg">
              <div className="relative h-16 w-16 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-[102%]">
                <Image
                  src={brand.logoUrl || "/images/placeholder.png"}
                  alt={brand.name}
                  fill
                  className="w-[50%] h-[50%] object-cover"
                />
              </div>
              <h3 className="font-semibold text-gray-800">{brand.name}</h3>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BrandsPage;
