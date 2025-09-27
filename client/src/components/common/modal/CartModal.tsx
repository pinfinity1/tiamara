"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import ImagePlaceholder from "../ImagePlaceholder";
import Link from "next/link";

export default function CartModal() {
  const router = useRouter();

  const handleCheckout = () => {
    const trigger = document.getElementById("cart-sheet-trigger");
    if (trigger) {
      trigger.click();
    }
    router.push("/checkout");
  };

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
        className="w-[90vw] max-w-[420px] flex flex-col p-0"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-lg font-bold">سبد خرید</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p>در حال بارگذاری...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <ShoppingCart className="h-16 w-16 text-gray-300" />
            <p className="mt-4 font-semibold">سبد خرید شما خالی است.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <Link
                      href={`/products/${item.slug}`}
                      className="block flex-shrink-0"
                      onClick={() =>
                        document.getElementById("cart-sheet-trigger")?.click()
                      }
                    >
                      <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <ImagePlaceholder />
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 flex flex-col justify-between self-stretch">
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() =>
                            document
                              .getElementById("cart-sheet-trigger")
                              ?.click()
                          }
                        >
                          <h3 className="font-semibold text-sm leading-tight hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 flex-shrink-0 text-red-500 hover:text-red-600"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-sm font-medium text-gray-700">
                          {item.price.toLocaleString("fa-IR")}
                          <span className="text-xs mr-1">تومان</span>
                        </p>
                        <div className="flex items-center gap-1 rounded-lg border p-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              updateCartItemQuantity(item.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <span className="w-6 text-center font-bold text-sm">
                            {item.quantity.toLocaleString("fa-IR")}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              updateCartItemQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <SheetFooter className="p-4 border-t bg-gray-50">
              <div className="w-full space-y-4">
                <div className="flex justify-between font-bold text-lg">
                  <p>جمع کل</p>
                  <p>{total.toLocaleString("fa-IR")} تومان</p>
                </div>
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  ادامه فرآیند خرید
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
