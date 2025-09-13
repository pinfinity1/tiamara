import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  className?: string;
}

export default function ImagePlaceholder({ className }: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gray-100",
        className
      )}
    >
      <Image
        src="/images/Logo/tiamara-icon-black.png"
        alt="Tiamara Placeholder"
        width={64}
        height={64}
        className="h-16 w-16 opacity-40"
      />
    </div>
  );
}
