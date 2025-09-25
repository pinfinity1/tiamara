import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import CommonLayout from "@/components/common/layout";
import Script from "next/script";
import NextAuthProvider from "@/components/common/NextAuthProvider";

export const metadata: Metadata = {
  title: {
    template: "%s | تیامارا",
    default: "تیامارا | لوازم آرایشی و بهداشتی اورجینال",
  },
  description: "لوازم آرایشی و بهداشتی اورجینال، آراستن ، لطافت و زیبایی",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tiamara",
  url: "https://www.tiamara.ir",
  logo: "https://www.tiamara.ir/images/Logo/tiamara-logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+98-21-12345678",
    contactType: "customer service",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`antialiased`}>
        <NextAuthProvider>
          <CommonLayout>{children}</CommonLayout>
          <Toaster />
        </NextAuthProvider>
        <Script
          id="org-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </body>
    </html>
  );
}
