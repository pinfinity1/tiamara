"use client";

const CheckoutStepper = ({ currentStep }: { currentStep: number }) => {
  // عناوین کوتاه برای موبایل و کامل برای دسکتاپ
  const steps = ["ارسال", "روش", "پرداخت"];
  const fullSteps = ["اطلاعات ارسال", "روش ارسال", "پرداخت"];
  const displayStep = currentStep - 1;

  return (
    <div className="flex justify-between items-start mb-12 max-w-2xl mx-auto">
      {steps.map((step, index) => (
        <div
          key={index}
          className="step-item flex flex-col items-center relative"
          style={{ flex: 1 }} // باعث می‌شود هر آیتم فضای مساوی بگیرد
        >
          {/* خط اتصال‌دهنده */}
          {index < steps.length - 1 && (
            <div
              className={`absolute top-4 left-1/2 w-full h-0.5 transition-colors duration-300 ${
                index + 1 < displayStep ? "bg-primary" : "bg-gray-200"
              }`}
            />
          )}

          {/* دایره شماره مرحله */}
          <div
            className={`z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors duration-300 ${
              index + 1 < displayStep
                ? "bg-green-500 text-white" // مرحله انجام شده
                : index + 1 === displayStep
                ? "bg-primary text-primary-foreground" // مرحله فعلی
                : "bg-gray-200 text-gray-500" // مرحله بعدی
            }`}
          >
            {index + 1 < displayStep ? "✔" : index + 1}
          </div>

          {/* عنوان مرحله برای موبایل */}
          <span
            className={`mt-2 text-xs text-center md:hidden transition-colors duration-300 ${
              index + 1 <= displayStep
                ? "text-primary font-semibold"
                : "text-gray-500"
            }`}
          >
            {step}
          </span>

          {/* عنوان مرحله برای دسکتاپ */}
          <span
            className={`mt-2 text-sm text-center hidden md:block transition-colors duration-300 ${
              index + 1 <= displayStep
                ? "text-primary font-semibold"
                : "text-gray-500"
            }`}
          >
            {fullSteps[index]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CheckoutStepper;
