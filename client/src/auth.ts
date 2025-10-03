import NextAuth, { DefaultSession, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { axiosPublic } from "./lib/axios";
import { cookies } from "next/headers";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
    phone?: string;
    requiresPasswordSetup?: boolean;
    accessToken?: string;
    refreshToken?: string;
  }
  interface Session {
    accessToken?: string;
    error?: "RefreshAccessTokenError";
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
    refreshToken?: string;
    accessTokenExpires: number;
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
        const cartId = (await cookies()).get("cartId")?.value;
        const { phone, password, otp, loginType } = credentials;

        if (!phone) {
          throw new Error("Phone number is required.");
        }

        try {
          let response;
          const cookieHeader = cartId ? { Cookie: `cartId=${cartId}` } : {};
          if (loginType === "password") {
            if (!password) throw new Error("Password is required.");
            response = await axiosPublic.post(
              `/auth/login-password`,
              {
                phone,
                password,
              },
              { headers: cookieHeader }
            );
          } else if (loginType === "otp") {
            if (!otp) throw new Error("OTP is required.");
            response = await axiosPublic.post(
              `/auth/login-otp`,
              {
                phone,
                otp,
              },
              { headers: cookieHeader }
            );
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
              refreshToken: response.data.refreshToken,
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
    async jwt({ token, user, account }) {
      if (account && user) {
        console.log("✅ Login response user:", user);

        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;

        console.log("✅ Stored RefreshToken in JWT:", token.refreshToken);

        token.accessTokenExpires = Date.now() + 15 * 60 * 1000;
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.requiresPasswordSetup = user.requiresPasswordSetup;
        return token;
      }

      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      console.log("♻️ Refreshing token with:", token.refreshToken);

      try {
        const response = await axiosPublic.post("/auth/refresh-token", {
          token: token.refreshToken,
        });
        console.log("✅ Refresh response:", response.data);

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        return {
          ...token,
          accessToken: accessToken,
          accessTokenExpires: Date.now() + 15 * 60 * 1000,
          refreshToken: newRefreshToken || token.refreshToken,
        };
      } catch (error) {
        console.error("RefreshAccessTokenError", error);
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phone = token.phone;
        if (token.requiresPasswordSetup !== undefined) {
          session.user.requiresPasswordSetup = token.requiresPasswordSetup;
        }
      }
      session.accessToken = token.accessToken;
      session.error = token.error as "RefreshAccessTokenError" | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.AUTH_SECRET,
});
