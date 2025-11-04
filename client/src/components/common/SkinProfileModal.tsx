// client/src/components/common/SkinProfileModal.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; //
import { useSkinProfileModalStore } from "@/store/useSkinProfileModalStore"; //
import { useUserStore } from "@/store/useUserStore"; //
import { Button } from "@/components/ui/button"; //
import { Label } from "@/components/ui/label"; //
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; //
import { Switch } from "@/components/ui/switch"; //
import { Textarea } from "@/components/ui/textarea"; //
import { useToast } from "@/hooks/use-toast"; //
import { cn } from "@/lib/utils"; //

// --- داده‌های جامع برای پرسشنامه ---
// (تمام constها مانند ageRanges، skinTypesWithDesc و ... که در مرحله قبل تعریف کردیم، در اینجا هستند)
// ... (داده‌های مراحل ۱ تا ۱۰) ...
const ageRanges = [
  "زیر ۲۰ سال",
  "۲۰-۲۹ سال",
  "۳۰-۳۹ سال",
  "۴۰-۴۹ سال",
  "۵۰ سال به بالا",
];
const genders = ["خانم", "آقا", "ترجیح می‌دهم نگویم"];
const skinTypesWithDesc = [
  { name: "چرب", desc: "پوستتان اغلب براق است و منافذ بازی دارید؟" },
  { name: "خشک", desc: "اغلب احساس کشیدگی، پوسته پوسته شدن یا خارش می‌کنید؟" },
  { name: "مختلط", desc: "ناحیه T (پیشانی، بینی) چرب و گونه‌ها خشک هستند؟" },
  { name: "نرمال", desc: "پوستتان متعادل است، نه خیلی چرب و نه خیلی خشک." },
];
const sensitivities = [
  {
    name: "بسیار حساس",
    desc: "پوستم به راحتی قرمز می‌شود و واکنش نشان می‌دهد.",
  },
  { name: "کمی حساس", desc: "فقط به برخی محصولات خاص واکنش نشان می‌دهدهم." },
  { name: "مقاوم", desc: "پوست من به ندرت دچار حساسیت یا قرمزی می‌شود." },
];
const mainConcerns = [
  "آکنه و جوش",
  "لک و تیرگی",
  "چروک و پیری",
  "خشکی و کم‌آبی",
  "منافذ باز",
  "قرمزی و التهاب",
];
const skincareGoals = [
  "پوست شفاف",
  "روشن شدن پوست",
  "آبرسانی و شادابی",
  "جوان‌سازی",
  "کنترل چربی",
  "پیشگیری از پیری",
];
const acneTypes = [
  "جوش سرسفید/سرسیاه",
  "جوش‌های التهابی (پاپول/پاسچول)",
  "آکنه هورمونی (اطراف چانه)",
  "جوش‌های پراکنده",
];
const eyeConcernsList = [
  "تیرگی دور چشم",
  "پف زیر چشم",
  "چروک و خطوط ریز",
  "خشکی دور چشم",
];
const routineProducts = [
  "پاک‌کننده (شوینده)",
  "تونر",
  "سرم",
  "مرطوب‌کننده",
  "ضد آفتاب",
  "کرم دور چشم",
  "لایه بردار",
  "ماسک",
];
const activeIngredientsList = [
  "رتینول / رتینوئیدها",
  "ویتامین C",
  "اسیدهای AHA (گلیکولیک، لاکتیک)",
  "اسید BHA (سالیسیلیک)",
  "نیاسینامید",
  "هیالورونیک اسید",
  "هیچکدام / مطمئن نیستم",
];
const sleepHoursOptions = ["کمتر از ۵ ساعت", "۵ تا ۷ ساعت", "۸ ساعت یا بیشتر"];
const stressLevelOptions = ["کم", "متوسط", "زیاد"];
const waterIntakeOptions = [
  "کم (۱-۲ لیوان)",
  "متوسط (۳-۵ لیوان)",
  "زیاد (۶+ لیوان)",
];
const dietHabitsList = [
  "مصرف قند و شیرینی زیاد",
  "مصرف لبنیات زیاد",
  "مصرف فست‌فود و غذای چرب",
  "رژیم غذایی گیاهی",
  "رژیم غذایی متعادل",
];
const smokingHabits = ["هرگز", "گاهی اوقات", "به صورت مرتب"];
const environments = [
  "شهر بزرگ (آلودگی زیاد)",
  "حومه شهر (معتدل)",
  "روستایی (هوای پاک)",
];
const climates = ["گرم و خشک", "گرم و مرطوب", "سرد و خشک", "معتدل یا متغیر"];
const routineComplexities = [
  "ساده (۱-۳ محصول)",
  "متوسط (۴-۵ محصول)",
  "پیشرفته (بیش از ۵ محصول)",
];
const texturePreferencesList = ["سبک و ژل-مانند", "بافت کرمی", "غلیظ و روغنی"];
const productPreferencesList = [
  "وگان",
  "ارگانیک",
  "بدون عطر",
  "برند ایرانی",
  "برند خارجی",
];
const knownAllergiesList = [
  "عطر",
  "الکل",
  "سولفات",
  "پارابن",
  "اسانس‌های روغنی",
];
// ------------------------------------

