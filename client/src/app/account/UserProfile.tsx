// client/src/app/account/UserProfile.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/useUserStore";
import { useSkinProfileModalStore } from "@/store/useSkinProfileModalStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// کامپوننت کوچک برای نمایش آیتم‌های پروفایل
const ProfileDataItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between items-center py-3 border-b last:border-b-0">
    <p className="text-sm font-semibold text-gray-600">{label}</p>
    <div className="text-sm text-gray-800 text-left">{value}</div>
  </div>
);

export default function UserProfile() {
  const { data: session, update: updateSession } = useSession();
  const { userProfile, fetchProfile, updateUserProfile, isLoading } =
    useUserStore();
  const { onOpen: openSkinProfileModal } = useSkinProfileModalStore();
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
      setIsEditing(false); // بازگشت به حالت نمایش
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

  // حالت نمایش (View Mode)
  if (!isEditing) {
    return (
      <div className="space-y-6 text-right">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>اطلاعات حساب</CardTitle>
              <CardDescription>اطلاعات پایه حساب کاربری شما.</CardDescription>
            </div>
            <Button onClick={() => setIsEditing(true)}>ویرایش اطلاعات</Button>
          </CardHeader>
          <CardContent>
            <ProfileDataItem
              label="نام و نام خانوادگی"
              value={userProfile?.name || "-"}
            />
            <ProfileDataItem
              label="شماره موبایل"
              value={<span dir="ltr">{userProfile?.phone || "-"}</span>}
            />
            <ProfileDataItem label="ایمیل" value={userProfile?.email || "-"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>پروفایل پوستی شما</CardTitle>
            <CardDescription>
              {userProfile?.skinType
                ? "بر اساس این اطلاعات، بهترین محصولات به شما پیشنهاد داده می‌شود."
                : "پروفایل پوستی شما هنوز کامل نیست! با تکمیل آن پیشنهادات شگفت‌انگیزی دریافت کنید."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userProfile?.skinType ? (
              <>
                <ProfileDataItem
                  label="نوع پوست"
                  value={<Badge>{userProfile.skinType}</Badge>}
                />
                <ProfileDataItem
                  label="نگرانی‌های اصلی"
                  value={
                    <div className="flex flex-wrap justify-end gap-1">
                      {userProfile.skinConcerns.map((c) => (
                        <Badge key={c} variant="secondary">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  }
                />
                <ProfileDataItem
                  label="اهداف شما"
                  value={
                    <div className="flex flex-wrap justify-end gap-1">
                      {userProfile.skincareGoals.map((g) => (
                        <Badge key={g} variant="secondary">
                          {g}
                        </Badge>
                      ))}
                    </div>
                  }
                />
              </>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-md">
                <p>هنوز پروفایل پوستی خود را تکمیل نکرده‌اید.</p>
              </div>
            )}
            <Button className="w-full mt-4" onClick={openSkinProfileModal}>
              {userProfile?.skinType
                ? "ویرایش پروفایل پوستی"
                : "شروع و تکمیل پروفایل پوستی"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // حالت ویرایش (Edit Mode)
  return (
    <div className="space-y-6 text-right">
      <Card>
        <CardHeader>
          <CardTitle>ویرایش اطلاعات حساب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
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
          </div>
          <div className="pt-4 border-t">
            <Label>مدیریت رمز عبور</Label>
            <p className="text-xs text-gray-500 mb-2">
              برای تغییر رمز عبور، فیلدهای زیر را پر کنید.
            </p>
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
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => setIsEditing(false)}>
          انصراف
        </Button>
        <Button onClick={handleSaveChanges} disabled={isLoading}>
          {isLoading ? "در حال ذخیره..." : "ذخیره اطلاعات حساب"}
        </Button>
      </div>
    </div>
  );
}
