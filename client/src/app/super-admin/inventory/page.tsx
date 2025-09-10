"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function InventoryPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">مدیریت انبار</h1>
      <Tabs defaultValue="stock-history">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stock-history">تاریخچه موجودی</TabsTrigger>
          <TabsTrigger value="suppliers">مدیریت تامین‌کنندگان</TabsTrigger>
        </TabsList>
        <TabsContent value="stock-history">
          <Card>
            <CardHeader>
              <CardTitle>تاریخچه کامل تغییرات موجودی</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                در این بخش می‌توانید تمام ورودی و خروجی‌های انبار را مشاهده
                کنید.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>لیست تامین‌کنندگان</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                در این بخش می‌توانید تامین‌کنندگان محصولات خود را اضافه و مدیریت
                کنید.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default InventoryPage;
