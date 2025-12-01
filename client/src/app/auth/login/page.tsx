import LoginForm from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8f9fa] relative overflow-hidden">
      {/* المان‌های تزیینی پس‌زمینه (محو و رنگی) */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-rose-500/5 blur-[100px] pointer-events-none opacity-50" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none opacity-50" />

      {/* دکمه بازگشت به خانه (بالا سمت چپ) */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20">
        <Button
          asChild
          variant="ghost"
          className="gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Link href="/">
            <ArrowRight className="w-4 h-4 rotate-180" />
            بازگشت به فروشگاه
          </Link>
        </Button>
      </div>

      {/* کانتینر اصلی محتوا */}
      <div className="w-full max-w-[420px] px-4 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* لوگو و هدر */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link
            href="/"
            className="relative w-[140px] h-[60px] mb-4 hover:opacity-90 transition-opacity"
          >
            <Image
              src="/images/Logo/tiamara-logo.png" // استفاده از لوگوی اصلی
              alt="تیامارا"
              fill
              className="object-contain"
              priority
            />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            خوش آمدید
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            برای ادامه لطفا وارد حساب کاربری خود شوید
          </p>
        </div>

        {/* کارت فرم (شیشه‌ای و تمیز) */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 sm:p-8">
          <LoginForm />
        </div>

        {/* فوتر */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-gray-400">
            ورود شما به معنای پذیرش{" "}
            <Link
              href="/terms"
              className="underline hover:text-gray-600 decoration-gray-300"
            >
              قوانین و مقررات
            </Link>{" "}
            تیامارا است.
          </p>
        </div>
      </div>
    </div>
  );
}
