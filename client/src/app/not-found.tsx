import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileSearch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <FileSearch className="w-16 h-16 text-gray-400 mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        صفحه مورد نظر یافت نشد
      </h1>
      <p className="text-gray-600 mb-6">
        متاسفانه آدرسی که به دنبال آن بودید وجود ندارد.
      </p>
      <Button asChild>
        <Link href="/">بازگشت به صفحه اصلی</Link>
      </Button>
    </div>
  );
}
