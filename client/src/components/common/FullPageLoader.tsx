"use client";

import Image from "next/image";
import logo from "../../../public/images/Logo/tiamara-logo.png";

export default function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* لایه پس‌زمینه: کمی تار و سفید تا محتوای زیرین کمتر دیده شود */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

      {/* کارت شیشه‌ای (Glassmorphism Card) */}
      <div
        className="relative z-10 flex items-center justify-center p-10 rounded-[2rem] 
                      bg-white/40 backdrop-blur-xl 
                      border border-white/60 
                      shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]"
      >
        {/* لوگوی مرکزی با انیمیشن تپش نرم */}
        <div className="relative w-36 h-16 md:w-44 md:h-20 animate-pulse duration-[2000ms]">
          <Image
            src={logo}
            alt="Tiamara"
            fill
            className="object-contain drop-shadow-sm"
            priority
          />
        </div>

        {/* افکت نوری روی شیشه (Reflection) - اختیاری برای زیبایی بیشتر */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-[2rem] pointer-events-none" />
      </div>
    </div>
  );
}
