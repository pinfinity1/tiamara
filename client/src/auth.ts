import NextAuth, { User } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyOtp } from "@/lib/otp";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
        loginType: { label: "Login Type", type: "text" }, // 'otp' or 'password'
      },
      async authorize(credentials): Promise<User | null> {
        const { phone, password, otp, loginType } = credentials ?? {};

        if (typeof phone !== "string" || !phone) {
          throw new Error("Phone number is required.");
        }

        // Scenario 1: Login with Password
        if (loginType === "password") {
          if (typeof password !== "string" || !password) {
            throw new Error("Password is required.");
          }

          const user = await prisma.user.findUnique({ where: { phone } });
          if (!user || !user.password) throw new Error("Invalid credentials.");

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) throw new Error("Invalid credentials.");

          return user;
        }

        // Scenario 2: Login or Register with OTP
        if (loginType === "otp") {
          if (typeof otp !== "string" || !otp) {
            throw new Error("OTP is required.");
          }

          const isOtpValid = await verifyOtp(phone, otp);
          if (!isOtpValid) throw new Error("Invalid or expired OTP.");

          let user = await prisma.user.findUnique({ where: { phone } });

          // If user does not exist, create a new one (auto-registration)
          if (!user) {
            user = await prisma.user.create({
              data: { phone, role: "USER" },
            });
          }

          return user;
        }

        return null;
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
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
