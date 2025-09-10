"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useAddressStore } from "@/store/useAddressStore";
import { useCartStore, CartItem } from "@/store/useCartStore";
import { Coupon, useCouponStore } from "@/store/useCouponStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useProductStore, Product } from "@/store/useProductStore";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// یک نوع جدید برای ترکیب آیتم سبد خرید با جزئیات کامل محصول
type CartItemWithProduct = CartItem & { product: Product };

function CheckoutContent() {
  const { data: session } = useSession();
  const { addresses, fetchAddresses } = useAddressStore();
  const { items, fetchCart, clearCart } = useCartStore();
  const { getProductById } = useProductStore();
  const { fetchCoupons, couponList } = useCouponStore();
  const { createFinalOrder, isPaymentProcessing } = useOrderStore();
  const router = useRouter();

  const [selectedAddress, setSelectedAddress] = useState("");
  const [cartItemsWithDetails, setCartItemsWithDetails] = useState<
    CartItemWithProduct[]
  >([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponAppliedError, setCouponAppliedError] = useState("");

  useEffect(() => {
    fetchCoupons();
    fetchAddresses();
    fetchCart();
  }, [fetchAddresses, fetchCart, fetchCoupons]);

  useEffect(() => {
    const findDefaultAddress = addresses.find((address) => address.isDefault);
    if (findDefaultAddress) {
      setSelectedAddress(findDefaultAddress.id);
    } else if (addresses.length > 0) {
      setSelectedAddress(addresses[0].id);
    }
  }, [addresses]);

  useEffect(() => {
    const fetchIndividualProductDetails = async () => {
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          const product = await getProductById(item.productId);
          return { ...item, product: product! };
        })
      );
      setCartItemsWithDetails(itemsWithDetails.filter((item) => item.product));
    };

    if (items.length > 0) {
      fetchIndividualProductDetails();
    }
  }, [items, getProductById]);

  function handleApplyCoupon() {
    const getCurrentCoupon = couponList.find((c) => c.code === couponCode);

    if (!getCurrentCoupon) {
      setCouponAppliedError("کد تخفیف نامعتبر است.");
      setAppliedCoupon(null);
      return;
    }

    const now = new Date();
    if (
      now < new Date(getCurrentCoupon.startDate) ||
      now > new Date(getCurrentCoupon.endDate)
    ) {
      setCouponAppliedError("کد تخفیف در این بازه زمانی معتبر نیست.");
      setAppliedCoupon(null);
      return;
    }

    if (getCurrentCoupon.usageCount >= getCurrentCoupon.usageLimit) {
      setCouponAppliedError(
        "محدودیت استفاده از این کد تخفیف به پایان رسیده است."
      );
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(getCurrentCoupon);
    setCouponAppliedError("");
    toast({ title: "کد تخفیف با موفقیت اعمال شد." });
  }

  const handleProceedToPayment = async () => {
    // @ts-ignore
    const userId = session?.user?.id;

    if (!userId) {
      toast({
        title: "لطفاً ابتدا وارد حساب کاربری خود شوید.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAddress) {
      toast({
        title: "لطفاً یک آدرس برای ارسال انتخاب کنید.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId,
      addressId: selectedAddress,
      items: cartItemsWithDetails.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.product.discount_price || item.product.price,
      })),
      couponId: appliedCoupon?.id,
      total,
    };

    const result = await createFinalOrder(orderData);

    if (result.success && result.paymentUrl) {
      toast({ title: "در حال انتقال به درگاه پرداخت..." });
      // انتقال کاربر به صفحه پرداخت
      window.location.href = result.paymentUrl;
    } else {
      toast({
        title: "خطا در ایجاد سفارش. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    }
  };

  const subTotal = cartItemsWithDetails.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );

  const discountAmount = appliedCoupon
    ? (subTotal * appliedCoupon.discountPercent) / 100
    : 0;

  const total = subTotal - discountAmount;

  if (isPaymentProcessing) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <h1 className="text-2xl font-bold">
          در حال پردازش... لطفاً منتظر بمانید!
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">آدرس ارسال</h2>
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="flex items-start gap-3 p-3 border rounded-md"
                  >
                    <Checkbox
                      id={address.id}
                      checked={selectedAddress === address.id}
                      onCheckedChange={() => setSelectedAddress(address.id)}
                    />
                    <Label
                      htmlFor={address.id}
                      className="flex-grow cursor-pointer"
                    >
                      <div>
                        <span className="font-medium">{address.name}</span>
                        {address.isDefault && (
                          <span className="mr-2 text-xs text-white bg-green-600 px-2 py-0.5 rounded-full">
                            (پیش‌فرض)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700">
                        {address.address}
                      </div>
                      <div className="text-sm text-gray-600">
                        {address.city}, {address.country}, {address.postalCode}
                      </div>
                      <div className="text-sm text-gray-600">
                        تلفن: {address.phone}
                      </div>
                    </Label>
                  </div>
                ))}
                <Button onClick={() => router.push("/account?tab=addresses")}>
                  افزودن یا مدیریت آدرس‌ها
                </Button>
              </div>
            </Card>
          </div>
          {/* order summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-28">
              <h2 className="text-xl font-semibold mb-4">خلاصه سفارش</h2>
              <div className="space-y-4">
                {cartItemsWithDetails.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          item?.product?.images[0]?.url || "/placeholder.png"
                        }
                        alt={item?.product?.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {item?.product?.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        تعداد: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-sm">
                      {(item?.product?.price * item.quantity).toLocaleString(
                        "fa-IR"
                      )}{" "}
                      تومان
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                  <Input
                    placeholder="کد تخفیف خود را وارد کنید"
                    onChange={(e) => setCouponCode(e.target.value)}
                    value={couponCode}
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    className="w-full"
                    variant="outline"
                  >
                    اعمال کد
                  </Button>
                  {couponAppliedError && (
                    <p className="text-sm text-red-600">{couponAppliedError}</p>
                  )}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>جمع کل</span>
                    <span>{subTotal.toLocaleString("fa-IR")} تومان</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>تخفیف ({appliedCoupon.discountPercent}٪)</span>
                      <span>
                        - {discountAmount.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>مبلغ قابل پرداخت</span>
                  <span>{total.toLocaleString("fa-IR")} تومان</span>
                </div>
                <Button
                  onClick={handleProceedToPayment}
                  className="w-full"
                  disabled={isPaymentProcessing}
                >
                  {isPaymentProcessing
                    ? "در حال ایجاد سفارش..."
                    : "نهایی کردن خرید و پرداخت"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutContent;
