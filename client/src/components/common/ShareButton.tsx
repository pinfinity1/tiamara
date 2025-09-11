// src/components/common/ShareButton.tsx

"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  productName: string;
  productSlug: string;
}

export default function ShareButton({
  productName,
  productSlug,
}: ShareButtonProps) {
  const { toast } = useToast();

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/products/${productSlug}`;
    const shareData = {
      title: productName,
      text: `این محصول رو ببین: ${productName}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("اشتراک‌گذاری لغو شد یا با خطا مواجه شد:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "لینک محصول کپی شد!",
          description: "می‌توانید لینک را با دوستان خود به اشتراک بگذارید.",
        });
      } catch (err) {
        toast({
          title: "خطا",
          description: "امکان کپی کردن لینک وجود ندارد.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-gray-400 hover:text-primary hover:bg-primary/5"
      onClick={handleShare}
    >
      <Share2 className="h-5 w-5" />
    </Button>
  );
}
