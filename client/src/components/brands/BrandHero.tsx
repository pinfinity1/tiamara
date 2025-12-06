"use client";

import { Brand } from "@/store/useBrandStore";
import Image from "next/image";
import { motion } from "motion/react";
import { BadgeCheck } from "lucide-react";

export default function BrandHero({ brand }: { brand: Brand }) {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-neutral-900">
      {/* 1. لایه تصویر پس‌زمینه (با افکت زوم ملایم) */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full"
      >
        {brand.coverImageUrl ? (
          <Image
            src={brand.coverImageUrl}
            alt={brand.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          // فال‌بک: اگر عکس کاور نداشت
          <div className="relative w-full h-full">
            <Image
              src={brand.logoUrl || "/images/placeholder.png"}
              alt={brand.name}
              fill
              className="object-cover blur-3xl opacity-30 scale-150"
            />
            <div className="absolute inset-0 bg-neutral-900/80" />
          </div>
        )}
      </motion.div>

      {/* 2. لایه تاریک‌کننده و گرادینت */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />

      {/* 3. محتوای متنی و لوگو */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-10 md:pb-14 pt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* لوگوی برند (صاف، تمیز و لوکس) */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative shrink-0"
            >
              {/* حذف rotate و جایگزینی با استایل کلاسیک */}
              <motion.div
                whileHover={{ scale: 1.05 }} // فقط کمی بزرگ شود
                transition={{ type: "spring", stiffness: 300 }}
                className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center p-5 border border-white/20"
              >
                {brand.logoUrl ? (
                  <Image
                    src={brand.logoUrl}
                    alt={`${brand.name} logo`}
                    width={100}
                    height={100}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <span className="text-4xl font-black text-gray-300">
                    {brand.name[0]}
                  </span>
                )}
              </motion.div>
            </motion.div>

            {/* متن‌ها */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center md:text-right flex-1 space-y-3"
            >
              {/* نام فارسی: بزرگ و خوانا */}
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-xl">
                  {brand.englishName}
                </h1>
                {brand.isFeatured && (
                  <div
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white p-1.5 rounded-full"
                    title="برند رسمی"
                  >
                    <BadgeCheck className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* نام انگلیسی: استایل فشن */}
              {brand.englishName && (
                <h2 className="text-sm md:text-lg text-white/80 font-sans font-bold tracking-[0.4em] uppercase drop-shadow-md">
                  {brand.name}
                </h2>
              )}

              {/* توضیحات کوتاه */}
              {brand.metaDescription && (
                <p className="hidden md:block text-gray-300 text-sm max-w-2xl mt-4 leading-relaxed font-light border-r-2 border-white/30 pr-4 mr-1">
                  {brand.metaDescription.substring(0, 160)}
                  {brand.metaDescription.length > 160 && "..."}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
