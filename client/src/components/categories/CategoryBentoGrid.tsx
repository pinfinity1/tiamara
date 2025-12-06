"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "motion/react";
import { Category } from "@/store/useCategoryStore";
import { cn } from "@/lib/utils";
import { ArrowUpLeft } from "lucide-react";

interface Props {
  categories: Category[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 50 },
  },
};

export default function CategoryBentoGrid({ categories }: Props) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show" // تغییر کوچک: استفاده از whileInView برای انیمیشن هنگام اسکرول
      viewport={{ once: true, margin: "-100px" }} // تنظیمات ویوپورت
      className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[240px] gap-4 p-4"
    >
      {categories.map((cat) => (
        <motion.div
          key={cat.id}
          variants={itemVariants}
          className={cn(
            "relative group rounded-3xl overflow-hidden cursor-pointer border border-white/10 shadow-sm hover:shadow-xl transition-shadow duration-500",
            // منطق سایز بندی بنتو گرید
            cat.gridSize === "LARGE" && "col-span-2 row-span-2",
            cat.gridSize === "MEDIUM" && "col-span-2 row-span-1", // مستطیل افقی
            cat.gridSize === "SMALL" && "col-span-1 row-span-1" // مربع کوچک
          )}
        >
          <Link
            href={`/categories/${cat.slug}`}
            className="block h-full w-full"
          >
            {/* تصویر پس‌زمینه */}
            <div className="absolute inset-0">
              <Image
                src={cat.imageUrl || "/images/placeholder-texture.jpg"}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                priority={cat.gridSize === "LARGE"}
              />
              {/* لایه گرادینت برای خوانایی متن */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
            </div>

            {/* محتوای متنی */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between">
              {/* آیکون فلش (فقط برای زیبایی) */}
              <div className="self-end opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                <ArrowUpLeft className="w-5 h-5" />
              </div>

              <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3
                  className={cn(
                    "font-bold text-white drop-shadow-md",
                    cat.gridSize === "LARGE"
                      ? "text-3xl md:text-4xl mb-2"
                      : "text-lg md:text-xl"
                  )}
                >
                  {cat.name}
                </h3>

                {/* نام انگلیسی فقط برای سایزهای بزرگتر یا در هاور */}
                {cat.englishName && (
                  <p
                    className={cn(
                      "text-white/70 font-sans text-sm uppercase tracking-wider",
                      cat.gridSize === "SMALL"
                        ? "hidden group-hover:block"
                        : "block"
                    )}
                  >
                    {cat.englishName}
                  </p>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
