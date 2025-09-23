"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthProcessStore } from "@/store/useAuthProcessStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const {
    step,
    phone,
    isLoading,
    userHasPassword,
    setStep,
    setPhone,
    checkPhone,
    finalLogin,
    requestPasswordReset,
    resetPassword,
  } = useAuthProcessStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const router = useRouter();
  const { toast } = useToast();

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "رمزهای عبور یکسان نیستند.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "رمز عبور باید حداقل ۶ کاراکتر باشد.",
        variant: "destructive",
      });
      return;
    }
    const success = await resetPassword(otp, password);
    if (success) {
      setOtp("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  switch (step) {
    case "phone":
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            checkPhone(phone);
          }}
          className="space-y-4"
        >
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
            finalLogin("password", { password }, handleSuccess);
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
          <div className="text-left">
            <Button
              type="button"
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={() => {
                setPhone(phone); // Ensure phone is set before moving
                setStep("forgot-password-phone");
              }}
            >
              فراموشی رمز عبور
            </Button>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "در حال ورود..." : "ورود"}
          </Button>
          <Button
            type="button"
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
            finalLogin("otp", { otp }, handleSuccess);
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
              type="button"
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

    case "forgot-password-phone":
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestPasswordReset();
          }}
          className="space-y-4"
        >
          <h2 className="text-center text-xl font-semibold">
            فراموشی رمز عبور
          </h2>
          <p className="text-center text-sm text-gray-600">
            شماره همراهی که با آن ثبت‌نام کرده‌اید را وارد کنید.
          </p>
          <div className="space-y-1">
            <Label htmlFor="phone-forgot">شماره همراه</Label>
            <Input
              id="phone-forgot"
              type="tel"
              dir="ltr"
              placeholder="09123456789"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "در حال ارسال..." : "ارسال کد"}
          </Button>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="w-full"
            onClick={() => setStep("phone")}
          >
            بازگشت به صفحه ورود
          </Button>
        </form>
      );

    case "forgot-password-reset":
      return (
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <h2 className="text-center text-xl font-semibold">
            بازنشانی رمز عبور
          </h2>
          <p className="text-center text-sm text-gray-600">
            کد ارسال شده و رمز عبور جدید خود را وارد کنید.
          </p>
          <div className="space-y-1">
            <Label htmlFor="otp-reset">کد تایید</Label>
            <Input
              id="otp-reset"
              type="text"
              dir="ltr"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password-reset">رمز عبور جدید</Label>
            <Input
              id="password-reset"
              type="password"
              dir="ltr"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm-password-reset">تکرار رمز عبور جدید</Label>
            <Input
              id="confirm-password-reset"
              type="password"
              dir="ltr"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "در حال ذخیره..." : "تغییر رمز عبور"}
          </Button>
        </form>
      );
  }
}
