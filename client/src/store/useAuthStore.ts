import { API_ROUTES } from "@/utils/api";
import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "SUPER_ADMIN";
};

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<string | null>;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

const axiosInstance = axios.create({
  baseURL: API_ROUTES.AUTH,
  withCredentials: true,
});

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/register", {
            name,
            email,
            password,
          });

          set({ isLoading: false });
          return response.data.userId;
        } catch (error) {
          set({
            isLoading: false,
            error: axios.isAxiosError(error)
              ? error?.response?.data?.error || "Registration failed"
              : "Registration failed",
          });

          return null;
        }
      },
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/login", {
            email,
            password,
          });

          set({
            isLoading: false,
            user: response.data.user,
            isAuthenticated: true,
          });
          return response.data.user;
        } catch (error) {
          set({
            isLoading: false,
            isAuthenticated: false,
            error: axios.isAxiosError(error)
              ? error?.response?.data?.error || "Login failed"
              : "Login failed",
          });
          return null;
        }
      },
      logout: async () => {
        try {
          await axiosInstance.post("/logout");
        } catch (error) {
          console.error("Server logout failed, clearing client state.", error);
        } finally {
          set({ user: null, isAuthenticated: false });
        }
      },
      checkAuth: async () => {
        try {
          await axiosInstance.post("/refresh-token");
          set({ isAuthenticated: true });
        } catch (e) {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
