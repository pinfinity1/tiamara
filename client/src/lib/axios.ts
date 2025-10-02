import axios from "axios";
import { getSession, signOut } from "next-auth/react";

export const API_BASE_URL = "http://localhost:3001/api";

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

axiosAuth.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const session = await getSession();

    if (
      error.response &&
      error.response.status === 401 &&
      session?.error === "RefreshAccessTokenError"
    ) {
      await signOut({ callbackUrl: "/" });
    }

    return Promise.reject(error);
  }
);

export default axiosAuth;
