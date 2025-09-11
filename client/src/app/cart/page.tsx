"use client";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";

function UserCartPage() {
  const { items, updateCartItemQuantity, removeFromCart, isLoading } =
    useCartStore();
  const router = useRouter();
  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-6">سبد خرید شما</h1>
        {isLoading ? (
          <p>در حال بارگذاری سبد خرید...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg mb-4">سبد خرید شما خالی است.</p>
            <Button asChild>
              <Link href="/products">مشاهده محصولات</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="rounded-lg object-cover"
                      />
                      <div>
                        <h2 className="font-semibold">{item.name}</h2>
                        <p className="text-sm text-gray-500">
                          {item.price.toLocaleString("fa-IR")} تومان
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 border rounded-md p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateCartItemQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateCartItemQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
              <h2 className="text-lg font-semibold mb-4">خلاصه سفارش</h2>
              <div className="flex justify-between mb-2">
                <p>مجموع قیمت</p>
                <p>{total.toLocaleString("fa-IR")} تومان</p>
              </div>
              <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t">
                <p>مبلغ قابل پرداخت</p>
                <p>{total.toLocaleString("fa-IR")} تومان</p>
              </div>
              <Button
                className="w-full mt-6"
                size="lg"
                onClick={() => router.push("/checkout")}
              >
                ادامه و پرداخت
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserCartPage;
