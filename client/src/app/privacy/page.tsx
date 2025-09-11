// src/app/privacy/page.tsx

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto prose prose-lg prose-rtl text-justify">
          <h1>سیاست حفظ حریم خصوصی</h1>

          <h2>چه اطلاعاتی را جمع‌آوری می‌کنیم؟</h2>
          <p>
            [...محتوای کامل سیاست‌های حفظ حریم خصوصی کاربران را در اینجا قرار
            دهید. این متن نیز برای دریافت اینماد الزامی است...]
          </p>

          <h2>چگونه از اطلاعات شما استفاده می‌کنیم؟</h2>
          <p>
            اطلاعات جمع‌آوری شده برای پردازش سفارشات، بهبود تجربه کاربری و
            اطلاع‌رسانی‌های مهم استفاده خواهد شد.
          </p>

          {/* بقیه موارد را به همین شکل اضافه کنید */}
        </div>
      </div>
    </div>
  );
}
