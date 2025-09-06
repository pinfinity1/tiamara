import NextAuth, { DefaultSession, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { axiosPublic } from "./lib/axios";

declare module "next-auth" {
  interface User {
    role?: string;
    requiresPasswordSetup?: boolean;
  }
  interface Session {
    accessToken?: string;
    user?: {
      role?: string;
      requiresPasswordSetup?: boolean;
    } & DefaultSession["user"];
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
          //Scenario 1 : login with password
          if (loginType === "password") {
            if (!password) throw new Error("Password is required.");
            response = await axiosPublic.post(`/auth/login-password`, {
              phone,
              password,
            });
          }
          //Scenario 2 : login with otp
          else if (loginType === "otp") {
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
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
        // @ts-ignore
        token.phone = user.phone;

        if (user.requiresPasswordSetup !== undefined) {
          token.requiresPasswordSetup = user.requiresPasswordSetup;
        }
        // @ts-ignore
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.role = token.role;
        // @ts-ignore
        session.user.phone = token.phone;

        if (token.requiresPasswordSetup !== undefined) {
          session.user.requiresPasswordSetup =
            token.requiresPasswordSetup as boolean;
        }
        // @ts-ignore
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  // Use the correct variable name here
  secret: process.env.AUTH_SECRET,
});
