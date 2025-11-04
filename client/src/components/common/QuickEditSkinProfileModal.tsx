// project/client/src/components/common/QuickEditSkinProfileModal.tsx

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
import { useQuickEditSkinProfileModalStore } from "@/store/useQuickEditSkinProfileModalStore"; // <-- استفاده از استور جدید
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator"; // <-- برای جداسازی بخش‌ها

// --- داده‌های جامع برای پرسشنامه (کپی شده از SkinProfileModal) ---
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
  { name: "کمی حساس", desc: "فقط به برخی محصولات خاص واکنش نشان می‌دهم." },
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

export default function QuickEditSkinProfileModal() {
  const { isOpen, onClose } = useQuickEditSkinProfileModalStore(); // <-- استفاده از استور جدید
  const { userProfile, updateUserProfile, fetchProfile, isLoading } =
    useUserStore();
  const { toast } = useToast();

  // تعریف حالت اولیه (formData) با تمام فیلدهای جدید
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

  // بروزرسانی useEffect برای خواندن تمام فیلدهای جدید از userProfile
  useEffect(() => {
    if (isOpen) {
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

  // توابع کمکی برای مدیریت انواع ورودی‌ها
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
      toast({ title: "پروفایل پوستی شما با موفقیت به‌روزرسانی شد." });
      onClose();
      fetchProfile();
    } else {
      toast({ title: "خطا در ذخیره‌سازی.", variant: "destructive" });
    }
  };

  // --- کامپوننت‌های کمکی برای رندر کردن بخش‌های فرم ---
  // (اینها همان JSXهایی هستند که در case های مودال ۱۰ مرحله‌ای داشتیم)

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <Label className="text-lg font-semibold">۱. اطلاعات پایه</Label>
      <div>
        <Label>رده سنی شما؟</Label>
        <Select
          value={formData.ageRange}
          onValueChange={(value) => handleSingleSelectChange("ageRange", value)}
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
        <Label>جنسیت</Label>
        <Select
          value={formData.gender}
          onValueChange={(value) => handleSingleSelectChange("gender", value)}
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
          <Label>اطلاعات ایمنی (بسیار مهم)</Label>
          <div className="flex items-center justify-between rounded-lg border p-4 mt-2">
            <Label
              htmlFor="isPregnantOrNursing_quick"
              className="flex flex-col space-y-1"
            >
              <span>آیا باردار هستید یا در دوران شیردهی به سر می‌برید؟</span>
            </Label>
            <Switch
              id="isPregnantOrNursing_quick"
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

  const renderSkinAssessment = () => (
    <div className="space-y-6">
      <Label className="text-lg font-semibold">۲. ارزیابی پوست</Label>
      <div>
        <Label>نوع پوست شما چیست؟</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {skinTypesWithDesc.map((type) => (
            <div
              key={type.name}
              className={cn(
                "flex flex-col text-center justify-center p-3 rounded-lg border cursor-pointer",
                formData.skinType === type.name
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => handleSingleSelectChange("skinType", type.name)}
            >
              <span className="font-semibold text-sm">{type.name}</span>
              <span className="text-xs mt-1">{type.desc}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>پوست شما چقدر حساس است؟</Label>
        <div className="grid grid-cols-1 gap-3 mt-2">
          {sensitivities.map((item) => (
            <div
              key={item.name}
              className={cn(
                "flex flex-col text-right justify-center p-3 rounded-lg border cursor-pointer",
                formData.skinSensitivity === item.name
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
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
      <div>
        <Label>دغدغه‌های اصلی پوست صورت شما؟ (چند مورد)</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {mainConcerns.map((concern) => (
            <div
              key={concern}
              className={cn(
                "flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm text-center",
                formData.skinConcerns.includes(concern)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => handleMultiSelectChange("skinConcerns", concern)}
            >
              {concern}
            </div>
          ))}
        </div>
      </div>
      {formData.skinConcerns.includes("آکنه و جوش") && (
        <div>
          <Label>نوع آکنه شما معمولاً چگونه است؟</Label>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {acneTypes.map((type) => (
              <div
                key={type}
                className={cn(
                  "flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm text-center",
                  formData.acneType === type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                onClick={() => handleSingleSelectChange("acneType", type)}
              >
                {type}
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <Label>اهداف اصلی شما برای پوستتان چیست؟ (چند مورد)</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {skincareGoals.map((goal) => (
            <div
              key={goal}
              className={cn(
                "flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm text-center",
                formData.skincareGoals.includes(goal)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => handleMultiSelectChange("skincareGoals", goal)}
            >
              {goal}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>دغدغه ناحیه دور چشم؟ (چند مورد)</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {eyeConcernsList.map((concern) => (
            <div
              key={concern}
              className={cn(
                "flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm text-center",
                formData.eyeConcerns.includes(concern)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => handleMultiSelectChange("eyeConcerns", concern)}
            >
              {concern}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRoutine = () => (
    <div className="space-y-6">
      <Label className="text-lg font-semibold">۳. روتین و سابقه</Label>
      <div>
        <Label>در حال حاضر از چه محصولاتی استفاده می‌کنید؟</Label>
        <div className="grid grid-cols-4 gap-3 mt-2">
          {routineProducts.map((product) => (
            <div
              key={product}
              className={cn(
                "flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm text-center",
                formData.currentRoutineProducts.includes(product)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
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
        <Label>آیا از این مواد موثره استفاده می‌کنید؟ (مهم)</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {activeIngredientsList.map((item) => (
            <div
              key={item}
              className={cn(
                "flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm text-center",
                formData.activeIngredients.includes(item)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => handleMultiSelectChange("activeIngredients", item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>حساسیت‌های شناخته‌شده (چند مورد)</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {knownAllergiesList.map((item) => (
            <div
              key={item}
              className={cn(
                "flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm text-center",
                formData.knownAllergies.includes(item)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => handleMultiSelectChange("knownAllergies", item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>داروهای خاص یا توضیحات اضافه (اختیاری)</Label>
        <Textarea
          placeholder="اگر داروی خاصی (مانند راکوتان) مصرف می‌کنید..."
          value={formData.medications}
          onChange={(e) =>
            handleSingleSelectChange("medications", e.target.value)
          }
          className="mt-2 min-h-[80px]"
        />
      </div>
    </div>
  );

  const renderLifestyleAndPrefs = () => (
    <div className="space-y-6">
      <Label className="text-lg font-semibold">۴. سبک زندگی و ترجیحات</Label>
      <div>
        <Label>میزان خواب شبانه</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {sleepHoursOptions.map((item) => (
            <div
              key={item}
              className={cn(
                "flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm",
                formData.sleepHours === item
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => handleSingleSelectChange("sleepHours", item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>سطح استرس روزانه</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {stressLevelOptions.map((item) => (
            <div
              key={item}
              className={cn(
                "flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm",
                formData.stressLevel === item
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => handleSingleSelectChange("stressLevel", item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>عادات غذایی (چند مورد)</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {dietHabitsList.map((item) => (
            <div
              key={item}
              className={cn(
                "flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm text-center",
                formData.dietHabits.includes(item)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => handleMultiSelectChange("dietHabits", item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>مصرف دخانیات</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {smokingHabits.map((item) => (
            <div
              key={item}
              className={cn(
                "flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm",
                formData.smokingHabit === item
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => handleSingleSelectChange("smokingHabit", item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>محیط زندگی شما</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {environments.map((item) => (
            <div
              key={item}
              className={cn(
                "flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm text-center",
                formData.environmentType === item
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => handleSingleSelectChange("environmentType", item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>آب و هوای محل زندگی</Label>
        <div className="grid grid-cols-4 gap-3 mt-2">
          {climates.map((item) => (
            <div
              key={item}
              className={cn(
                "flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm text-center",
                formData.climate === item
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={() => handleSingleSelectChange("climate", item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>پیچیدگی روتین</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {routineComplexities.map((item) => (
            <div
              key={item}
              className={cn(
                "flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm text-center",
                formData.routineComplexity === item
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
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
        <Label>ترجیحات ارزشی (چند مورد)</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {productPreferencesList.map((item) => (
            <div
              key={item}
              className={cn(
                "flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm",
                formData.productPreferences.includes(item)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
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
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-full w-full h-full p-0 flex flex-col 
                   sm:max-w-2xl sm:h-auto sm:max-h-[90vh] sm:p-6 sm:rounded-lg" // <-- عرض مودال کمی بیشتر شد (2xl)
        dir="rtl"
      >
        <DialogHeader className="p-6 pb-4 sm:p-0 sm:pb-0">
          <DialogTitle>ویرایش سریع پروفایل پوست</DialogTitle>
          <DialogDescription>
            تغییرات مورد نظر خود را اعمال کرده و دکمه ذخیره را بزنید.
          </DialogDescription>
        </DialogHeader>

        {/* --- بخش اصلی فرم، قابل اسکرول --- */}
        <div className="flex-1 overflow-y-auto py-6 px-6 sm:px-1 space-y-8">
          {renderBasicInfo()}
          <Separator />
          {renderSkinAssessment()}
          <Separator />
          {renderRoutine()}
          <Separator />
          {renderLifestyleAndPrefs()}
        </div>

        <DialogFooter className="justify-end p-6 pt-4 sm:p-0 sm:pt-6">
          <Button variant="outline" onClick={onClose}>
            انصراف
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
