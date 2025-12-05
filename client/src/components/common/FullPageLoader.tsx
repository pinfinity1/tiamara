// client/src/components/common/FullPageLoader.tsx
"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import logo from "../../../public/images/Logo/tiamara-logo.png"; // مسیر لوگوی خود را چک کنید

export default function FullPageLoader({
  text = "در حال بررسی امنیت...",
}: {
  text?: string;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-500">
      <div className="relative w-[150px] h-[80px] mb-6 animate-pulse">
        <Image
          src={logo}
          alt="Tiamara Loading"
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="flex items-center gap-3 text-primary">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm font-medium text-gray-600">{text}</span>
      </div>
    </div>
  );
}
