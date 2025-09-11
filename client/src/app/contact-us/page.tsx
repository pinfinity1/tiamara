import { Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactUsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            تماس با ما
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            همیشه آماده پاسخگویی به سوالات و شنیدن نظرات شما هستیم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <div className="space-y-6 bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">راه‌های ارتباطی</h2>
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div className="mr-4">
                <h3 className="font-semibold">تلفن پشتیبانی</h3>
                <p className="text-gray-600" dir="ltr">
                  ۰۲۱-۱۲۳۴۵۶۷۸
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div className="mr-4">
                <h3 className="font-semibold">ایمیل</h3>
                <p className="text-gray-600">info@tiamara.com</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary/10 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div className="mr-4">
                <h3 className="font-semibold">آدرس</h3>
                <p className="text-gray-600">
                  [استان، شهر، خیابان اصلی، کوچه فرعی، پلاک و واحد خود را اینجا
                  وارد کنید]
                </p>
              </div>
            </div>
          </div>

          {/* بخش فرم تماس */}
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">ارسال پیام</h2>
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">نام شما</Label>
                <Input
                  id="name"
                  placeholder="نام و نام خانوادگی"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">ایمیل</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="message">پیام شما</Label>
                <Textarea
                  id="message"
                  placeholder="پیام خود را اینجا بنویسید..."
                  className="mt-1"
                  rows={5}
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                ارسال پیام
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
