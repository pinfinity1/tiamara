"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react"; // <-- ایمپورت از پکیج جدید
import { ArrowLeft, Sparkles } from "lucide-react";
import { Brand } from "@/store/useBrandStore";
import { cn } from "@/lib/utils";

interface Props {
  brand: Brand;
  index: number; // برای ایجاد تأخیر در انیمیشن ورود
}

export default function LuxuryBrandCard({ brand, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "relative group block w-full overflow-hidden rounded-[2rem]",
        // اگر برند ویژه است، در دسکتاپ عرض دو ستون را بگیرد
        brand.isFeatured
          ? "md:col-span-2 aspect-[2/1]"
          : "col-span-1 aspect-[4/5]"
      )}
    >
      <Link href={`/brands/${brand.slug}`} className="block h-full w-full">
        {/* 1. تصویر پس‌زمینه (کاور یا اگر نبود لوگو با افکت) */}
        <div className="absolute inset-0 w-full h-full">
          {brand.coverImageUrl ? (
            <Image
              src={brand.coverImageUrl}
              alt={brand.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              {/* فال‌بک برای وقتی عکس کاور نیست */}
              <Image
                src={brand.logoUrl || "/images/placeholder.png"}
                alt={brand.name}
                width={100}
                height={100}
                className="opacity-20 grayscale"
              />
            </div>
          )}

          {/* لایه گرادینت برای خوانایی متن */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        </div>

        {/* 2. محتوا */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          {/* لوگوی برند در دایره سفید */}
          <motion.div
            className="absolute top-6 right-6 w-14 h-14 bg-white rounded-full p-2 shadow-xl flex items-center justify-center z-10"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Image
              src={brand.logoUrl || "/images/placeholder.png"}
              alt="logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </motion.div>

          <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
            {brand.isFeatured && (
              <div className="flex items-center gap-1 text-amber-400 mb-2 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                برند برگزیده
              </div>
            )}

            <h3 className="text-white text-2xl md:text-3xl font-bold mb-1 drop-shadow-md">
              {brand.name}
            </h3>

            {brand.englishName && (
              <p className="text-white/60 text-sm font-sans tracking-wider mb-4 uppercase">
                {brand.englishName}
              </p>
            )}

            {/* دکمه که در هاور ظاهر می‌شود */}
            <div className="flex items-center gap-2 text-white text-sm font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100">
              مشاهده محصولات
              <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-md">
                <ArrowLeft className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
