import { Brand } from "@/store/useBrandStore";
import Image from "next/image";
import Link from "next/link";

interface FeaturedBrandsProps {
  brands: Brand[];
}

export default function FeaturedBrands({ brands }: FeaturedBrandsProps) {
  if (!brands || brands.length < 4) {
    return null;
  }

  return (
    <section className="bg-gray-50/70 py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
            خرید از برترین برندها
          </h2>
          <p className="mt-2 text-md text-gray-500">
            مجموعه‌ای از بهترین‌ها، برای شما
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-8">
          {brands.slice(0, 6).map((brand) => (
            <Link
              href={`/brands/${brand.slug}`}
              key={brand.id}
              className="group flex flex-col items-center text-center gap-3 transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="relative h-24 w-24 rounded-full overflow-hidden border border-gray-200 bg-white shadow-sm flex items-center justify-center p-4">
                <Image
                  src={brand.logoUrl || "/images/placeholder.png"}
                  alt={brand.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <h3 className="font-semibold text-gray-800 transition-colors group-hover:text-primary">
                {brand.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
