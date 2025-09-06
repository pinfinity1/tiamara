"use client";

import Image from "next/image";
import banner from "../../../../public/images/login-banner.webp";
import logo from "../../../../public/images/Logo/tiamara-logo.png";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { API_ROUTES } from "@/utils/api";
import axios from "axios";

type AuthStep = "phone" | "password" | "otp";

function LoginPage() {
  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // مرحله ۱: ارسال شماره همراه برای بررسی وضعیت کاربر و ارسال OTP
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_ROUTES.AUTH}/check-phone`, {
        phone,
      });
      if (response.data.success) {
        setUserExists(response.data.userExists);
        setHasPassword(response.data.hasPassword);

        // اگر کاربر رمز عبور داشت به مرحله رمز عبور، در غیر این صورت به مرحله OTP می‌رود
        setStep(response.data.hasPassword ? "password" : "otp");
        toast({ title: "کد یکبار مصرف با موفقیت ارسال شد." });
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description:
          error.response?.data?.message || "مشکلی در ارسال کد پیش آمده است.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // مرحله نهایی: ارسال اطلاعات به NextAuth برای ورود
  const handleFinalLogin = async (loginType: "password" | "otp") => {
    setIsLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      phone,
      password: loginType === "password" ? password : undefined,
      otp: loginType === "otp" ? otp : undefined,
      loginType,
    });

    setIsLoading(false);

    if (result?.error) {
      toast({
        title: "ورود ناموفق",
        description: result.error,
        variant: "destructive",
      });
    } else if (result?.ok) {
      toast({ title: "خوش آمدید!" });
      router.push("/"); // هدایت به صفحه اصلی پس از ورود موفق
      router.refresh(); // برای به‌روزرسانی session
    }
  };

  // رندر کردن فرم بر اساس مرحله فعلی
  const renderStep = () => {
    switch (step) {
      case "phone":
        return (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <h2 className="text-center text-xl font-semibold">
              ورود / ثبت‌نام
            </h2>
            <div className="space-y-1">
              <Label htmlFor="phone">شماره همراه خود را وارد کنید</Label>
              <Input
                id="phone"
                type="tel"
                dir="ltr"
                placeholder="09123456789"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "در حال ارسال..." : "ارسال کد تایید"}
            </Button>
          </form>
        );

      case "password":
        return (
          <div className="space-y-4">
            <h2 className="text-center text-xl font-semibold">خوش آمدید!</h2>
            <p className="text-center text-sm text-gray-600">
              با رمز عبور وارد شوید یا از کد یکبار مصرف استفاده کنید.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFinalLogin("password");
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label htmlFor="password">رمز عبور</Label>
                <Input
                  id="password"
                  type="password"
                  dir="ltr"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "در حال ورود..." : "ورود"}
              </Button>
            </form>
            <Button
              variant="outline"
              onClick={() => setStep("otp")}
              className="w-full"
            >
              ورود با کد یکبار مصرف
            </Button>
            <Button
              variant="link"
              onClick={() => {
                setStep("phone");
                setPhone("");
              }}
            >
              تغییر شماره همراه
            </Button>
          </div>
        );

      case "otp":
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFinalLogin("otp");
            }}
            className="space-y-4"
          >
            <h2 className="text-center text-xl font-semibold">
              کد تایید را وارد کنید
            </h2>
            <p className="text-center text-sm text-gray-600">
              کد ۶ رقمی ارسال شده به شماره{" "}
              <span dir="ltr" className="font-semibold">
                {phone}
              </span>{" "}
              را وارد کنید.
            </p>
            <div className="space-y-1">
              <Label htmlFor="otp">کد یکبار مصرف</Label>
              <Input
                id="otp"
                type="text"
                dir="ltr"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "در حال بررسی..." : "تایید و ورود"}
            </Button>
            {userExists && hasPassword && (
              <Button variant="link" onClick={() => setStep("password")}>
                ورود با رمز عبور
              </Button>
            )}
            <Button
              variant="link"
              onClick={() => {
                setStep("phone");
                setPhone("");
              }}
            >
              تغییر شماره همراه
            </Button>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fff6f4] flex">
      <div className="hidden lg:block w-1/2 bg-[#ffede1] relative overflow-hidden">
        <Image
          src={banner}
          alt="Register"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-16 justify-center">
        <div className="max-w-md w-full mx-auto p-8 lg:p-12 bg-white shadow-lg rounded-2xl">
          <div className="flex justify-center mb-6">
            <Image src={logo} width={120} height={70} alt="Logo" />
          </div>
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
