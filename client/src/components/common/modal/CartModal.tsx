"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CartModal() {
  const { items, updateCartItemQuantity, removeFromCart, isLoading } =
    useCartStore();
  const router = useRouter();

  const handleCheckout = () => {
    const trigger = document.getElementById("cart-sheet-trigger");
    if (trigger) {
      trigger.click();
    }
    router.push("/checkout");
  };
  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant={"ghost"}
          className="relative group"
          id="cart-sheet-trigger"
        >
          <ShoppingCart className="size-5" />
          <span className="absolute top-0 right-0 size-4 bg-black/20 backdrop-blur-lg text-black text-[10px] rounded-full flex items-center justify-center pt-0.5 group-hover:-top-1 group-hover:-right-1 group-hover:bg-black/30 transition-all duration-200 ">
            {items?.length.toLocaleString("fa-IR")}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[400px] sm:w-[540px] flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>سبد خرید</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p>در حال بارگذاری...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p>سبد خرید شما خالی است.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6">
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.price.toLocaleString("fa-IR")} تومان
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateCartItemQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateCartItemQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <p>مجموع</p>
                <p>{total.toLocaleString("fa-IR")} تومان</p>
              </div>
              <Button
                className="w-full mt-4"
                size="lg"
                onClick={handleCheckout}
              >
                ادامه فرآیند خرید
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
