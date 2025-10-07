import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const StaticOfferCard = () => {
  return (
    <Link
      href="/products?sort=discount"
      className="flex flex-col items-center justify-center h-full bg-white rounded-lg border-2 border-dashed border-gray-300 text-gray-700"
    >
      <div className="text-center">
        <h3 className="font-bold text-lg">مشاهده همه</h3>
        <p className="text-sm mt-1">تخفیف‌های شگفت‌انگیز</p>
        <ArrowLeft className="h-6 w-6 mx-auto mt-4" />
      </div>
    </Link>
  );
};

export default StaticOfferCard;
