import { Building, Target } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            درباره تیامارا
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            داستان ما، تعهد ما به زیبایی و اصالت است. ما معتقدیم هر فردی شایسته
            بهترین‌هاست.
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
            <p className="text-gray-700 leading-relaxed">
              ماموریت ما در تیامارا، ارائه‌ی محصولات آرایشی و بهداشتی اورجینال
              از برترین برندهای جهان با بهترین قیمت و تضمین اصالت کالا است. ما
              می‌خواهیم تجربه‌ای لذت‌بخش و مطمئن از خرید آنلاین را برای شما
              فراهم کنیم و به شما کمک کنیم تا زیبایی طبیعی خود را بهتر بشناسید و
              آن را جشن بگیرید.
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
            <p className="text-gray-700 leading-relaxed">
              تیامارا از یک رویای ساده شروع شد: ایجاد فضایی که در آن کیفیت،
              اصالت و احترام به مشتری حرف اول را بزند. ما با شناخت دغدغه‌های
              علاقه‌مندان به زیبایی، از جمله نگرانی از محصولات تقلبی و قیمت‌های
              نامناسب، تصمیم گرفتیم تا فروشگاهی را پایه‌گذاری کنیم که به این
              نیازها پاسخ دهد. امروز، با افتخار در کنار شما هستیم.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
