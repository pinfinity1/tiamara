import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const AmazingOfferIntroSlide = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-white p-4">
      <h2 className="text-3xl font-extrabold drop-shadow-md">
        پیشنهاد شگفت‌انگیز
      </h2>
      <p className="text-lg mb-6 drop-shadow-sm">
        بهترین محصولات با تخفیف‌های ویژه
      </p>
      <Button asChild variant="secondary" className="rounded-full shadow-lg">
        <Link href="/products?sort=discount">
          مشاهده همه
          <ArrowLeft className="h-4 w-4 mr-2" />
        </Link>
      </Button>
    </div>
  );
};

export default AmazingOfferIntroSlide;
