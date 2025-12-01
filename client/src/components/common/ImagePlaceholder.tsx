import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  className?: string;
  iconClassName?: string;
}

export default function ImagePlaceholder({
  className,
  iconClassName,
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center bg-gray-50 overflow-hidden",
        className
      )}
    >
      <Image
        src="/images/Logo/tiamara-icon-black.png" // استفاده از لوگوی خودتان
        alt="Tiamara Placeholder"
        fill
        className={cn(
          "object-contain opacity-30 p-4", // استایل یکپارچه: شفافیت کم و پدینگ برای فاصله از لبه‌ها
          iconClassName
        )}
      />
    </div>
  );
}
