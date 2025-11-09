// project/server/src/utils/smsService.ts
import axios from "axios"; // استفاده از axios که از قبل در پروژه بود

const API_KEY = process.env.SMS_IR_API_KEY;
const TEMPLATE_ID = process.env.SMS_IR_TEMPLATE_ID; // شناسه الگو از .env

// ۲. ساخت یک نمونه axios برای sms.ir
// !! تصحیح شد: baseURL و هدر بر اساس مستندات دقیق شما !!
const smsClient = axios.create({
  baseURL: "https://api.sms.ir/v1", // آدرس پایه صحیح API
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json", // مستندات شما text/plain گفته بود، اما JSON امن‌تر است
    "x-api-key": API_KEY, // !! تصحیح شد: هدر با x کوچک !!
  },
});

/**
 * ارسال یک کد OTP از پیش ساخته شده با sms.ir REST API
 * @param phoneNumber شماره موبایل (با 0)
 * @param code کدی که خودمان ساخته‌ایم
 */
export const sendManualOtp = async (phoneNumber: string, code: string) => {
  const receptor = phoneNumber.startsWith("0")
    ? phoneNumber
    : `0${phoneNumber}`;

  // --- منطق Production در برابر Development ---
  if (process.env.NODE_ENV !== "production") {
    // --- حالت پروداکشن: ارسال پیامک واقعی ---
    if (!API_KEY || !TEMPLATE_ID) {
      console.error(
        "CRITICAL: SMS.IR_API_KEY or SMS_IR_TEMPLATE_ID is not configured in .env."
      );
      throw new Error("SMS service configuration error.");
    }

    try {
      // !! تصحیح شد: body با حروف کوچک بر اساس مستندات !!
      const body = {
        mobile: receptor,
        templateId: Number(TEMPLATE_ID),
        parameters: [
          {
            name: "Code", // این نام باید با نام پارامتر در الگوی شما یکی باشد
            value: code,
          },
        ],
      };

      // !! تصحیح شد: آدرس endpoint بر اساس مستندات !!
      const response = await smsClient.post("/send/verify", body);

      console.log(
        `[Production] SMS.IR Sent: Status ${response.data.status} to ${receptor}`
      );
      // بر اساس مستندات شما، status: 1 به معنای موفقیت است
      if (response.data.status === 1) {
        return response.data.data.messageId; // بازگرداندن MessageId
      } else {
        throw new Error(`SMS.IR Error: ${response.data.message}`);
      }
    } catch (error: any) {
      console.error(
        `[Production] Failed to send SMS via SMS.IR to ${receptor}:`,
        error.response?.data || error.message
      );
      throw new Error("SMS sending failed.");
    }
  } else {
    // --- حالت توسعه: فقط لاگ در کنسول ---
    console.log("=================================================");
    console.log(
      `[DEVELOPMENT MODE] SMS to ${receptor}: TemplateID: ${TEMPLATE_ID}, Code: ${code}`
    );
    console.log("=================================================");
    return `dev-message-id-${Date.now()}`;
  }
};
