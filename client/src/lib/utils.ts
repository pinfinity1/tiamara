import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toPersianDigits(n: string | number): string {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return n.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
}

export function toEnglishDigits(s: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return s.replace(/[۰-۹]/g, (w) => {
    return persianDigits.indexOf(w).toString();
  });
}

export function isValidIranianPhoneNumber(phone: string): boolean {
  const regex = /^09[0-9]{9}$/;
  return regex.test(phone);
}
