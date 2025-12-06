"use client";

import Image from "next/image";
import logo from "../../../public/images/Logo/tiamara-logo.png";

export default function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
      {/* لوگو */}
      <div className="relative w-32 h-16 mb-6 animate-in fade-in zoom-in duration-500">
        <Image
          src={logo}
          alt="Tiamara"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* سه نقطه متحرک با رنگ برند */}
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2.5 h-2.5 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
