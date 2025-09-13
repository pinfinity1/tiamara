import { Category } from "@/store/useCategoryStore";
import Image from "next/image";
import ImagePlaceholder from "../common/ImagePlaceholder";

export default function CategoryHero({
  category,
}: {
  category: Category | null;
}) {
  if (!category) {
    return null;
  }

  return (
    <div className="relative bg-gray-900 text-white">
      {category.imageUrl ? (
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          className="object-cover w-full h-full opacity-40"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900" />
      )}
      <div className="relative container mx-auto px-4 py-12 md:py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold">{category.name}</h1>
        {category.metaDescription && (
          <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-300">
            {category.metaDescription}
          </p>
        )}
      </div>
    </div>
  );
}
