"use client";

import { useEffect, useState, useId } from "react";
import { cn } from "@/lib/utils";

export const AnimatedGrid = ({ className }: { className?: string }) => {
  const [mounted, setMounted] = useState(false);
  const patternId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full bg-neutral-950 border border-white/10",
        className
      )}
    >
      {/* 1. ماسک گرادینت (Vignette) */}
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(10,10,10,0.8)_100%)] pointer-events-none" />

      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={patternId}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            x="50%" // شروع پترن از وسط افقی
            y="50%" // شروع پترن از وسط عمودی
          >
            {/* خطوط شبکه */}
            <path
              d="M 0 20 L 40 20 M 20 0 L 20 40"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              strokeOpacity="0.1"
            />
            {/* نقطه گرد وسط */}
            <circle cx="20" cy="20" r="1.2" fill="white" fillOpacity="0.5" />
          </pattern>
        </defs>

        {/* ۲. لایه زیرین: سلول‌های چشمک‌زن (Active Cells) 
           نکته مهم: این لایه را قبل از rect پترن می‌گذاریم تا زیر خطوط باشد.
           نکته مهم‌تر: با transform این گروه را هم به وسط صفحه می‌بریم تا با پترن هماهنگ شود.
        */}
        <g
          fill="white"
          fillOpacity="0.06"
          style={{ transform: "translate(50%, 50%)" }} // <--- این خط کلید حل مشکل است
        >
          {/* حالا مختصات نسبت به مرکز سنجیده می‌شود.
             چون سایز هر خانه ۴۰ است، مختصات باید مضرب ۴۰ باشند (مثلاً 0, 40, -40, 80, -80)
             و چون می‌خواهیم مربع دقیقاً وسط خطوط بیفتد (و پترن ما نقطه محور است)، 
             باید ۲۰ پیکسل آفست دهیم (x-20, y-20) تا مربع دور نقطه مرکزی بیفتد.
          */}

          {/* مربع مرکزی */}
          <rect
            x="-20"
            y="-20"
            width="40"
            height="40"
            className="animate-pulse-slow"
          />

          {/* سمت راست */}
          <rect
            x="60"
            y="-20"
            width="40"
            height="40"
            className="animate-pulse-fast"
            style={{ animationDelay: "1s" }}
          />

          {/* سمت چپ */}
          <rect
            x="-100"
            y="-20"
            width="40"
            height="40"
            className="animate-pulse-normal"
            style={{ animationDelay: "2s" }}
          />

          {/* پایین */}
          <rect
            x="-20"
            y="60"
            width="40"
            height="40"
            className="animate-pulse-slow"
            style={{ animationDelay: "0.5s" }}
          />

          {/* بالا راست */}
          <rect
            x="20"
            y="-100"
            width="40"
            height="40"
            className="animate-pulse-fast"
            style={{ animationDelay: "1.5s" }}
          />

          {/* پایین چپ */}
          <rect
            x="-60"
            y="20"
            width="40"
            height="40"
            className="animate-pulse-normal"
            style={{ animationDelay: "3s" }}
          />

          {/* پراکنده دورتر */}
          <rect
            x="100"
            y="60"
            width="40"
            height="40"
            className="animate-pulse-slow"
            style={{ animationDelay: "4s" }}
          />
          <rect
            x="-140"
            y="-60"
            width="40"
            height="40"
            className="animate-pulse-normal"
            style={{ animationDelay: "2.5s" }}
          />
        </g>

        {/* ۳. لایه رویی: رسم شبکه و نقاط */}
        {/* چون این لایه رو است، خطوط روی مربع‌های فید شده دیده می‌شوند که زیباتر است */}
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      <style jsx>{`
        .animate-pulse-slow {
          animation: flicker 6s ease-in-out infinite;
        }
        .animate-pulse-normal {
          animation: flicker 4s ease-in-out infinite;
        }
        .animate-pulse-fast {
          animation: flicker 3s ease-in-out infinite;
        }

        @keyframes flicker {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
