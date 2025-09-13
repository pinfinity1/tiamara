import { Brand } from "@/store/useBrandStore";
import Image from "next/image";
import ImagePlaceholder from "../common/ImagePlaceholder";

export default function BrandHero({ brand }: { brand: Brand | null }) {
  if (!brand) {
    return null;
  }

  return (
    <div className="bg-gray-50 border-b">
      <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-md">
            {brand.logoUrl ? (
              <Image
                src={brand.logoUrl}
                alt={`${brand.name} logo`}
                fill
                className="object-contain bg-white p-2"
              />
            ) : (
              <ImagePlaceholder />
            )}
          </div>
        </div>
        <div className="text-center md:text-right">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {brand.name}
          </h1>
          {brand.metaDescription && (
            <p className="mt-4 text-lg text-gray-600 max-w-2xl">
              {brand.metaDescription}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
