"use client";

import { useEffect, useState, useId } from "react";
import { cn } from "@/lib/utils";

export const AnimatedRoseGrid = ({ className }: { className?: string }) => {
  const [mounted, setMounted] = useState(false);
  const patternId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full overflow-hidden",
        className
      )}
    >
      {/* 1. ماسک محو کننده (Vignette) */}
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(255,241,242,0.8)_100%)] pointer-events-none" />

      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* پترن گرید ثابت */}
          <pattern
            id={patternId}
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 30 0 L 0 0 0 30"
              fill="none"
              stroke="#fb7185" // Rose-400
              strokeWidth="0.5"
              strokeOpacity="0.2"
            />
          </pattern>
        </defs>

        {/* ۱. رسم شبکه پس‌زمینه */}
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />

        {/* ۲. مسیرهای متحرک (Circuit Paths) */}
        <g fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="square">
          {/* مسیر ۱: شروع از چپ -> راست -> پایین -> راست */}
          {/* M=Move to, H=Horizontal line, V=Vertical line */}
          <path
            d="M -10 30 H 90 V 90 H 250 V 150 H 400"
            className="animate-path-1"
            strokeOpacity="0.7"
            strokeDasharray="80 1000" // طول خط ۸۰، فاصله ۱۰۰۰
          />

          {/* مسیر ۲: شروع از پایین -> بالا -> چپ -> بالا */}
          <path
            d="M 180 300 V 120 H 60 V -10"
            className="animate-path-2"
            strokeOpacity="0.5"
            strokeWidth="1.5"
            strokeDasharray="60 800"
          />

          {/* مسیر ۳: شروع از راست -> چپ -> بالا -> چپ (حرکت برعکس) */}
          <path
            d="M 400 120 H 240 V 60 H -10"
            className="animate-path-3"
            strokeOpacity="0.6"
            strokeWidth="1.5"
            strokeDasharray="100 900"
          />
        </g>

        {/* ۳. نقاط چشمک‌زن در تقاطع‌ها */}
        <g fill="#f43f5e" fillOpacity="0.1">
          <rect
            x="90"
            y="30"
            width="29"
            height="29"
            className="animate-pulse-slow"
          />
          <rect
            x="240"
            y="90"
            width="29"
            height="29"
            className="animate-pulse-fast"
            style={{ animationDelay: "1.5s" }}
          />
          <rect
            x="60"
            y="120"
            width="29"
            height="29"
            className="animate-pulse-normal"
            style={{ animationDelay: "0.5s" }}
          />
        </g>
      </svg>

      {/* استایل‌های انیمیشن */}
      <style jsx>{`
        /* انیمیشن برای مسیرها: مقدار stroke-dashoffset تغییر می‌کند تا حرکت را شبیه‌سازی کند */
        .animate-path-1 {
          animation: dashMove 8s linear infinite;
        }
        .animate-path-2 {
          animation: dashMove 10s linear infinite;
        }
        .animate-path-3 {
          animation: dashMoveReverse 9s linear infinite;
        }

        .animate-pulse-slow {
          animation: flicker 5s ease-in-out infinite;
        }
        .animate-pulse-normal {
          animation: flicker 3s ease-in-out infinite;
        }
        .animate-pulse-fast {
          animation: flicker 2s ease-in-out infinite;
        }

        @keyframes dashMove {
          from {
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes dashMoveReverse {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: 1000;
          }
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