const TOTAL_STEPS = 10;

export default function SkinProfileModal() {
  const { isOpen, onClose } = useSkinProfileModalStore();
  const { userProfile, updateUserProfile, fetchProfile, isLoading } =
    useUserStore();
  const { toast } = useToast();

  const [step, setStep] = useState(1);

  const getInitialFormData = () => ({
    ageRange: "",
    gender: "",
    isPregnantOrNursing: false,
    skinType: "",
    skinSensitivity: "",
    skinConcerns: [] as string[],
    skincareGoals: [] as string[],
    acneType: "",
    eyeConcerns: [] as string[],
    sleepHours: "",
    stressLevel: "",
    waterIntake: "",
    dietHabits: [] as string[],
    smokingHabit: "",
    environmentType: "",
    climate: "",
    currentRoutineProducts: [] as string[],
    activeIngredients: [] as string[],
    medications: "",
    knownAllergies: [] as string[],
    routineComplexity: "",
    texturePreferences: [] as string[],
    productPreferences: [] as string[],
  });

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (userProfile) {
        setFormData({
          ageRange: userProfile.ageRange || "",
          gender: userProfile.gender || "",
          isPregnantOrNursing: userProfile.isPregnantOrNursing || false,
          skinType: userProfile.skinType || "",
          skinSensitivity: userProfile.skinSensitivity || "",
          skinConcerns: userProfile.skinConcerns || [],
          skincareGoals: userProfile.skincareGoals || [],
          acneType: userProfile.acneType || "",
          eyeConcerns: userProfile.eyeConcerns || [],
          sleepHours: userProfile.sleepHours || "",
          stressLevel: userProfile.stressLevel || "",
          waterIntake: userProfile.waterIntake || "",
          dietHabits: userProfile.dietHabits || [],
          smokingHabit: userProfile.smokingHabit || "",
          environmentType: userProfile.environmentType || "",
          climate: userProfile.climate || "",
          currentRoutineProducts: userProfile.currentRoutineProducts || [],
          activeIngredients: userProfile.activeIngredients || [],
          medications: userProfile.medications || "",
          knownAllergies: userProfile.knownAllergies || [],
          routineComplexity: userProfile.routineComplexity || "",
          texturePreferences: userProfile.texturePreferences || [],
          productPreferences: userProfile.productPreferences || [],
        });
      } else {
        setFormData(getInitialFormData());
      }
    }
  }, [isOpen, userProfile]);

  const handleMultiSelectChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => {
      const list = prev[field] as string[];
      if (!Array.isArray(list)) return prev;
      const newList = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      return { ...prev, [field]: newList };
    });
  };

  const handleSingleSelectChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    if (field === "gender" && value !== "خانم") {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        isPregnantOrNursing: false,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleBooleanChange = (
    field: keyof typeof formData,
    checked: boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleSave = async () => {
    const result = await updateUserProfile(formData);
    if (result) {
      toast({ title: "پروفایل پوستی شما با موفقیت ذخیره شد." });
      onClose();
      fetchProfile();
    } else {
      toast({ title: "خطا در ذخیره‌سازی.", variant: "destructive" });
    }
  };

  const progressPercentage = (step / TOTAL_STEPS) * 100;

  // (تابع renderStepContent از مرحله قبل بدون تغییر در اینجا قرار می‌گیرد)
  const renderStepContent = () => {
    switch (step) {
      // --- مرحله ۱: اطلاعات پایه ---
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold">۱. رده سنی شما؟</Label>
              <Select
                value={formData.ageRange}
                onValueChange={(value) =>
                  handleSingleSelectChange("ageRange", value)
                }
              >
                <SelectTrigger className="mt-2 h-12">
                  <SelectValue placeholder="رده سنی خود را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {ageRanges.map((age) => (
                    <SelectItem key={age} value={age}>
                      {age}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-lg font-semibold">جنسیت</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  handleSingleSelectChange("gender", value)
                }
              >
                <SelectTrigger className="mt-2 h-12">
                  <SelectValue placeholder="جنسیت خود را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((gen) => (
                    <SelectItem key={gen} value={gen}>
                      {gen}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.gender === "خانم" && (
              <div>
                <Label className="text-lg font-semibold">
                  اطلاعات ایمنی (بسیار مهم)
                </Label>
                <p className="text-sm text-gray-500 mb-3">
                  برخی مواد (مانند رتینول) در این دوران منع مصرف دارند.
                </p>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Label
                    htmlFor="isPregnantOrNursing"
                    className="flex flex-col space-y-1"
                  >
                    <span>
                      آیا باردار هستید یا در دوران شیردهی به سر می‌برید؟
                    </span>
                  </Label>
                  <Switch
                    id="isPregnantOrNursing"
                    checked={!!formData.isPregnantOrNursing}
                    onCheckedChange={(checked) =>
                      handleBooleanChange("isPregnantOrNursing", checked)
                    }
                    dir="ltr"
                  />
                </div>
              </div>
            )}
          </div>
        );

      // --- مرحله ۲: نوع پوست ---
      case 2:
        return (
          <div>
            <Label className="text-lg font-semibold">
              ۲. نوع پوست شما چیست؟
            </Label>
            <p className="text-sm text-gray-500 mb-4">
              با انتخاب گزینه‌ای که پوست شما را بهتر توصیف می‌کند، به ما در
              تشخیص کمک کنید.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {skinTypesWithDesc.map((type) => (
                <div
                  key={type.name}
                  className={cn(
                    "flex flex-col text-center justify-center p-4 rounded-lg border cursor-pointer transition-all duration-200 min-h-[80px]",
                    formData.skinType === type.name
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={() =>
                    handleSingleSelectChange("skinType", type.name)
                  }
                >
                  <span className="font-semibold text-sm">{type.name}</span>
                  <span className="text-xs mt-1">{type.desc}</span>
                </div>
              ))}
            </div>
          </div>
        );

      // --- مرحله ۳: حساسیت پوست ---
      case 3:
        return (
          <div>
            <Label className="text-lg font-semibold">
              ۳. پوست شما چقدر حساس است؟
            </Label>
            <p className="text-sm text-gray-500 mb-4">
              این به ما کمک می‌کند از پیشنهاد محصولات محرک پرهیز کنیم.
            </p>
            <div className="grid grid-cols-1 gap-3 mt-2">
              {sensitivities.map((item) => (
                <div
                  key={item.name}
                  className={cn(
                    "flex flex-col text-right justify-center p-4 rounded-lg border cursor-pointer transition-all duration-200",
                    formData.skinSensitivity === item.name
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={() =>
                    handleSingleSelectChange("skinSensitivity", item.name)
                  }
                >
                  <span className="font-semibold text-sm">{item.name}</span>
                  <span className="text-xs mt-1">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        );

      // --- مرحله ۴: دغدغه‌های اصلی ---
      case 4:
        return (
          <div>
            <Label className="text-lg font-semibold">
              ۴. دغدغه‌های اصلی پوست صورت شما چیست؟
            </Label>
            <p className="text-sm text-gray-500 mb-4">
              می‌توانید چند مورد را انتخاب کنید.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {mainConcerns.map((concern) => (
                <div
                  key={concern}
                  className={cn(
                    "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm text-center min-h-[60px]",
                    formData.skinConcerns.includes(concern)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={() =>
                    handleMultiSelectChange("skinConcerns", concern)
                  }
                >
                  {concern}
                </div>
              ))}
            </div>
            {/* سوال شرطی در مورد نوع آکنه */}
            {formData.skinConcerns.includes("آکنه و جوش") && (
              <div className="mt-6">
                <Label className="text-md font-semibold">
                  نوع آکنه شما معمولاً چگونه است؟
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                  {acneTypes.map((type) => (
                    <div
                      key={type}
                      className={cn(
                        "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm text-center min-h-[60px]",
                        formData.acneType === type
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                      onClick={() => handleSingleSelectChange("acneType", type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      // --- مرحله ۵: اهداف پوستی ---
      case 5:
        return (
          <div>
            <Label className="text-lg font-semibold">
              ۵. اهداف اصلی شما برای پوستتان چیست؟
            </Label>
            <p className="text-sm text-gray-500 mb-4">
              دوست دارید به چه نتیجه‌ای برسید؟ (چند مورد)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {skincareGoals.map((goal) => (
                <div
                  key={goal}
                  className={cn(
                    "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm text-center min-h-[60px]",
                    formData.skincareGoals.includes(goal)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={() => handleMultiSelectChange("skincareGoals", goal)}
                >
                  {goal}
                </div>
              ))}
            </div>
          </div>
        );

      // --- مرحله ۶: دغدغه‌های دور چشم ---
      case 6:
        return (
          <div>
            <Label className="text-lg font-semibold">
              ۶. آیا دغدغه خاصی برای ناحیه دور چشم خود دارید؟
            </Label>
            <p className="text-sm text-gray-500 mb-4">
              این ناحیه نیاز به مراقبت ویژه‌ای دارد. (چند مورد)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {eyeConcernsList.map((concern) => (
                <div
                  key={concern}
                  className={cn(
                    "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm text-center min-h-[60px]",
                    formData.eyeConcerns.includes(concern)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={() =>
                    handleMultiSelectChange("eyeConcerns", concern)
                  }
                >
                  {concern}
                </div>
              ))}
            </div>
          </div>
        );

      // --- مرحله ۷: روتین فعلی ---
      case 7:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold">
                ۷. در حال حاضر از چه محصولاتی استفاده می‌کنید؟ (اختیاری)
              </Label>
              <p className="text-sm text-gray-500 mb-4">
                این به ما کمک می‌کند روتین شما را تکمیل کنیم.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {routineProducts.map((product) => (
                  <div
                    key={product}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm text-center min-h-[60px]",
                      formData.currentRoutineProducts.includes(product)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() =>
                      handleMultiSelectChange("currentRoutineProducts", product)
                    }
                  >
                    {product}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-lg font-semibold">
                آیا از این مواد موثره استفاده می‌کنید؟ (مهم)
              </Label>
              <p className="text-sm text-gray-500 mb-4">
                برای جلوگیری از تداخل محصولات، این موارد را انتخاب کنید.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {activeIngredientsList.map((item) => (
                  <div
                    key={item}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm text-center min-h-[60px]",
                      formData.activeIngredients.includes(item)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() =>
                      handleMultiSelectChange("activeIngredients", item)
                    }
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      // --- مرحله ۸: سبک زندگی ---
      case 8:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold">۸. سبک زندگی شما</Label>
              <p className="text-sm text-gray-500 mb-4">
                این عوامل مستقیماً بر سلامت پوست شما تأثیر می‌گذارند.
              </p>
            </div>
            <div>
              <Label className="text-sm font-semibold">میزان خواب شبانه</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {sleepHoursOptions.map((item) => (
                  <div
                    key={item}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm text-center",
                      formData.sleepHours === item
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() => handleSingleSelectChange("sleepHours", item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">سطح استرس روزانه</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {stressLevelOptions.map((item) => (
                  <div
                    key={item}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm text-center",
                      formData.stressLevel === item
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() =>
                      handleSingleSelectChange("stressLevel", item)
                    }
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">
                عادات غذایی (چند مورد)
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {dietHabitsList.map((item) => (
                  <div
                    key={item}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm text-center min-h-[60px]",
                      formData.dietHabits.includes(item)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() => handleMultiSelectChange("dietHabits", item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      // --- مرحله ۹: محیط ---
      case 9:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold">
                ۹. محیط و عادات شما
              </Label>
            </div>
            <div>
              <Label className="text-sm font-semibold">محیط زندگی شما</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                {environments.map((item) => (
                  <div
                    key={item}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm text-center min-h-[60px]",
                      formData.environmentType === item
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() =>
                      handleSingleSelectChange("environmentType", item)
                    }
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">
                آب و هوای محل زندگی
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {climates.map((item) => (
                  <div
                    key={item}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm text-center min-h-[60px]",
                      formData.climate === item
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() => handleSingleSelectChange("climate", item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">مصرف دخانیات</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {smokingHabits.map((item) => (
                  <div
                    key={item}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm text-center",
                      formData.smokingHabit === item
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() =>
                      handleSingleSelectChange("smokingHabit", item)
                    }
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      // --- مرحله ۱۰: ترجیحات و سابقه حساسیت ---
      case 10:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold">
                ۱۰. ترجیحات و حساسیت‌ها
              </Label>
            </div>
            <div>
              <Label className="text-sm font-semibold">
                ترجیح شما برای روتین پوستی
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                {routineComplexities.map((item) => (
                  <div
                    key={item}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm text-center min-h-[60px]",
                      formData.routineComplexity === item
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() =>
                      handleSingleSelectChange("routineComplexity", item)
                    }
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">
                ترجیحات ارزشی (چند مورد)
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {productPreferencesList.map((item) => (
                  <div
                    key={item}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm text-center",
                      formData.productPreferences.includes(item)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() =>
                      handleMultiSelectChange("productPreferences", item)
                    }
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">
                حساسیت‌های شناخته‌شده (چند مورد)
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {knownAllergiesList.map((item) => (
                  <div
                    key={item}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 text-sm text-center",
                      formData.knownAllergies.includes(item)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-input hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() =>
                      handleMultiSelectChange("knownAllergies", item)
                    }
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">
                داروهای خاص یا توضیحات اضافه (اختیاری)
              </Label>
              <Textarea
                placeholder="اگر داروی خاصی (مانند راکوتان) مصرف می‌کنید یا توضیح بیشتری دارید، اینجا بنویسید..."
                value={formData.medications}
                onChange={(e) =>
                  handleSingleSelectChange("medications", e.target.value)
                }
                className="mt-2 min-h-[80px]"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* --- این بخش کلیدی تغییرات است ---
        - در موبایل: تمام صفحه (w-full, h-full)، بدون پدینگ (p-0)، حالت flex-col
        - در دسکتاپ (sm:): اندازه قبلی (max-w-lg)، ارتفاع خودکار (h-auto)، پدینگ (p-6) و گوشه‌های گرد (rounded-lg)
      */}
      <DialogContent
        className="max-w-full w-full h-full p-0 flex flex-col 
                   sm:max-w-lg sm:h-auto sm:max-h-[90vh] sm:p-6 sm:rounded-lg"
        dir="rtl"
      >
        {/* هدر پدینگ موبایل می‌گیرد */}
        <DialogHeader className="p-6 pb-0 sm:p-0 sm:pb-0">
          <DialogTitle>تحلیل هوشمند پوست شما</DialogTitle>
          <DialogDescription>
            برای ارائه بهترین توصیه‌ها، به {TOTAL_STEPS} مرحله کوتاه نیاز داریم.
            این پروفایل به ما کمک می‌کند محصولاتی را پیشنهاد دهیم که دقیقا برای
            نیازهای پوست شما ساخته شده‌اند.
          </DialogDescription>
          {/* نوار پیشرفت */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </DialogHeader>

        {/* --- بخش کلیدی دوم ---
          - این div محتوا را در بر می‌گیرد
          - flex-1: باعث می‌شود تمام فضای خالی بین هدر و فوتر را پر کند
          - overflow-y-auto: اگر محتوا زیاد باشد (در موبایل)، اسکرول می‌خورد
          - px-6: پدینگ افقی موبایل
        */}
        <div className="flex-1 overflow-y-auto py-6 px-6 sm:px-0 sm:py-6 min-h-[350px]">
          {renderStepContent()}
        </div>

        {/* فوتر پدینگ موبایل می‌گیرد و به پایین می‌چسبد */}
        <DialogFooter className="justify-between p-6 pt-0 sm:p-0 sm:pt-0 sm:justify-between">
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
