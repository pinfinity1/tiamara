"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserAddresses from "./UserAddresses";
import UserProfile from "./UserProfile";
import { User, MapPin, FileText, Heart } from "lucide-react";
import UserOrders from "./UserOrders";
import UserWishlist from "./UserWishlist";

function UserAccountPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-6 text-right">
          حساب کاربری من
        </h1>
        <Tabs
          defaultValue="profile"
          dir="rtl"
          className="w-full flex flex-col md:flex-row gap-8 items-start"
        >
          <TabsList className="grid w-full md:w-56 grid-cols-4 md:grid-cols-1 h-auto shrink-0 mt-2 p-2">
            <TabsTrigger value="profile" className="gap-2 justify-start p-2">
              <User className="h-4 w-4" /> پروفایل من
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2 justify-start p-2">
              <MapPin className="h-4 w-4" /> آدرس‌های من
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 justify-start p-2">
              <FileText className="h-4 w-4" /> سفارشات من
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="gap-2 justify-start p-2">
              <Heart className="h-4 w-4" /> لیست علاقه‌مندی‌ها
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 w-full">
            <TabsContent value="profile">
              <UserProfile />
            </TabsContent>

            <TabsContent value="addresses">
              <UserAddresses />
            </TabsContent>

            <TabsContent value="orders">
              <UserOrders />
            </TabsContent>

            <TabsContent value="wishlist">
              <UserWishlist />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default UserAccountPage;
