"use client";

import Image from "next/image";
import banner from "../../../../public/images/login-banner.webp";
import logo from "../../../../public/images/Logo/tiamara-logo.png";

import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#fff6f4] flex">
      <div className="hidden lg:block w-1/2 bg-[#ffede1] relative overflow-hidden">
        <Image
          src={banner}
          alt="Register"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>
      <div className="w-full lg:w-1/2 flex flex-col p-4 sm:p-8 lg:p-16 justify-center">
        <div className="max-w-md w-full mx-auto p-6 sm:p-8 lg:p-12 bg-white shadow-lg rounded-2xl">
          <div className="flex justify-center mb-6">
            <Image src={logo} width={120} height={70} alt="Logo" />
          </div>
          <LoginForm onSuccess={handleLoginSuccess} />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
