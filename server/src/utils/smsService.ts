// project/server/src/utils/smsService.ts
import TrezSmsClient from "trez-sms-client";

const USERNAME = process.env.TREZ_SMS_USERNAME;
const PASSWORD = process.env.TREZ_SMS_PASSWORD;

if (!USERNAME || !PASSWORD) {
  console.warn("TrezSMS credentials are not configured in .env");
}

const client = new TrezSmsClient(USERNAME, PASSWORD);

/**
 * ارسال یک کد OTP از پیش ساخته شده با TrezSMS
 * @param phoneNumber شماره موبایل کامل (مثال: 09123456789)
 * @param code کدی که خودمان ساخته‌ایم
 */
export const sendManualOtp = async (phoneNumber: string, code: string) => {
  // اطمینان از فرمت صحیح شماره
  if (!phoneNumber.startsWith("09")) {
    phoneNumber = `0${phoneNumber}`;
  }

  const message = `کد تایید شما در تیامارا: ${code}`;

  // در حالت توسعه، فقط لاگ می‌کنیم
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEV MODE] SMS to ${phoneNumber}: ${message}`);
    return `dev-message-id-${Date.now()}`;
  }

  try {
    const messageId = await client.manualSendCode(phoneNumber, message);
    console.log(`TrezSMS Sent Message ID: ${messageId}`);
    return messageId;
  } catch (error) {
    console.error("Failed to send manual SMS via Trez:", error);
    throw new Error("SMS sending failed.");
  }
};
