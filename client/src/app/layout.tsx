import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import CommonLayout from "@/components/common/layout";

export const metadata: Metadata = {
  title: "تیامارا",
  description: "لوازم آرایشی و بهداشتی اورجینال، آراستن ، لطافت و زیبایی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`antialiased`}>
        <CommonLayout>{children}</CommonLayout>
        <Toaster />
      </body>
    </html>
  );
}
