// client/src/app/account/UserProfile.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/useUserStore";
import { useSkinProfileModalStore } from "@/store/useSkinProfileModalStore";
import { useQuickEditSkinProfileModalStore } from "@/store/useQuickEditSkinProfileModalStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import axiosAuth from "@/lib/axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

// کامپوننت کوچک برای نمایش آیتم‌های پروفایل
const ProfileDataItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    if (typeof value === "boolean") {
    } else {
      return null;
    }
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b last:border-b-0">
      <p className="text-sm font-semibold text-gray-600 mb-1 sm:mb-0">
        {label}
      </p>
      <div className="text-sm text-gray-800 text-left">{value}</div>
    </div>
  );
};

// کامپوننت کمکی برای رندر کردن بج‌ها
const renderBadges = (items: string[] | undefined | null) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-end gap-1" dir="rtl">
      {items.map((item) => (
        <Badge key={item} variant="secondary">
          {item}
        </Badge>
      ))}
    </div>
  );
};

// کامپوننت Skeleton برای لودینگ پروفایل پوستی
const SkinProfileSkeleton = () => (
  <div className="space-y-4 pt-2">
    <div className="space-y-2">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-5 w-1/4" />
    </div>
    <div className="space-y-2 pt-4">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-4/5" />
    </div>
    <div className="space-y-2 pt-4">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-4/5" />
    </div>
  </div>
);

