"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axios";

const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, { message: "وارد کردن ایمیل الزامی است." })
    .email({ message: "لطفاً یک ایمیل معتبر وارد کنید." }),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export default function NewsletterSignUp() {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormValues) => {
    try {
      const response = await axiosInstance.post("/newsletter/subscribe", data);
      toast({
        title: "موفقیت‌آمیز",
        description: response.data.message || "عضویت شما با موفقیت ثبت شد.",
      });
      reset();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "خطایی رخ داد. لطفاً دوباره تلاش کنید.";
      toast({
        title: "خطا",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <section className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-right">
            <h2 className="text-2xl lg:text-3xl font-bold">
              به خبرنامه ما بپیوندید!
            </h2>
            <p className="mt-2 text-md text-gray-300">
              اولین نفر باشید که از تخفیف‌ها و محصولات جدید ما باخبر می‌شوید.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md space-y-3"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="ایمیل خود را وارد کنید"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gray-800 border-gray-700 text-white pl-4 pr-10 focus:ring-primary focus:border-primary text-right"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="h-12 bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "عضویت"
                )}
              </Button>
            </div>
            {errors.email && (
              <p className="text-sm text-red-400 text-right px-1">
                {errors.email.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
