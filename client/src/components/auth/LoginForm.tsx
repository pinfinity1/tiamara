"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthProcessStore } from "@/store/useAuthProcessStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react"; // ایمپورت آیکون فلش

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
    setPasswordAndFinalize,
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
    }
    router.refresh();
  };

  const handleNumericInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value)) {
      setter(value);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "رمزهای عبور یکسان نیستند.", variant: "destructive" });
      return;
    }
    const success = await resetPassword(otp, password);
    if (success) {
      setOtp("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  // کامپوننت دکمه بازگشت برای استفاده مجدد
  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <div className="absolute top-0 right-0">
      <Button type="button" variant="ghost" size="icon" onClick={onClick}>
        <ArrowRight className="h-5 w-5 text-gray-500" />
      </Button>
    </div>
  );

  // نمایش فرم‌ها بر اساس مرحله فعلی
  switch (step) {
    case "phone":
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            checkPhone(phone);
          }}
          className="space-y-4"
          noValidate
        >
          <h2 className="text-center text-xl font-semibold">ورود / ثبت‌نام</h2>
          <div className="space-y-1">
            <Label htmlFor="phone">شماره همراه خود را وارد کنید</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              dir="ltr"
              placeholder="09123456789"
              required
              value={phone}
              onChange={(e) => handleNumericInputChange(e, setPhone)}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "در حال ارسال..." : "ادامه"}
          </Button>
        </form>
      );

    case "password":
      return (
        <div className="relative">
          <BackButton onClick={() => setStep("phone")} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              finalLogin("password", { password }, handleSuccess);
            }}
            className="space-y-4 pt-10"
            noValidate
          >
            <h2 className="text-center text-xl font-semibold">رمز عبور</h2>
            <div className="space-y-1">
              <Label htmlFor="password">رمز عبور خود را وارد کنید</Label>
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
            <div className="flex justify-between items-center text-xs">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => {
                  checkPhone(phone, true);
                }}
              >
                ورود با کد یکبار مصرف
              </Button>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setStep("forgot-password-phone")}
              >
                فراموشی رمز عبور
              </Button>
            </div>
          </form>
        </div>
      );

    case "otp":
      return (
        <div className="relative">
          <BackButton onClick={() => setStep("phone")} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              finalLogin("otp", { otp }, handleSuccess);
            }}
            className="space-y-4 pt-10"
            noValidate
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
                inputMode="numeric"
                dir="ltr"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => handleNumericInputChange(e, setOtp)}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "در حال بررسی..." : "تایید و ورود"}
            </Button>
            <div className="flex justify-start items-center text-xs">
              {userHasPassword && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setStep("password")}
                >
                  ورود با رمز عبور
                </Button>
              )}
            </div>
          </form>
        </div>
      );

    case "force-password-setup":
      return (
        // این مرحله دکمه بازگشت ندارد چون اجباری است
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password.length < 6) {
              toast({
                title: "رمز عبور باید حداقل ۶ کاراکتر باشد.",
                variant: "destructive",
              });
              return;
            }
            if (password !== confirmPassword) {
              toast({
                title: "رمزهای عبور یکسان نیستند.",
                variant: "destructive",
              });
              return;
            }
            setPasswordAndFinalize(password, handleSuccess);
          }}
          className="space-y-4"
          noValidate
        >
          <h2 className="text-center text-xl font-semibold">تکمیل ثبت‌نام</h2>
          <p className="text-center text-sm text-gray-600">
            برای امنیت حساب خود، لطفا یک رمز عبور انتخاب کنید.
          </p>
          <div className="space-y-1">
            <Label htmlFor="password-setup">رمز عبور</Label>
            <Input
              id="password-setup"
              type="password"
              dir="ltr"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm-password-setup">تکرار رمز عبور</Label>
            <Input
              id="confirm-password-setup"
              type="password"
              dir="ltr"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "در حال ذخیره..." : "ذخیره و ورود"}
          </Button>
        </form>
      );

    case "forgot-password-phone":
      return (
        <div className="relative">
          <BackButton onClick={() => setStep("password")} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              requestPasswordReset();
            }}
            className="space-y-4 pt-10"
            noValidate
          >
            <h2 className="text-center text-xl font-semibold">
              فراموشی رمز عبور
            </h2>
            <div className="space-y-1">
              <Label htmlFor="phone-forgot">شماره همراه</Label>
              <Input
                id="phone-forgot"
                type="tel"
                dir="ltr"
                inputMode="numeric"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "در حال ارسال..." : "ارسال کد"}
            </Button>
          </form>
        </div>
      );

    case "forgot-password-reset":
      return (
        <div className="relative">
          <BackButton onClick={() => setStep("forgot-password-phone")} />
          <form
            onSubmit={handleResetPasswordSubmit}
            className="space-y-4 pt-10"
            noValidate
          >
            <h2 className="text-center text-xl font-semibold">
              بازنشانی رمز عبور
            </h2>
            <div className="space-y-1">
              <Label htmlFor="otp-reset">کد تایید</Label>
              <Input
                id="otp-reset"
                type="text"
                inputMode="numeric"
                dir="ltr"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => handleNumericInputChange(e, setOtp)}
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
              <Label htmlFor="confirm-password-reset">
                تکرار رمز عبور جدید
              </Label>
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
        </div>
      );

    default:
      return null;
  }
}
