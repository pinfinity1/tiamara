// client/src/components/layout/home/WhyChooseUs.tsx

import { ShieldCheck, Package, Phone, Sparkles } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "تضمین اصالت کالا",
    description: "تمامی محصولات ۱۰۰٪ اورجینال و با ضمانت اصالت عرضه می‌شوند.",
  },
  {
    icon: Package,
    title: "ارسال سریع و مطمئن",
    description:
      "سفارش شما در سریع‌ترین زمان و با بهترین بسته‌بندی به دستتان می‌رسد.",
  },
  {
    icon: Phone,
    title: "مشاوره تخصصی",
    description: "تیم ما آماده است تا به شما در انتخاب بهترین محصول کمک کند.",
  },
  {
    icon: Sparkles,
    title: "تجربه خرید لذت‌بخش",
    description:
      "ما برای راحتی شما، از طراحی سایت تا پشتیبانی، به تمام جزئیات فکر کرده‌ایم.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
            چرا تیامارا را انتخاب کنید؟
          </h2>
          <p className="mt-2 text-md text-gray-500">
            تجربه‌ای متفاوت از خرید آنلاین لوازم آرایشی و بهداشتی
          </p>
        </div>
        {/* کاهش فاصله بین آیتم‌ها در موبایل */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-2 sm:p-6">
              {/* آیکون کوچکتر در موبایل */}
              <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 mx-auto mb-3 sm:mb-4">
                <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              {/* فونت کوچکتر برای عنوان در موبایل */}
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              {/* فونت کوچکتر برای توضیحات در موبایل */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
