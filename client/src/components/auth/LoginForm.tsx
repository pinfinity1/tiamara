"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthProcessStore } from "@/store/useAuthProcessStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";

const OTP_DURATION = 120;

// (Schema اعتبارسنجی Zod بدون تغییر باقی می‌ماند)
const passwordValidationSchema = z
  .object({
    otp: z.string().length(6, "کد تایید باید ۶ رقم باشد."),
    password: z
      .string()
      .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.")
      .regex(/[A-Z]/, "رمز عبور باید شامل حداقل یک حرف بزرگ باشد.")
      .regex(/[a-z]/, "رمز عبور باید شامل حداقل یک حرف کوچک باشد.")
      .regex(/[0-9]/, "رمز عبور باید شامل حداقل یک عدد باشد."),
    confirmPassword: z
      .string()
      .min(8, "تکرار رمز عبور باید حداقل ۸ کاراکتر باشد."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمزهای عبور یکسان نیستند.",
    path: ["confirmPassword"],
  });

const setupPasswordSchema = passwordValidationSchema.omit({ otp: true });
type SetupPasswordFormValues = z.infer<typeof setupPasswordSchema>;
const resetPasswordSchema = passwordValidationSchema;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

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

  const [passwordSimple, setPasswordSimple] = useState("");
  const [otpSimple, setOtpSimple] = useState("");
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [countdown, setCountdown] = useState(OTP_DURATION);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const setupForm = useForm<SetupPasswordFormValues>({
    resolver: zodResolver(setupPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  // --- !! ۲. محاسبه مقدار Progress Bar !! ---
  // این مقدار از ۱۰۰ (شروع) به ۰ (پایان) می‌رسد
  const progressValue = (countdown / OTP_DURATION) * 100;

  // (توابع کمکی formatTime, useEffect ها, handleResendOtp, handleSuccess... بدون تغییر)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (step === "otp" || step === "forgot-password-reset") {
      setIsTimerActive(true);
      setCountdown(OTP_DURATION);
      if (step === "forgot-password-reset") {
        resetForm.reset();
      }
    } else if (step === "force-password-setup") {
      setupForm.reset();
    } else {
      setIsTimerActive(false);
    }
  }, [step, setupForm, resetForm]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;
    if (isTimerActive && countdown > 0) {
      intervalId = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsTimerActive(false);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTimerActive, countdown]);

  const handleResendOtp = () => {
    if (isLoading || isTimerActive) return;
    if (step === "otp") {
      checkPhone(phone, true);
    } else if (step === "forgot-password-reset") {
      requestPasswordReset();
    }
    setIsTimerActive(true);
    setCountdown(OTP_DURATION);
  };

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

  const onPasswordSetupSubmit = (data: SetupPasswordFormValues) => {
    setPasswordAndFinalize(data.password, handleSuccess);
  };

  const onPasswordResetSubmit = async (data: ResetPasswordFormValues) => {
    const success = await resetPassword(data.otp, data.password);
    if (success) {
      resetForm.reset();
    }
  };

  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <div className="absolute top-0 right-0">
      <Button type="button" variant="ghost" size="icon" onClick={onClick}>
        <ArrowRight className="h-5 w-5 text-gray-500" />
      </Button>
    </div>
  );

  switch (step) {
    // (case "phone" و case "password" بدون تغییر)
    case "phone":
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const normalizedPhone = phone.startsWith("0") ? phone : `0${phone}`;
            setPhone(normalizedPhone);
            checkPhone(normalizedPhone);
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
              pattern="[0-9]*"
              maxLength={11}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                در حال ارسال
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              "ادامه"
            )}
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
              finalLogin(
                "password",
                { password: passwordSimple },
                handleSuccess
              );
            }}
            className="space-y-4 pt-10"
            noValidate
          >
            <h2 className="text-center text-xl font-semibold">رمز عبور</h2>
            <div className="space-y-1 relative">
              <Label htmlFor="password">رمز عبور خود را وارد کنید</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                dir="ltr"
                required
                value={passwordSimple}
                onChange={(e) => setPasswordSimple(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute bottom-1 right-1 h-7 w-7 text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  در حال ورود
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                "ورود"
              )}
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

    // --- !! ۳. case "otp" به‌روز شد !! ---
    case "otp":
      return (
        <div className="relative">
          <BackButton onClick={() => setStep("phone")} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              finalLogin("otp", { otp: otpSimple }, handleSuccess);
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
                value={otpSimple}
                onChange={(e) => handleNumericInputChange(e, setOtpSimple)}
              />
            </div>

            {/* --- !! تگ Progress اضافه شد !! --- */}
            {isTimerActive && (
              <Progress
                value={progressValue}
                className="w-full transition-all duration-300"
              />
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  در حال بررسی
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                "تایید و ورود"
              )}
            </Button>

            <div className="flex justify-between items-center text-xs">
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
              <div className="flex-grow"></div>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleResendOtp}
                disabled={isTimerActive || isLoading}
                className="text-primary disabled:opacity-50"
              >
                {!isTimerActive && "ارسال مجدد کد"}
              </Button>
            </div>
          </form>
        </div>
      );

    // (case "force-password-setup" بدون تغییر)
    case "force-password-setup":
      return (
        <Form {...setupForm}>
          <form
            onSubmit={setupForm.handleSubmit(onPasswordSetupSubmit)}
            className="space-y-4"
            noValidate
          >
            <h2 className="text-center text-xl font-semibold">تکمیل ثبت‌نام</h2>
            <p className="text-center text-sm text-gray-600">
              برای امنیت حساب خود، لطفا یک رمز عبور قوی انتخاب کنید.
            </p>

            <FormField
              control={setupForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رمز عبور</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        dir="ltr"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-1 right-1 h-7 w-7 text-gray-500"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={setupForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تکرار رمز عبور</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        dir="ltr"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-1 right-1 h-7 w-7 text-gray-500"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={setupForm.formState.isSubmitting}
              className="w-full"
            >
              {setupForm.formState.isSubmitting ? (
                <>
                  در حال ذخیره
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                "ذخیره و ورود"
              )}
            </Button>
          </form>
        </Form>
      );

    // (case "forgot-password-phone" بدون تغییر)
    case "forgot-password-phone":
      return (
        <div className="relative">
          <BackButton onClick={() => setStep("password")} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const normalizedPhone = phone.startsWith("0")
                ? phone
                : `0${phone}`;
              setPhone(normalizedPhone);
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
              {isLoading ? (
                <>
                  در حال ارسال
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                "ارسال کد"
              )}
            </Button>
          </form>
        </div>
      );

    // --- !! ۴. case "forgot-password-reset" به‌روز شد !! ---
    case "forgot-password-reset":
      return (
        <div className="relative">
          <BackButton onClick={() => setStep("forgot-password-phone")} />
          <Form {...resetForm}>
            <form
              onSubmit={resetForm.handleSubmit(onPasswordResetSubmit)}
              className="space-y-4 pt-10"
              noValidate
            >
              <h2 className="text-center text-xl font-semibold">
                بازنشانی رمز عبور
              </h2>

              <FormField
                control={resetForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>کد تایید</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        dir="ltr"
                        maxLength={6}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[0-9]*$/.test(value)) {
                            field.onChange(value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isTimerActive && (
                <Progress
                  value={progressValue}
                  className="w-full transition-all duration-1000"
                />
              )}

              <FormField
                control={resetForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور جدید</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          dir="ltr"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-1 right-1 h-7 w-7 text-gray-500"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تکرار رمز عبور جدید</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          dir="ltr"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-1 right-1 h-7 w-7 text-gray-500"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={resetForm.formState.isSubmitting}
                className="w-full"
              >
                {resetForm.formState.isSubmitting ? (
                  <>
                    در حال ذخیره
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "تغییر رمز عبور"
                )}
              </Button>
              <div className="flex justify-end items-center text-xs">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={isTimerActive || isLoading}
                  className="text-primary disabled:opacity-50"
                >
                  {!isTimerActive && "ارسال مجدد کد"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      );

    default:
      return null;
  }
}
