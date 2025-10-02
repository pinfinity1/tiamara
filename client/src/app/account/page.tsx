"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserAddresses from "./UserAddresses";
import UserProfile from "./UserProfile";
import UserOrders from "./UserOrders";
import UserWishlist from "./UserWishlist";

function UserAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab("profile");
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/account?tab=${value}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center md:text-right">
          حساب کاربری من
        </h1>
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={handleTabChange} dir="rtl">
            <TabsList className="grid w-full grid-cols-4 md:h-[60px]">
              <TabsTrigger value="profile">پروفایل</TabsTrigger>
              <TabsTrigger value="orders">سفارشات</TabsTrigger>
              <TabsTrigger value="addresses">آدرس‌ها</TabsTrigger>
              <TabsTrigger value="wishlist">علاقه‌مندی‌ها</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <UserProfile />
            </TabsContent>
            <TabsContent value="orders">
              <UserOrders />
            </TabsContent>
            <TabsContent value="addresses">
              <UserAddresses />
            </TabsContent>
            <TabsContent value="wishlist">
              <UserWishlist />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default UserAccountPage;
