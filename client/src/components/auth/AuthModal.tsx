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
import logo from "../../../public/images/Logo/tiamara-logo.png"; // اطمینان از مسیر لوگو
import LoginForm from "./LoginForm";
import { useAuthProcessStore } from "@/store/useAuthProcessStore";
import { useToast } from "@/hooks/use-toast";

export default function AuthModal() {
  const { isOpen, onClose } = useAuthModalStore();
  const { step, setStep } = useAuthProcessStore();
  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
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
      <DialogContent className="p-0 max-w-[420px] w-full rounded-3xl overflow-hidden gap-0 border-none bg-white">
        <DialogHeader className="sr-only">
          <DialogTitle>ورود یا ثبت‌نام</DialogTitle>
          <DialogDescription>لطفا وارد حساب کاربری خود شوید.</DialogDescription>
        </DialogHeader>

        {/* هدر رنگی ملایم در بالای مودال */}
        <div className="bg-gradient-to-b from-primary/5 to-transparent pt-8 pb-4 flex justify-center">
          <div className="relative w-[120px] h-[50px]">
            <Image src={logo} alt="تیامارا" fill className="object-contain" />
          </div>
        </div>

        {/* بدنه فرم با پدینگ مناسب */}
        <div className="px-8 pb-8 pt-2">
          <LoginForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
