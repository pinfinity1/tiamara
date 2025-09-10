"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        متاسفانه خطایی رخ داده است!
      </h2>
      <p className="text-gray-600 mb-6">
        مشکلی در بارگذاری این بخش به وجود آمده است. لطفاً دوباره تلاش کنید.
      </p>
      <Button onClick={() => reset()}>تلاش مجدد</Button>
    </div>
  );
}
