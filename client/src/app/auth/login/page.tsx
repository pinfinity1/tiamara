"use client";

import Image from "next/image";
import banner from "../../../../public/images/login-banner.webp";
import logo from "../../../../public/images/Logo/tiamara-logo.png";

import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  // --- منطق جدید: هدایت کاربر لاگین شده به بیرون ---
  useEffect(() => {
    if (status === "authenticated") {
      // اگر کاربر لاگین است، به صفحه اصلی (یا پنل کاربری) برگردد
      router.replace("/");
    }
  }, [status, router]);

  const handleLoginSuccess = () => {
    router.push("/");
    router.refresh();
  };

  // --- جلوگیری از نمایش فرم در لحظه لودینگ یا اگر کاربر لاگین است ---
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff6f4]">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff6f4] flex">
      <div className="hidden lg:block w-1/2 bg-[#ffede1] relative overflow-hidden">
        <Image
          src={banner}
          alt="Register"
          fill
          className="object-cover object-center"
          priority
        />
      </div>
      <div className="w-full lg:w-1/2 flex flex-col p-4 sm:p-8 lg:p-16 justify-center">
        <div className="max-w-md w-full mx-auto p-6 sm:p-8 lg:p-12 bg-white shadow-lg rounded-2xl">
          <div className="flex justify-center mb-6">
            <Link href="/">
              <Image src={logo} width={120} height={70} alt="Logo" />
            </Link>
          </div>
          <LoginForm onSuccess={handleLoginSuccess} />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
