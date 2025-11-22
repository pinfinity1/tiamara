// client/src/components/checkout/CheckoutHeader.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";

export default function CheckoutHeader() {
  return (
    <header className="bg-white border-b sticky top-0 z-50 h-16 shadow-sm">
      <div className="container mx-auto px-4 h-full flex items-center justify-between max-w-7xl">
        {/* دکمه بازگشت */}
        <Link
          href="/"
          className="flex items-center text-sm font-medium text-gray-600 hover:text-primary transition-colors group"
        >
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          <span className="hidden sm:inline">بازگشت به فروشگاه</span>
          <span className="sm:hidden">بازگشت</span>
        </Link>

        {/* لوگو */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center h-full"
        >
          <Image
            src="/images/Logo/tiamara-logo.png"
            alt="Tiamara"
            width={120}
            height={40}
            className="h-[90%] w-auto"
            priority
          />
        </Link>

        {/* نماد اعتماد */}
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-green-100">
          <ShieldCheck className="w-5 h-5" />
          <span>پرداخت امن</span>
        </div>
      </div>
    </header>
  );
}
