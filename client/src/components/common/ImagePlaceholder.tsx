"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  className?: string;
  iconClassName?: string;
}

export default function ImagePlaceholder({
  className,
  iconClassName,
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gray-50",
        className
      )}
    >
      <div className="relative w-10 h-10 opacity-40 grayscale">
        <Image
          src="/images/Logo/tiamara-icon-black.png" // مطمئن شوید مسیر لوگو درست است
          alt="Tiamara Placeholder"
          fill
          className={cn("object-contain", iconClassName)}
        />
      </div>
    </div>
  );
}
