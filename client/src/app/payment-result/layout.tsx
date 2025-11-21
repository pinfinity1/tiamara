import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "نتیجه پرداخت | تیامارا",
  robots: { index: false, follow: false },
};

export default function PaymentResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* استفاده از همان هدر مینیمال چک‌اوت */}
      <CheckoutHeader />

      {/* محتوای اصلی در مرکز صفحه */}
      <main className="flex-1 flex items-center justify-center p-4 w-full">
        <div className="w-full max-w-lg">{children}</div>
      </main>

      {/* فوتر ساده */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t bg-white">
        <p>&copy; {new Date().getFullYear()} فروشگاه اینترنتی تیامارا</p>
      </footer>
    </div>
  );
}
