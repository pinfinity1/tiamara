import { auth } from "@/auth";
import CheckoutClient from "./CheckoutClient";
import { Metadata } from "next";
import { getShippingMethods } from "@/lib/data-fetching";

export const metadata: Metadata = {
  title: "سبد خرید و پرداخت",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await auth();
  const isUserLoggedIn = !!session?.user;

  const shippingMethods = await getShippingMethods();

  return (
    <CheckoutClient
      isUserLoggedIn={isUserLoggedIn}
      initialShippingMethods={shippingMethods}
    />
  );
}
