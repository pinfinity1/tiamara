"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useAddressStore, Address } from "@/store/useAddressStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useUserStore } from "@/store/useUserStore";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MapPin, CheckCircle, Loader2 } from "lucide-react";
import { Label } from "../ui/label";

const AddressCard = ({
  address,
  isSelected,
  onSelect,
}: {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <div
    onClick={onSelect}
    className={`p-4 border rounded-lg cursor-pointer transition-all ${
      isSelected
        ? "border-primary ring-2 ring-primary"
        : "hover:border-gray-400"
    }`}
  >
    <p className="font-semibold">
      {/* 1. Changed address.name to address.recipientName */}
      {address.recipientName}{" "}
      {address.isDefault && (
        <span className="text-xs text-primary">(پیش‌فرض)</span>
      )}
    </p>
    <p className="text-sm text-gray-600 mt-1">
      {/* 2. Changed address.address to address.fullAddress */}
      {address.fullAddress}, {address.city}
    </p>
    <p className="text-sm text-gray-600 mt-1">
      کدپستی: {address.postalCode} | تلفن: {address.phone}
    </p>
  </div>
);

export default function CheckoutView() {
  const router = useRouter();
  const { toast } = useToast();
  const { addresses, fetchAddresses, setDefaultAddress } = useAddressStore(); // Added setDefaultAddress

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    const defaultAddress = addresses.find((a) => a.isDefault);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    } else if (addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses]);

  // When a user selects a different address, we should update the default in the store
  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    // This assumes you want the selected address to become the default for the final review page.
    // If not, you can remove this line.
    setDefaultAddress(addressId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="text-primary" />
          انتخاب آدرس ارسال
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {addresses.map((addr) => (
          <AddressCard
            key={addr.id}
            address={addr}
            isSelected={selectedAddressId === addr.id}
            onSelect={() => handleSelectAddress(addr.id)}
          />
        ))}
        <Button
          variant="outline"
          onClick={() => router.push("/account?tab=addresses")}
        >
          مدیریت آدرس‌ها
        </Button>
      </CardContent>
    </Card>
  );
}
