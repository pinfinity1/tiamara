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
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
            چرا تیامارا را انتخاب کنید؟
          </h2>
          <p className="mt-2 text-md text-gray-500">
            تجربه‌ای متفاوت از خرید آنلاین لوازم آرایشی و بهداشتی
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
