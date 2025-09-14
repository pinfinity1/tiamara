import NextAuth, { DefaultSession, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { axiosPublic } from "./lib/axios";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
    phone?: string;
    requiresPasswordSetup?: boolean;
    accessToken?: string;
  }
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      role?: string;
      phone?: string;
      requiresPasswordSetup?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    phone?: string;
    requiresPasswordSetup?: boolean;
    accessToken?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
        loginType: { label: "Login Type", type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        const { phone, password, otp, loginType } = credentials;

        if (!phone) {
          throw new Error("Phone number is required.");
        }

        try {
          let response;
          if (loginType === "password") {
            if (!password) throw new Error("Password is required.");
            response = await axiosPublic.post(`/auth/login-password`, {
              phone,
              password,
            });
          } else if (loginType === "otp") {
            if (!otp) throw new Error("OTP is required.");
            response = await axiosPublic.post(`/auth/login-otp`, {
              phone,
              otp,
            });
          } else {
            return null;
          }

          if (response.data && response.data.success) {
            const user = response.data.user;
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              phone: user.phone,
              requiresPasswordSetup: user.requiresPasswordSetup,
              accessToken: response.data.accessToken,
            } as User;
          } else {
            throw new Error(response.data.error || "Authentication failed.");
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.error ||
            error.message ||
            "An unexpected error occurred.";
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // در اولین ورود، user آبجکت را به توکن اضافه می‌کنیم
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.requiresPasswordSetup = user.requiresPasswordSetup;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      // اطلاعات را از توکن به session منتقل می‌کنیم
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phone = token.phone;
        if (token.requiresPasswordSetup !== undefined) {
          session.user.requiresPasswordSetup = token.requiresPasswordSetup;
        }
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.AUTH_SECRET,
});
