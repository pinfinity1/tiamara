"use client";

import { Category } from "@/store/useCategoryStore";
import Image from "next/image";
import { motion } from "motion/react";

export default function CategoryHero({ category }: { category: Category }) {
  return (
    <section className="relative h-[400px] md:h-[500px] w-full overflow-hidden bg-neutral-900 flex items-center justify-center">
      {/* Background Image with Zoom Effect */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            className="object-cover opacity-70"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-rose-500 to-purple-600 opacity-30" />
        )}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.span
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block text-white/80 font-sans text-sm md:text-base uppercase tracking-[0.3em] mb-4 border border-white/20 px-4 py-1 rounded-full backdrop-blur-md"
        >
          {category.englishName || "Category"}
        </motion.span>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter drop-shadow-2xl mb-6"
        >
          {category.name}
        </motion.h1>

        {category.metaDescription && (
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-light"
          >
            {category.metaDescription}
          </motion.p>
        )}
      </div>
    </section>
  );
}