export default function UserProfile() {
  const { data: session, update: updateSession } = useSession();
  const {
    userProfile,
    fetchProfile,
    updateUserProfile,
    clearSkinProfile,
    isLoading,
  } = useUserStore();
  const { onOpen: openSkinProfileModal } = useSkinProfileModalStore();
  const { onOpen: openQuickEditModal } = useQuickEditSkinProfileModalStore();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!userProfile) fetchProfile();
  }, [fetchProfile, userProfile]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
      });
    }
  }, [userProfile]);

  const handleSaveChanges = async () => {
    const result = await updateUserProfile({
      name: formData.name,
      email: formData.email,
    });
    if (result) {
      toast({ title: "اطلاعات شما با موفقیت به‌روزرسانی شد." });
      if (
        session?.user?.name !== formData.name ||
        session?.user?.email !== formData.email
      ) {
        await updateSession({ name: formData.name, email: formData.email });
      }
      setIsEditing(false);
    } else {
      toast({ title: "خطا در به‌روزرسانی اطلاعات.", variant: "destructive" });
    }
  };

  const handleSetPassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "رمزهای عبور یکسان نیستند.", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "رمز عبور باید حداقل ۶ کاراکتر باشد.",
        variant: "destructive",
      });
      return;
    }
    try {
      await axiosAuth.post("/auth/set-password", {
        password: passwordData.newPassword,
      });
      toast({ title: "رمز عبور شما با موفقیت تنظیم/تغییر یافت." });
      setPasswordData({ newPassword: "", confirmPassword: "" });
      await updateSession();
    } catch (error) {
      toast({ title: "خطا در تنظیم رمز عبور.", variant: "destructive" });
    }
  };

  const handleProfileButtonClick = () => {
    if (userProfile?.skinType) {
      openQuickEditModal();
    } else {
      openSkinProfileModal();
    }
  };

  const handleDeleteProfile = async () => {
    const result = await clearSkinProfile();
    if (result) {
      toast({ title: "پروفایل پوستی شما با موفقیت پاک شد." });
    } else {
      toast({ title: "خطا در پاک کردن پروفایل.", variant: "destructive" });
    }
  };

  // حالت نمایش (View Mode)
  if (!isEditing) {
    return (
      <div className="space-y-6 text-right">
        {/* Card اطلاعات حساب (بدون تغییر) */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>اطلاعات حساب</CardTitle>
              <CardDescription>اطلاعات پایه حساب کاربری شما.</CardDescription>
            </div>
            <Button onClick={() => setIsEditing(true)}>ویرایش اطلاعات</Button>
          </CardHeader>
          <CardContent>
            {isLoading && !userProfile ? (
              <div className="space-y-4">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-4/5" />
              </div>
            ) : (
              <>
                <ProfileDataItem
                  label="نام و نام خانوادگی"
                  value={userProfile?.name || "-"}
                />
                <ProfileDataItem
                  label="شماره موبایل"
                  value={<span dir="ltr">{userProfile?.phone || "-"}</span>}
                />
                <ProfileDataItem
                  label="ایمیل"
                  value={userProfile?.email || "-"}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* --- Card پروفایل پوستی (اصلاح شده) --- */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>پروفایل پوستی</CardTitle>
              <CardDescription>
                بر اساس این اطلاعات، بهترین محصولات به شما پیشنهاد داده می‌شود.
              </CardDescription>
            </div>
            {/* دکمه ویرایش فقط در صورت کامل بودن پروفایل نشان داده می‌شود */}
            {userProfile?.skinType && (
              <Button
                variant="outline"
                onClick={handleProfileButtonClick}
                disabled={isLoading}
              >
                ویرایش پروفایل
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading || !userProfile ? (
              // حالت الف: در حال لودینگ
              <SkinProfileSkeleton />
            ) : userProfile.skinType ? (
              // حالت ب: لود تمام شده و پروفایل کامل است
              <div className="space-y-2">
                {/* ... (تمام ProfileDataItem ها برای نمایش اطلاعات) ... */}
                <h4 className="font-semibold text-md pt-2">۱. اطلاعات پایه</h4>
                <ProfileDataItem label="رده سنی" value={userProfile.ageRange} />
                <ProfileDataItem label="جنسیت" value={userProfile.gender} />
                {userProfile.gender === "خانم" && (
                  <ProfileDataItem
                    label="وضعیت بارداری/شیردهی"
                    value={userProfile.isPregnantOrNursing ? "بله" : "خیر"}
                  />
                )}
                <h4 className="font-semibold text-md pt-4">۲. ارزیابی پوست</h4>
                <ProfileDataItem
                  label="نوع پوست"
                  value={
                    userProfile.skinType ? (
                      <Badge>{userProfile.skinType}</Badge>
                    ) : null
                  }
                />
                <ProfileDataItem
                  label="میزان حساسیت"
                  value={userProfile.skinSensitivity}
                />
                <ProfileDataItem
                  label="دغدغه‌های اصلی"
                  value={renderBadges(userProfile.skinConcerns)}
                />
                <ProfileDataItem
                  label="اهداف پوستی"
                  value={renderBadges(userProfile.skincareGoals)}
                />
                <ProfileDataItem
                  label="دغدغه‌های دور چشم"
                  value={renderBadges(userProfile.eyeConcerns)}
                />
                <ProfileDataItem
                  label="نوع آکنه"
                  value={userProfile.acneType}
                />
                <h4 className="font-semibold text-md pt-4">۳. روتین فعلی</h4>
                <ProfileDataItem
                  label="محصولات روتین"
                  value={renderBadges(userProfile.currentRoutineProducts)}
                />
                <ProfileDataItem
                  label="مواد موثره فعلی"
                  value={renderBadges(userProfile.activeIngredients)}
                />
                <ProfileDataItem
                  label="حساسیت‌های شناخته‌شده"
                  value={renderBadges(userProfile.knownAllergies)}
                />
                <h4 className="font-semibold text-md pt-4">۴. سبک زندگی</h4>
                <ProfileDataItem
                  label="میزان خواب"
                  value={userProfile.sleepHours}
                />
                <ProfileDataItem
                  label="سطح استرس"
                  value={userProfile.stressLevel}
                />
                <ProfileDataItem
                  label="عادات غذایی"
                  value={renderBadges(userProfile.dietHabits)}
                />
                <ProfileDataItem
                  label="مصرف دخانیات"
                  value={userProfile.smokingHabit}
                />
                <h4 className="font-semibold text-md pt-4">
                  ۵. محیط و ترجیحات
                </h4>
                <ProfileDataItem
                  label="محیط زندگی"
                  value={userProfile.environmentType}
                />
                <ProfileDataItem label="آب و هوا" value={userProfile.climate} />
                <ProfileDataItem
                  label="پیچیدگی روتین"
                  value={userProfile.routineComplexity}
                />
                <ProfileDataItem
                  label="ترجیحات ارزشی"
                  value={renderBadges(userProfile.productPreferences)}
                />
                <ProfileDataItem
                  label="توضیحات/داروها"
                  value={userProfile.medications}
                />
              </div>
            ) : (
              // حالت ج: لود تمام شده ولی پروفایل ناقص است (طراحی جدید)
              <div className="text-center p-4 py-8 bg-gray-50 rounded-md flex flex-col items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  روتین شخصی خود را کشف کنید
                </h3>
                <Button className="mt-6" onClick={handleProfileButtonClick}>
                  شروع تکمیل پروفایل
                </Button>
              </div>
            )}
          </CardContent>

          {/* دکمه پاک کردن (فقط اگر پروفایل وجود دارد) */}
          {userProfile?.skinType && (
            <CardFooter className="justify-end pt-4 border-t">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isLoading}>
                    پاک کردن تمام اطلاعات پروفایل پوستی
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent dir="rtl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      آیا از پاک کردن پروفایل پوستی خود مطمئن هستید؟
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      تمام اطلاعاتی که وارد کردید (نوع پوست، دغدغه‌ها، سبک زندگی
                      و...) برای همیشه پاک خواهند شد. این عمل قابل بازگشت نیست.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>انصراف</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteProfile}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      بله، پاک کن
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          )}
        </Card>
      </div>
    );
  }

  // حالت ویرایش (Edit Mode) - (بدون تغییر)
  return (
    <div className="space-y-6 text-right">
      <Card>
        <CardHeader>
          <CardTitle>ویرایش اطلاعات حساب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">نام و نام خانوادگی</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <Label>شماره موبایل (غیرقابل تغییر)</Label>
            <Input value={session?.user?.phone || ""} disabled dir="ltr" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 pt-6">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            انصراف
          </Button>
          <Button onClick={handleSaveChanges} disabled={isLoading}>
            {isLoading ? "در حال ذخیره..." : "ذخیره اطلاعات"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>مدیریت رمز عبور</CardTitle>
          <CardDescription>
            برای تغییر رمز عبور، فیلدهای زیر را پر کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              type="password"
              placeholder="رمز عبور جدید"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
            />
            <Input
              type="password"
              placeholder="تکرار رمز عبور جدید"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={
                    !passwordData.newPassword || !passwordData.confirmPassword
                  }
                >
                  ذخیره رمز عبور
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    آیا از تغییر رمز عبور مطمئن هستید؟
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>انصراف</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSetPassword}>
                    تایید و تغییر
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
