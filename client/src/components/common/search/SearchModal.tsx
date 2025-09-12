"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import GlobalSearch from "./GlobalSearch";
import { ArrowRight, X } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="p-0 gap-0 w-full h-[90vh] rounded-t-lg [&>button]:hidden"
      >
        <SheetHeader className="p-4 border-b flex flex-row items-center justify-between gap-2">
          <SheetClose asChild>
            <button className="w-fit">
              <ArrowRight className="text-gray-500" />
            </button>
          </SheetClose>
          <SheetTitle className="!mt-0 w-full">
            <GlobalSearch />
          </SheetTitle>
        </SheetHeader>
        <div className="p-4"></div>
      </SheetContent>
    </Sheet>
  );
}
