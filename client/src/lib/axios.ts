// client/src/lib/axios.ts

import axios from "axios";
import { getSession, signOut } from "next-auth/react";

// تشخیص محیط اجرا (آیا روی سرور هستیم؟)
const isServer = typeof window === "undefined";

// انتخاب هوشمندانه آدرس API
export const API_BASE_URL = isServer
  ? process.env.API_BASE_URL_SERVER || "http://server:3001/api" // آدرس داخلی داکر (برای SSR)
  : process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api"; // آدرس عمومی (برای مرورگر)

// اینستنس عمومی (بدون توکن)
export const axiosPublic = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// اینستنس احراز هویت شده (با توکن)
const axiosAuth = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 1. رهگیر درخواست (Request Interceptor)
axiosAuth.interceptors.request.use(
  async (config) => {
    // فقط در سمت کلاینت (مرورگر) توکن را از سشن می‌خوانیم
    if (!isServer) {
      const session = await getSession();
      // @ts-ignore
      if (session?.accessToken) {
        // @ts-ignore
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. رهگیر پاسخ (Response Interceptor)
axiosAuth.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // مدیریت خطای 401 فقط در سمت کلاینت مجاز است
    // چون signOut روی سرور باعث کرش می‌شود
    if (!isServer) {
      const session = await getSession();
      if (
        error.response &&
        error.response.status === 401 &&
        session?.error === "RefreshAccessTokenError"
      ) {
        await signOut({ callbackUrl: "/" });
      }
    }
    return Promise.reject(error);
  }
);

export default axiosAuth;
