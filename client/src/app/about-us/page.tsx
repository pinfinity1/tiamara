import { Building, Target, Heart } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "درباره ما",
  description:
    "داستان تیامارا و تعهد ما به ارائه محصولات آرایشی و بهداشتی اصل. با ماموریت و داستان ما بیشتر آشنا شوید.",
};

export default function AboutUsPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            درباره تیامارا
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            داستان ما، داستان عشق به زیبایی و اصالت است.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mr-4">
                ماموریت ما
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-justify">
              ماموریت ما در تیامارا، فراتر از یک فروشگاه آنلاین، ایجاد فضایی امن
              و قابل اعتماد برای تمام علاقه‌مندان به زیبایی است. ما متعهد هستیم
              که با ارائه‌ی مجموعه‌ای دست‌چین شده از محصولات آرایشی و بهداشتی
              ۱۰۰٪ اورجینال از برترین برندهای جهان، تجربه‌ای لذت‌بخش و مطمئن از
              خرید را برای شما به ارمغان آوریم. ما می‌خواهیم به شما کمک کنیم تا
              زیبایی منحصر به فرد خود را بهتر بشناسید و با افتخار آن را جشن
              بگیرید.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mr-4">
                داستان ما
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-justify">
              داستان تیامارا از یک دغدغه‌ی مشترک شروع شد: «چطور می‌توانیم در
              بازار شلوغ امروز، محصولات آرایشی اصل را با اطمینان پیدا کنیم؟» ما،
              بنیان‌گذاران تیامارا، خودمان مصرف‌کنندگانی بودیم که از قیمت‌های
              نامناسب و نگرانی دائمی از خرید محصولات تقلبی خسته شده بودیم. این
              دغدغه به یک رویا تبدیل شد: ساختن پلتفرمی که در آن کیفیت، اصالت و
              احترام به مشتری، حرف اول را بزند.
              <br />
              <br />
              پس از ماه‌ها تحقیق و همکاری با معتبرترین تامین‌کنندگان، تیامارا
              متولد شد تا پلی باشد میان شما و برندهای محبوبتان. امروز، با افتخار
              در کنار شما هستیم و به این مسیر ادامه می‌دهیم تا زیبایی و اعتماد
              به نفس را به شما هدیه دهیم.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mr-4">
                چرا تیامارا؟
              </h2>
            </div>
            <ul className="list-disc pr-5 space-y-2 text-gray-700">
              <li>
                <span className="font-bold">تضمین ۱۰۰٪ اصالت کالا:</span> ما
                مستقیماً با برندها و توزیع‌کنندگان رسمی همکاری می‌کنیم.
              </li>
              <li>
                <span className="font-bold">مشاوره تخصصی:</span> تیم ما آماده
                است تا به شما در انتخاب بهترین محصول کمک کند.
              </li>
              <li>
                <span className="font-bold">ارسال سریع و مطمئن:</span> سفارش شما
                در سریع‌ترین زمان و با بهترین بسته‌بندی به دستتان می‌رسد.
              </li>
              <li>
                <span className="font-bold">تجربه‌ی خرید لذت‌بخش:</span> ما برای
                راحتی شما، از طراحی سایت گرفته تا پشتیبانی، به تمام جزئیات فکر
                کرده‌ایم.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
