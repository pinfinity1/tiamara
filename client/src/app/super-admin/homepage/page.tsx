"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import BannerManager from "./BannerManager";
import CollectionManager from "./CollectionManager";
import VideoShowcaseManager from "./VideoShowcaseManager";

function ManageHomepagePage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">مدیریت صفحه اصلی</h1>

      <Tabs defaultValue="banners" dir="rtl">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="banners">مدیریت بنرها</TabsTrigger>
          <TabsTrigger value="sections">مدیریت سکشن‌ها</TabsTrigger>
          <TabsTrigger value="videoShowcase">اسلایدر ویدیویی</TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="mt-6">
          <BannerManager />
        </TabsContent>

        <TabsContent value="sections" className="mt-6">
          <CollectionManager />
        </TabsContent>

        <TabsContent value="videoShowcase">
          <VideoShowcaseManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ManageHomepagePage;
