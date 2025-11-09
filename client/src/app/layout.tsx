import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import CommonLayout from "@/components/common/layout";
import Script from "next/script";
import NextAuthProvider from "@/components/common/NextAuthProvider";
import { auth } from "@/auth";

export const metadata: Metadata = {
  metadataBase: new URL("http://www.tiamara.ir"),
  title: {
    template: "%s | تیامارا",
    default: "تیامارا | لوازم آرایشی و بهداشتی",
  },
  description: "لوازم آرایشی و بهداشتی ، آراستن ، لطافت و زیبایی",
  verification: {
    other: {
      // این خط، متاتگ <meta name="enamad" content="48644659" /> را می‌سازد
      enamad: "48644659",
    },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tiamara",
  url: "https://www.tiamara.ir",
  logo: "https://www.tiamara.ir/images/Logo/tiamara-logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+98-9397155826",
    contactType: "customer service",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="fa" dir="rtl">
      <body className={`antialiased`}>
        <NextAuthProvider>
          <CommonLayout session={session}>{children}</CommonLayout>
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
