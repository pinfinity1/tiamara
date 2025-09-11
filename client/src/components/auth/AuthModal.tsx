"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import Image from "next/image";
import logo from "../../../public/images/Logo/tiamara-logo.png";
import LoginForm from "./LoginForm";

export default function AuthModal() {
  const { isOpen, onClose } = useAuthModalStore();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-8 max-w-sm w-full rounded-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>ورود یا ثبت‌نام</DialogTitle>
          <DialogDescription>
            برای دسترسی به این بخش، لطفاً وارد حساب کاربری خود شوید یا یک حساب
            جدید بسازید.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center mb-6">
          <Image src={logo} width={120} height={70} alt="Logo" />
        </div>

        <LoginForm onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
}
