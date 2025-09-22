"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import BannerManager from "./BannerManager";
import CollectionManager from "./CollectionManager";

function ManageHomepagePage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">مدیریت صفحه اصلی</h1>

      <Tabs defaultValue="banners" dir="rtl">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="banners">مدیریت بنرها</TabsTrigger>
          <TabsTrigger value="sections">مدیریت سکشن‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="mt-6">
          <BannerManager />
        </TabsContent>

        <TabsContent value="sections" className="mt-6">
          <CollectionManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ManageHomepagePage;
