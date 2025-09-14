"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { axiosPublic } from "@/lib/axios";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type AuthStep = "phone" | "password" | "otp";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userHasPassword, setUserHasPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axiosPublic.post(`/auth/check-phone`, { phone });
      if (response.data.success) {
        setUserHasPassword(response.data.hasPassword);
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
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/");
        router.refresh();
      }
    }
  };

  switch (step) {
    case "phone":
      return (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <h2 className="text-center text-xl font-semibold">ورود / ثبت‌نام</h2>
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
            {isLoading ? "در حال ارسال..." : "ادامه"}
          </Button>
        </form>
      );

    case "password":
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFinalLogin("password");
          }}
          className="space-y-4"
        >
          <h2 className="text-center text-xl font-semibold">رمز عبور</h2>
          <p className="text-center text-sm text-gray-600">
            رمز عبور خود را وارد کنید.
          </p>
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
          <Button
            variant="link"
            size="sm"
            className="w-full"
            onClick={() => setStep("otp")}
          >
            ورود با کد یکبار مصرف
          </Button>
        </form>
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
          <h2 className="text-center text-xl font-semibold">کد تایید</h2>
          <p className="text-center text-sm text-gray-600">
            کد ارسال شده به شماره{" "}
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
          {userHasPassword && (
            <Button
              variant="link"
              size="sm"
              className="w-full"
              onClick={() => setStep("password")}
            >
              ورود با رمز عبور
            </Button>
          )}
        </form>
      );
  }
}
