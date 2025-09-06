import axios from "axios";
import { getSession } from "next-auth/react";
import { API_BASE_URL } from "@/utils/api";

export const axiosPublic = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const axiosAuth = axios.create({
  baseURL: API_BASE_URL,
});

axiosAuth.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    // @ts-ignore
    if (session?.accessToken) {
      // @ts-ignore
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosAuth;
