"use client";

import { ShieldCheck, Zap, Headphones, HeartHandshake } from "lucide-react";
import { motion, Variants } from "motion/react";
import { cn } from "@/lib/utils";

// بازنویسی متن‌ها برای لحن حرفه‌ای‌تر و کوتاه‌تر
const features = [
  {
    icon: ShieldCheck,
    title: "ضمانت اصالت بی‌قیدوشرط",
    description: "تضمین ۱۰۰٪ اورجینال بودن تمامی محصولات با امکان رهگیری.",
  },
  {
    icon: Zap, // تغییر آیکون به Zap برای القای سرعت
    title: "ارسال سریع و ایمن",
    description: "پردازش فوری سفارشات و بسته‌بندی محافظ‌دار استاندارد.",
  },
  {
    icon: Headphones, // تغییر آیکون به هدفون برای مشاوره
    title: "مشاوره تخصصی زیبایی",
    description: "راهنمایی رایگان توسط متخصصین پوست پیش از خرید.",
  },
  {
    icon: HeartHandshake, // آیکون تعامل برای تجربه خرید
    title: "همراهی تا رضایت کامل",
    description: "پشتیبانی متعهدانه و ۷ روز ضمانت بازگشت وجه.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // سرعت بیشتر برای ظاهر شدن
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function WhyChooseUs() {
  return (
    <section className="relative py-16 overflow-hidden border-y border-gray-100">
      {/* 1. پس‌زمینه دون‌دون (Dot Pattern) */}
      <div className="absolute inset-0 -z-10 bg-white">
        <div
          className="absolute h-full w-full opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(#000000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* ماسک برای محو کردن اطراف و تمرکز روی مرکز */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          {/* هدر سمت راست (در دسکتاپ) یا بالا (موبایل) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/3 text-right"
          >
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              چرا <span className="text-primary inline-block">تیامارا</span>{" "}
              متفاوت است؟
            </h2>
            <p className="mt-3 text-sm lg:text-base text-gray-500 leading-relaxed text-justify lg:text-right">
              ما در تیامارا استانداردها را بالا برده‌ایم. ترکیبی از سرعت، اصالت
              و احترام به مشتری، تجربه‌ای را می‌سازد که شایسته شماست.
            </p>
          </motion.div>

          {/* لیست ویژگی‌ها (گرید جمع‌وجور) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(255,255,255,0.8)",
                }}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-2xl border border-gray-200/60 bg-white/60 backdrop-blur-sm transition-all duration-200",
                  "hover:border-primary/20 hover:shadow-lg hover:shadow-gray-200/40"
                )}
              >
                {/* آیکون مینیمال */}
                <div className="shrink-0 p-2.5 rounded-xl bg-gray-50 text-gray-700 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                  <feature.icon className="w-5 h-5" strokeWidth={2} />
                </div>

                {/* متن‌ها */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-5">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
