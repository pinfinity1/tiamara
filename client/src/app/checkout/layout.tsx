// client/src/app/checkout/layout.tsx
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "تکمیل خرید و پرداخت | تیامارا",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <CheckoutHeader />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl w-full">
        {children}
      </main>

      {/* فوتر مینیمال */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t bg-white">
        <div className="flex flex-col gap-2">
          <p>&copy; {new Date().getFullYear()} فروشگاه اینترنتی تیامارا</p>
          <p>خرید امن با درگاه پرداخت بانکی معتبر</p>
        </div>
      </footer>
    </div>
  );
}
