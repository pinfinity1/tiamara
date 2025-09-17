import { auth } from "@/auth";
import CheckoutClient from "./CheckoutClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "سبد خرید و پرداخت | تیامارا",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await auth();
  const isUserLoggedIn = !!session?.user;

  return <CheckoutClient isUserLoggedIn={isUserLoggedIn} />;
}
