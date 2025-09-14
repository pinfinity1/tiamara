// client/src/components/auth/SkinProfileModal.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSkinProfileModalStore } from "@/store/useSkinProfileModalStore";
import { useUserStore } from "@/store/useUserStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; // برای استفاده از کلاس‌های Tailwind CSS شرطی

const skinTypesForUser = ["چرب", "خشک", "مختلط", "نرمال", "حساس"];
const concernsForUser = [
  "آکنه و جوش",
  "لک و تیرگی",
  "چروک و پیری",
  "خشکی و کم‌آبی",
  "منافذ باز",
  "قرمزی و التهاب",
];
const goalsForUser = [
  "پوست شفاف",
  "روشن شدن پوست",
  "آبرسانی و شادابی",
  "جوان‌سازی",
  "کنترل چربی",
];
const preferencesForUser = ["وگان", "ارگانیک", "بدون عطر"];

const TOTAL_STEPS = 4;

export default function SkinProfileModal() {
  const { isOpen, onClose } = useSkinProfileModalStore();
  const { userProfile, updateUserProfile, fetchProfile, isLoading } =
    useUserStore();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    skinType: "",
    skinConcerns: [] as string[],
    skincareGoals: [] as string[],
    productPreferences: [] as string[],
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1); // همیشه از مرحله ۱ شروع شود
      if (userProfile) {
        setFormData({
          skinType: userProfile.skinType || "",
          skinConcerns: userProfile.skinConcerns || [],
          skincareGoals: userProfile.skincareGoals || [],
          productPreferences: userProfile.productPreferences || [],
        });
      }
    }
  }, [isOpen, userProfile]);

  const handleMultiSelectChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => {
      const list = prev[field] as string[];
      const newList = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      return { ...prev, [field]: newList };
    });
  };

  const handleSave = async () => {
    const result = await updateUserProfile(formData);
    if (result) {
      toast({ title: "پروفایل پوستی شما با موفقیت ذخیره شد." });
      onClose();
      fetchProfile(); // Re-fetch to update the main profile page view
    } else {
      toast({ title: "خطا در ذخیره‌سازی.", variant: "destructive" });
    }
  };

  const progressPercentage = (step / TOTAL_STEPS) * 100;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <Label className="text-lg font-semibold">
              ۱. نوع پوست شما چیست؟
            </Label>
            <p className="text-sm text-gray-500 mb-4">
              این به ما کمک می‌کند محصولات با فرمولاسیون مناسب را به شما پیشنهاد
              دهیم.
            </p>
            <Select
              value={formData.skinType}
              onValueChange={(value) =>
                setFormData({ ...formData, skinType: value })
              }
            >
              <SelectTrigger className="mt-2 h-12">
                <SelectValue placeholder="نوع پوست خود را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {skinTypesForUser.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 2:
        return (
          <div>
            <Label className="text-lg font-semibold">
              ۲. بزرگترین نگرانی‌های پوستی شما کدامند؟
            </Label>
            <p className="text-sm text-gray-500 mb-4">
              می‌توانید چند مورد را انتخاب کنید.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {concernsForUser.map((concern) => (
                <div
                  key={concern}
                  className={cn(
                    "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm",
                    formData.skinConcerns.includes(concern)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input"
                  )}
                  onClick={() =>
                    handleMultiSelectChange("skinConcerns", concern)
                  }
                >
                  {concern}
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <Label className="text-lg font-semibold">
              ۳. به دنبال چه اهدافی برای پوست خود هستید؟
            </Label>
            <p className="text-sm text-gray-500 mb-4">
              دوست دارید پوستتان به چه نتیجه‌ای برسد؟
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {goalsForUser.map((goal) => (
                <div
                  key={goal}
                  className={cn(
                    "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm",
                    formData.skincareGoals.includes(goal)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input"
                  )}
                  onClick={() => handleMultiSelectChange("skincareGoals", goal)}
                >
                  {goal}
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <Label className="text-lg font-semibold">
              ۴. آیا ترجیحات خاصی دارید؟ (اختیاری)
            </Label>
            <p className="text-sm text-gray-500 mb-4">
              اگر موارد زیر برایتان اهمیت دارد، آن‌ها را انتخاب کنید.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {preferencesForUser.map((pref) => (
                <div
                  key={pref}
                  className={cn(
                    "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    formData.productPreferences.includes(pref)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input"
                  )}
                  onClick={() =>
                    handleMultiSelectChange("productPreferences", pref)
                  }
                >
                  {pref}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full" dir="rtl">
        <DialogHeader>
          <DialogTitle>ساخت پروفایل هوشمند پوستی</DialogTitle>
          <DialogDescription>
            با پاسخ به چند سوال کوتاه، به تیام کمک کنید تا شما را بهتر بشناسد.
          </DialogDescription>
          {/* نوار پیشرفت جدید */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </DialogHeader>
        <div className="py-6 min-h-[250px]">{renderStepContent()}</div>
        <DialogFooter className="justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                مرحله قبل
              </Button>
            )}
          </div>
          <div>
            {step < TOTAL_STEPS && (
              <Button onClick={() => setStep((s) => s + 1)}>مرحله بعد</Button>
            )}
            {step === TOTAL_STEPS && (
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "در حال ذخیره..." : "ذخیره و اتمام"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
