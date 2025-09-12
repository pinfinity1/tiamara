"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GlobalSearch from "./GlobalSearch";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 gap-0 w-full h-full max-w-full sm:max-w-full rounded-none sm:rounded-none">
        <DialogHeader className="sr-only">
          <DialogTitle>جستجو</DialogTitle>
        </DialogHeader>
        <GlobalSearch onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
