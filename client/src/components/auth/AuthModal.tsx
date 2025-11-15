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
import { useAuthProcessStore } from "@/store/useAuthProcessStore";
import { useToast } from "@/hooks/use-toast";

export default function AuthModal() {
  const { isOpen, onClose } = useAuthModalStore();
  const { step, setStep } = useAuthProcessStore();
  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (step === "force-password-setup") {
        toast({
          title: "لطفا ابتدا رمز عبور خود را تنظیم کنید.",
          variant: "destructive",
        });
        return;
      }

      setStep("phone");
      onClose();
    }
  };

  const handleSuccess = () => {
    setStep("phone");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="p-8 max-w-sm w-full rounded-lg"
        onInteractOutside={(e) => {
          if (step === "force-password-setup") {
            e.preventDefault();
          }
        }}
      >
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
        <LoginForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
