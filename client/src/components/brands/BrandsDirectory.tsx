"use client";

import { useState, useMemo, useEffect } from "react";
import { Brand } from "@/store/useBrandStore";
import { motion } from "motion/react"; // استفاده از پکیج جدید motion
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import LuxuryBrandCard from "./LuxuryBrandCard";

interface Props {
  allBrands: Brand[];
}

export default function BrandsDirectory({ allBrands }: Props) {
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  // استیت برای مدیریت فاصله از بالا
  // true = هدر سایت هست (پس فاصله بده)، false = هدر رفته (پس بچسب بالا)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // --- مدیریت اسکرول هوشمند ---
  useEffect(() => {
    const scrollContainer = document.getElementById("main-content");
    if (!scrollContainer) return;

    let lastScrollY = scrollContainer.scrollTop;
    const handleScroll = () => {
      const currentScrollY = scrollContainer.scrollTop;
      const scrollingDown = currentScrollY > lastScrollY;
      const scrollDiff = Math.abs(currentScrollY - lastScrollY);

      // فقط اگر تغییر اسکرول محسوس بود استیت را عوض کن (برای جلوگیری از لرزش)
      if (scrollDiff > 10) {
        if (scrollingDown && currentScrollY > 60) {
          // کاربر داره میره پایین و از بالای صفحه فاصله گرفته -> هدر اصلی مخفی میشه
          setIsHeaderVisible(false);
        } else {
          // کاربر داره میاد بالا یا اول صفحه‌ست -> هدر اصلی هست
          setIsHeaderVisible(true);
        }
        lastScrollY = currentScrollY;
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  // ۱. جدا کردن برندهای ویژه (Featured)
  const featuredBrands = useMemo(
    () => allBrands.filter((b) => b.isFeatured),
    [allBrands]
  );

  // ۲. گروه‌بندی الفبایی (منطق اصلاح شده برای نام انگلیسی)
  const groupedBrands = useMemo(() => {
    const groups: Record<string, Brand[]> = {};

    const filtered = allBrands.filter(
      (b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        (b.englishName &&
          b.englishName.toLowerCase().includes(search.toLowerCase()))
    );

    filtered.forEach((brand) => {
      // اولویت سورت با نام انگلیسی است تا استاندارد A-Z حفظ شود
      // اگر نام انگلیسی نداشت، از فینگلیش یا نام فارسی استفاده می‌شود
      const sortName = brand.englishName || brand.name;
      const firstChar = sortName.charAt(0).toUpperCase();

      // اگر حرف انگلیسی بود (A-Z)
      const key = /^[A-Z]$/.test(firstChar) ? firstChar : "#";

      if (!groups[key]) groups[key] = [];
      groups[key].push(brand);
    });

    // مرتب‌سازی گروه‌ها
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === "#") return 1; // # میره آخر
      if (b === "#") return -1;
      return a.localeCompare(b);
    });

    return sortedKeys.reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as Record<string, Brand[]>);
  }, [allBrands, search]);

  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`group-${letter}`);
    const container = document.getElementById("main-content"); // کانتینر اصلی اسکرول در layout.tsx

    if (element && container) {
      // محاسبه دقیق موقعیت
      // فاصله المان از بالای ویوپورت - فاصله کانتینر از بالای ویوپورت + اسکرول فعلی کانتینر
      const offset = 210; // فاصله از هدر برای اینکه زیرش نره
      const elementPosition = element.getBoundingClientRect().top;
      const containerPosition = container.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition - containerPosition + container.scrollTop - offset;

      container.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else {
      // فال‌بک برای حالتی که شاید اسکرول روی بادی باشد (امنیت بیشتر)
      const element = document.getElementById(`group-${letter}`);
      if (element) {
        const y =
          element.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="pb-20 bg-white relative min-h-screen">
      {/* --- نوار ابزار چسبان (Smart Sticky) --- */}
      <div className="bg-white border-b border-gray-100 py-6 mb-8  z-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* اینپوت جستجو */}
            <div className="relative w-full lg:w-[400px] group">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-black transition-colors" />
              <Input
                placeholder="جستجوی برند (فارسی یا انگلیسی)..."
                className="pr-10 h-12 text-base bg-gray-100/50 border-transparent focus:bg-white focus:border-gray-300 focus:ring-0 rounded-2xl transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* نوار حروف الفبا (Desktop) */}
            <div className="hidden lg:flex lg:flex-row-reverse flex-1 flex-wrap justify-start gap-1 pl-4">
              {Object.keys(groupedBrands).map((letter) => (
                <button
                  key={letter}
                  onClick={() => scrollToLetter(letter)}
                  className={cn(
                    "w-7 h-7 text-[11px] font-bold rounded-lg transition-all duration-200 font-sans",
                    activeLetter === letter
                      ? "bg-black text-white scale-110 shadow-md"
                      : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        {/* --- ویترین ویژه (فقط وقتی سرچ خالیه) --- */}
        {!search && featuredBrands.length > 0 && (
          <section className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                برندهای منتخب
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gray-200 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBrands.map((brand, idx) => (
                // استفاده از کامپوننت LuxuryBrandCard که قبلا ساختیم
                <LuxuryBrandCard key={brand.id} brand={brand} index={idx} />
              ))}
            </div>
          </section>
        )}

        {/* --- دایرکتوری A-Z --- */}
        <div className="space-y-16 min-h-[500px]">
          {Object.entries(groupedBrands).map(([letter, brandsInGroup]) => (
            <motion.div
              key={letter}
              id={`group-${letter}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6 }}
              className="scroll-mt-[200px]"
            >
              {/* سرتیتر حرف */}
              <div className="flex items-end gap-4 mb-8 sticky top-[140px] z-10 pointer-events-none">
                {/* نکته: این sticky داخلی برای زیبایی است که حرف A تا تمام شدن لیستش بماند */}
                <span className="text-6xl font-black text-gray-200 leading-none font-sans select-none drop-shadow-sm">
                  {letter}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 pr-14">
                {brandsInGroup.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.slug}`}
                    className="group relative flex flex-col items-center text-center p-6 rounded-3xl border border-gray-100 bg-white hover:border-gray-300 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 overflow-hidden"
                  >
                    {/* افکت بک‌گراند در هاور */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10 w-20 h-20 mb-4 grayscale group-hover:grayscale-0 transition-all duration-500 ease-out group-hover:scale-110 mix-blend-multiply">
                      {brand.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-300">
                          {brand.name[0]}
                        </div>
                      )}
                    </div>

                    <div className="relative z-10 space-y-1">
                      <h3 className="font-bold text-gray-900 text-sm md:text-base group-hover:text-black transition-colors line-clamp-1">
                        {brand.name}
                      </h3>
                      {/* نمایش نام انگلیسی به عنوان زیرنویس کم‌رنگ */}
                      {brand.englishName && (
                        <span className="block text-[11px] text-gray-400 font-sans font-medium tracking-wider uppercase group-hover:text-gray-600 transition-colors">
                          {brand.englishName}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* خط جداکننده پایین هر گروه */}
              <div className="mt-12 h-px w-full bg-gray-50" />
            </motion.div>
          ))}
        </div>

        {/* حالت بدون نتیجه */}
        {Object.keys(groupedBrands).length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              نتیجه‌ای یافت نشد
            </h3>
            <p className="text-gray-500">
              هیچ برندی با عبارت &quot;{search}&quot; پیدا نشد.
            </p>
            <Button
              variant="outline"
              onClick={() => setSearch("")}
              className="mt-6 rounded-xl"
            >
              پاک کردن جستجو
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
