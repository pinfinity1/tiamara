"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import React from "react";
import { useShallow } from "zustand/react/shallow";

interface WishlistButtonProps {
  productId: string;
  productName: string;
}

export default function WishlistButton({
  productId,
  productName,
}: WishlistButtonProps) {
  const { data: session } = useSession();
  const { onOpen } = useAuthModalStore();
  const { toast } = useToast();

  const { toggleWishlistItem, isWishlisted } = useWishlistStore(
    useShallow((state) => ({
      toggleWishlistItem: state.toggleWishlistItem,
      isWishlisted: state.isWishlisted,
    }))
  );

  const isItemWishlisted = isWishlisted(productId);

  const handleWishlistClick = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      onOpen();
      return;
    }

    const action = await toggleWishlistItem(productId);

    if (action === "added") {
      toast({ title: "به علاقه‌مندی‌ها اضافه شد", description: productName });
    } else if (action === "removed") {
      toast({
        title: "از علاقه‌مندی‌ها حذف شد",
        description: productName,
        variant: "destructive",
      });
    } else {
      toast({
        title: "خطا",
        description: "عملیات ناموفق بود",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
      onClick={handleWishlistClick}
    >
      <Heart
        className={cn(
          "h-5 w-5",
          isItemWishlisted && "fill-red-500 text-red-500"
        )}
      />
    </Button>
  );
}
