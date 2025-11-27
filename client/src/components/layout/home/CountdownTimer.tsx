"use client";
import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({
  targetDate,
}: {
  targetDate: string | Date;
}) {
  const calculateTimeLeft = (): TimeLeft | null => {
    const end = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = end - now;

    if (difference > 0) {
      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      };
    }
    return null;
  };

  // مقدار اولیه null برای جلوگیری از عدم تطابق سرور و کلاینت
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // محاسبه زمان فقط در سمت کلاینت شروع می‌شود
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // تا زمانی که محاسبه سمت کلاینت انجام نشده، چیزی نشان نده (یا یک لودینگ ساده)
  if (!timeLeft) {
    return (
      <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium">
        در حال محاسبه...
      </div>
    );
  }

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center bg-white/90 backdrop-blur-sm rounded-lg p-2 min-w-[45px] shadow-sm border border-rose-100">
      <span className="text-lg font-bold text-rose-600 font-mono">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[9px] text-gray-500">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-2 justify-center" dir="ltr">
      {timeLeft.days > 0 && (
        <>
          <TimeUnit value={timeLeft.days} label="روز" />
          <span className="text-rose-300 font-bold text-lg self-center">:</span>
        </>
      )}
      <TimeUnit value={timeLeft.hours} label="ساعت" />
      <span className="text-rose-300 font-bold text-lg self-center">:</span>
      <TimeUnit value={timeLeft.minutes} label="دقیقه" />
      <span className="text-rose-300 font-bold text-lg self-center">:</span>
      <TimeUnit value={timeLeft.seconds} label="ثانیه" />
    </div>
  );
}
