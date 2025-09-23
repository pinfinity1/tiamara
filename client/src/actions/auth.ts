"use server";
import {
  protectLoginRules,
  protectSignupRules,
  protectPhoneAuth,
} from "@/arcjet";
import { request } from "@arcjet/next";

// ++ ADDED: A new server action to protect phone-based requests
export const protectPhoneAuthAction = async (phone: string) => {
  const req = await request();
  // Pass the phone number as a characteristic for rate limiting
  const decision = await protectPhoneAuth.protect(req, { phone });

  if (decision.isDenied()) {
    if (decision.reason.isBot()) {
      return {
        error: "فعالیت ربات تشخیص داده شد.",
        success: false,
        status: 403,
      };
    }
    if (decision.reason.isRateLimit()) {
      return {
        error: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً بعداً تلاش کنید.",
        success: false,
        status: 429,
      };
    }
  }

  return { success: true };
};

export const protectSignUpAction = async (email: string) => {
  const req = await request();
  const decision = await protectSignupRules.protect(req, { email });

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      const emailTypes = decision.reason.emailTypes;
      if (emailTypes.includes("DISPOSABLE")) {
        return {
          error: "Disposable email address are not allowed",
          success: false,
          status: 403,
        };
      } else if (emailTypes.includes("INVALID")) {
        return {
          error: "Invalid email",
          success: false,
          status: 403,
        };
      } else if (emailTypes.includes("NO_MX_RECORDS")) {
        return {
          error:
            "Email domain does not have valid MX Records! Please try with different email",
          success: false,
          status: 403,
        };
      }
    } else if (decision.reason.isBot()) {
      return {
        error: "Bot activity detected",
        success: false,
        status: 403,
      };
    } else if (decision.reason.isRateLimit()) {
      return {
        error: "Too many requests! Please try again later",
        success: false,
        status: 403,
      };
    }
  }

  return {
    success: true,
  };
};

export const protectSignInAction = async (email: string) => {
  const req = await request();
  const decision = await protectLoginRules.protect(req, { email });

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      const emailTypes = decision.reason.emailTypes;
      if (emailTypes.includes("DISPOSABLE")) {
        return {
          error: "Disposable email address are not allowed",
          success: false,
          status: 403,
        };
      } else if (emailTypes.includes("INVALID")) {
        return {
          error: "Invalid email",
          success: false,
          status: 403,
        };
      } else if (emailTypes.includes("NO_MX_RECORDS")) {
        return {
          error:
            "Email domain does not have valid MX Records! Please try with different email",
          success: false,
          status: 403,
        };
      }
    } else if (decision.reason.isRateLimit()) {
      return {
        error: "Too many requests! Please try again later",
        success: false,
        status: 403,
      };
    }
  }

  return {
    success: true,
  };
};
