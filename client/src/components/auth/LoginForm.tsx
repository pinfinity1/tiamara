"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthProcessStore } from "@/store/useAuthProcessStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Edit3,
  RefreshCcw,
  LockKeyhole,
} from "lucide-react";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  toEnglishDigits,
  toPersianDigits,
  isValidIranianPhoneNumber,
} from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";

const OTP_DURATION = 120;

// اسکیماهای Zod
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
    setStep,
    setPhone,
    checkPhone,
    finalLogin,
    requestPasswordReset,
    resetPassword,
    setPasswordAndFinalize,
  } = useAuthProcessStore();

  const { update } = useSession();
  const { toast } = useToast();
  const [passwordSimple, setPasswordSimple] = useState("");
  const [otpSimple, setOtpSimple] = useState("");
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [countdown, setCountdown] = useState(OTP_DURATION);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

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

  const progressValue = (countdown / OTP_DURATION) * 100;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const timeStr = `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
    return toPersianDigits(timeStr);
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

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const englishValue = toEnglishDigits(rawValue);
    if (/^[0-9]*$/.test(englishValue) && englishValue.length <= 11) {
      setPhone(englishValue);
    }
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setPasswordSimple(toEnglishDigits(value));
  };

  const handleOtpChange = (value: string) => {
    const englishValue = toEnglishDigits(value);
    if (/^[0-9]*$/.test(englishValue)) {
      setOtpSimple(englishValue);
      if (englishValue.length === 6 && !isLoading) {
        finalLogin("otp", { otp: englishValue }, handleSuccess);
      }
    }
  };

  const onPasswordSetupSubmit = (data: SetupPasswordFormValues) => {
    setPasswordAndFinalize(data.password, async () => {
      // آپدیت سشن برای جلوگیری از باز شدن مجدد فرم
      await update({ requiresPasswordSetup: false });
      handleSuccess();
    });
  };

  const onPasswordResetSubmit = async (data: ResetPasswordFormValues) => {
    const success = await resetPassword(data.otp, data.password);
    if (success) {
      resetForm.reset();
    }
  };

  const HeaderWithBack = ({
    title,
    onBack,
  }: {
    title: string;
    onBack: () => void;
  }) => (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="text-gray-500 hover:text-gray-900 gap-1 px-2 h-8"
      >
        <ArrowRight className="h-4 w-4 rotate-180" />
        بازگشت
      </Button>
    </div>
  );

  switch (step) {
    case "phone":
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const normalizedPhone = toEnglishDigits(phone);
            if (!isValidIranianPhoneNumber(normalizedPhone)) {
              toast({
                title: "شماره موبایل نامعتبر است",
                description:
                  "لطفاً شماره موبایل ۱۱ رقمی صحیح (مثلاً ۰۹۱۲...) وارد کنید.",
                variant: "destructive",
              });
              return;
            }
            setPhone(normalizedPhone);
            checkPhone(normalizedPhone);
          }}
          className="space-y-6"
          noValidate
        >
          <div className="space-y-2 text-right">
            <Label htmlFor="phone" className="text-gray-600 font-medium mr-1">
              شماره موبایل
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              dir="ltr"
              placeholder={toPersianDigits("0912")}
              required
              value={toPersianDigits(phone)}
              onChange={handlePhoneInputChange}
              maxLength={11}
              className="h-12 text-center text-xl tracking-widest bg-gray-50 focus:bg-white border-gray-200 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 rounded-xl font-bold"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 rounded-xl transition-all"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin ml-2" />
            ) : (
              "ورود / ثبت‌نام"
            )}
          </Button>
        </form>
      );

    case "password":
      return (
        <div className="relative animate-in fade-in slide-in-from-right-8 duration-300">
          <HeaderWithBack
            title="ورود با رمز عبور"
            onBack={() => setStep("phone")}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              finalLogin(
                "password",
                { password: passwordSimple },
                handleSuccess
              );
            }}
            className="space-y-5"
            noValidate
          >
            <div className="space-y-2 relative text-right">
              <Label htmlFor="password">رمز عبور خود را وارد کنید</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  required
                  value={toPersianDigits(passwordSimple)}
                  onChange={handlePasswordInputChange}
                  className="h-12 bg-gray-50 focus:bg-white border-gray-200 rounded-xl pr-10 pl-4 placeholder:text-right"
                  placeholder="رمز عبور..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-10 w-10 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                size="sm"
                className="text-xs text-gray-500 px-0 h-auto font-normal hover:no-underline hover:text-primary"
                onClick={() => setStep("forgot-password-phone")}
              >
                رمز عبور را فراموش کرده‌اید؟
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "ورود به حساب"
              )}
            </Button>

            <div className="text-center pt-2">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">یا</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-11 border-gray-200 text-gray-600 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all rounded-xl"
                onClick={() => {
                  checkPhone(phone, true);
                }}
              >
                ورود با کد یکبار مصرف (پیامک)
              </Button>
            </div>
          </form>
        </div>
      );

    case "otp":
      return (
        <div className="relative animate-in fade-in slide-in-from-right-8 duration-300 text-center">
          <HeaderWithBack title="کد تایید" onBack={() => setStep("phone")} />

          <div className="mb-6">
            <p className="text-sm text-gray-500 bg-gray-50 py-2 px-4 rounded-lg inline-block border border-gray-100">
              کد به{" "}
              <span
                dir="ltr"
                className="font-mono text-gray-900 font-bold mx-1"
              >
                {toPersianDigits(phone)}
              </span>{" "}
              ارسال شد
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (otpSimple.length !== 6) return;
              finalLogin("otp", { otp: otpSimple }, handleSuccess);
            }}
            className="space-y-6 flex flex-col items-center"
            noValidate
          >
            <div dir="ltr" className="w-full flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpSimple}
                onChange={handleOtpChange}
                inputMode="numeric"
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot
                    index={0}
                    className="border-r border-gray-300 h-12 w-10 sm:w-12 text-xl"
                  />
                  <InputOTPSlot
                    index={1}
                    className="border-r border-gray-300 h-12 w-10 sm:w-12 text-xl"
                  />
                  <InputOTPSlot
                    index={2}
                    className="border-r border-gray-300 h-12 w-10 sm:w-12 text-xl"
                  />
                  <InputOTPSlot
                    index={3}
                    className="border-r border-gray-300 h-12 w-10 sm:w-12 text-xl"
                  />
                  <InputOTPSlot
                    index={4}
                    className="border-r border-gray-300 h-12 w-10 sm:w-12 text-xl"
                  />
                  <InputOTPSlot
                    index={5}
                    className="h-12 w-10 sm:w-12 text-xl"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {isTimerActive && (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs text-gray-400 px-1">
                  <span>زمان باقی‌مانده</span>
                  <span className="font-mono">{formatTime(countdown)}</span>
                </div>
                <Progress
                  value={progressValue}
                  className="w-full h-1.5 rounded-full bg-gray-100"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || otpSimple.length < 6}
              className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "تایید و ورود"
              )}
            </Button>

            <div className="w-full flex justify-center pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendOtp}
                disabled={isTimerActive || isLoading}
                className="text-primary font-medium hover:bg-primary/5 px-4 h-9 disabled:opacity-50"
              >
                {!isTimerActive && (
                  <span className="flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    ارسال مجدد کد
                  </span>
                )}
                {isTimerActive && "ارسال مجدد (منتظر بمانید...)"}
              </Button>
            </div>
          </form>
        </div>
      );

    case "force-password-setup":
      return (
        <div className="relative animate-in fade-in slide-in-from-right-8 duration-300">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600 mb-3">
              <LockKeyhole className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">تعیین رمز عبور</h2>
            <p className="text-sm text-gray-500 mt-2 px-4 leading-relaxed">
              برای ورود سریع‌تر در دفعات بعد، لطفاً یک رمز عبور انتخاب کنید.
            </p>
          </div>

          <Form {...setupForm}>
            <form
              onSubmit={setupForm.handleSubmit(onPasswordSetupSubmit)}
              className="space-y-5"
              noValidate
            >
              <FormField
                control={setupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="text-right space-y-1">
                    <FormLabel>رمز عبور جدید</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          dir="ltr"
                          autoComplete="new-password"
                          {...field}
                          value={toPersianDigits(field.value)}
                          onChange={(e) =>
                            field.onChange(toEnglishDigits(e.target.value))
                          }
                          className="h-12 bg-gray-50 rounded-xl pr-10 pl-4"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-10 w-10 text-gray-400"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
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
                  <FormItem className="text-right space-y-1">
                    <FormLabel>تکرار رمز عبور</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          dir="ltr"
                          autoComplete="new-password"
                          {...field}
                          value={toPersianDigits(field.value)}
                          onChange={(e) =>
                            field.onChange(toEnglishDigits(e.target.value))
                          }
                          className="h-12 bg-gray-50 rounded-xl pr-10 pl-4"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-10 w-10 text-gray-400"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
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
                className="w-full h-12 rounded-xl text-base mt-4 shadow-lg shadow-primary/20"
              >
                {setupForm.formState.isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "ذخیره و ورود به سایت"
                )}
              </Button>
            </form>
          </Form>
        </div>
      );

    case "forgot-password-phone":
      return (
        <div className="relative animate-in fade-in">
          <HeaderWithBack
            title="بازیابی رمز عبور"
            onBack={() => setStep("password")}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const normalizedPhone = toEnglishDigits(phone);
              if (!isValidIranianPhoneNumber(normalizedPhone)) {
                toast({
                  title: "شماره موبایل نامعتبر است",
                  description:
                    "لطفاً شماره موبایل ۱۱ رقمی صحیح (مثلاً ۰۹۱۲...) وارد کنید.",
                  variant: "destructive",
                });
                return;
              }
              setPhone(normalizedPhone);
              requestPasswordReset();
            }}
            className="space-y-6"
            noValidate
          >
            <p className="text-sm text-gray-500 text-center -mt-2 mb-4">
              شماره موبایل خود را وارد کنید تا کد بازیابی برایتان پیامک شود.
            </p>

            <div className="space-y-2 text-right">
              <Label>شماره موبایل</Label>
              <Input
                id="phone-forgot"
                type="tel"
                dir="ltr"
                inputMode="numeric"
                required
                value={toPersianDigits(phone)}
                onChange={handlePhoneInputChange}
                className="h-12 text-center text-lg tracking-widest bg-gray-50 rounded-xl font-bold"
                placeholder={toPersianDigits("0912")}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-base"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "ارسال کد بازیابی"
              )}
            </Button>
          </form>
        </div>
      );

    case "forgot-password-reset":
      return (
        <div className="relative animate-in fade-in">
          <HeaderWithBack
            title="تغییر رمز عبور"
            onBack={() => setStep("forgot-password-phone")}
          />

          <Form {...resetForm}>
            <form
              onSubmit={resetForm.handleSubmit(onPasswordResetSubmit)}
              className="space-y-5"
              noValidate
            >
              <div className="flex justify-center mb-2" dir="ltr">
                <FormField
                  control={resetForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem className="w-full flex flex-col items-center">
                      <FormLabel className="mb-2">کد تایید پیامک شده</FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          {...field}
                          onChange={(val) => {
                            const enVal = toEnglishDigits(val);
                            if (/^[0-9]*$/.test(enVal)) {
                              field.onChange(enVal);
                            }
                          }}
                          inputMode="numeric"
                        >
                          <InputOTPGroup className="gap-0">
                            <InputOTPSlot
                              index={0}
                              className="border-r h-12 w-10 sm:w-12 text-lg"
                            />
                            <InputOTPSlot
                              index={1}
                              className="border-r h-12 w-10 sm:w-12 text-lg"
                            />
                            <InputOTPSlot
                              index={2}
                              className="border-r h-12 w-10 sm:w-12 text-lg"
                            />
                            <InputOTPSlot
                              index={3}
                              className="border-r h-12 w-10 sm:w-12 text-lg"
                            />
                            <InputOTPSlot
                              index={4}
                              className="border-r h-12 w-10 sm:w-12 text-lg"
                            />
                            <InputOTPSlot
                              index={5}
                              className="h-12 w-10 sm:w-12 text-lg"
                            />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isTimerActive && (
                <Progress value={progressValue} className="w-full h-1.5" />
              )}

              <FormField
                control={resetForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel>رمز عبور جدید</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          dir="ltr"
                          {...field}
                          value={toPersianDigits(field.value)}
                          onChange={(e) =>
                            field.onChange(toEnglishDigits(e.target.value))
                          }
                          className="h-12 bg-gray-50 rounded-xl pr-10 pl-4"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-10 w-10 text-gray-400"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
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
                  <FormItem className="text-right">
                    <FormLabel>تکرار رمز عبور</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          dir="ltr"
                          {...field}
                          value={toPersianDigits(field.value)}
                          onChange={(e) =>
                            field.onChange(toEnglishDigits(e.target.value))
                          }
                          className="h-12 bg-gray-50 rounded-xl pr-10 pl-4"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-10 w-10 text-gray-400"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
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
                className="w-full h-12 rounded-xl mt-2 text-base font-bold"
              >
                {resetForm.formState.isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "تغییر رمز عبور"
                )}
              </Button>

              <div className="flex justify-center mt-2">
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
