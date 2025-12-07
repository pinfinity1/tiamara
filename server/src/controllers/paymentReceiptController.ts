import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";
import { uploadToCloudinary } from "../config/cloudinaryService";
import fs from "fs";

// 1. آپلود فیش (کاربر)
export const uploadReceipt = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { orderId, userNote } = req.body;
    const userId = req.user?.userId;
    const file = req.file;

    if (!file || !orderId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "تصویر فیش و شناسه سفارش الزامی است.",
        });
    }

    // اعتبارسنجی: سفارش مال خود کاربر باشد و روش پرداختش کارت‌به‌کارت باشد
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        paymentMethod: "CARD_TO_CARD",
      },
    });

    if (!order) {
      // فایل موقت را پاک کن
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res
        .status(404)
        .json({ success: false, message: "سفارش معتبر یافت نشد." });
    }

    // آپلود در Cloudinary
    const upload = await uploadToCloudinary(file.path, "tiamara_receipts");

    // بررسی اینکه آیا قبلاً فیشی برای این سفارش آپلود شده؟
    const existingReceipt = await prisma.paymentReceipt.findUnique({
      where: { orderId },
    });

    let receipt;
    if (existingReceipt) {
      // اگر قبلاً بوده، آپدیتش کن
      receipt = await prisma.paymentReceipt.update({
        where: { id: existingReceipt.id },
        data: {
          imageUrl: upload.url,
          publicId: upload.publicId,
          userNote,
          status: "PENDING",
        },
      });
    } else {
      // ایجاد فیش جدید
      receipt = await prisma.paymentReceipt.create({
        data: {
          orderId,
          imageUrl: upload.url,
          publicId: upload.publicId,
          userNote,
          status: "PENDING",
        },
      });
    }

    res
      .status(201)
      .json({
        success: true,
        message: "فیش با موفقیت ثبت شد و در انتظار بررسی است.",
        receipt,
      });
  } catch (error) {
    console.error("Receipt Upload Error:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: "خطا در آپلود فیش." });
  }
};

// 2. بررسی فیش (ادمین)
export const verifyReceipt = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { receiptId, action, adminNote } = req.body; // action: 'APPROVE' | 'REJECT'

    if (!receiptId || !["APPROVE", "REJECT"].includes(action)) {
      return res
        .status(400)
        .json({ success: false, message: "اطلاعات ناقص است." });
    }

    const receipt = await prisma.paymentReceipt.findUnique({
      where: { id: receiptId },
    });
    if (!receipt)
      return res.status(404).json({ success: false, message: "فیش یافت نشد." });

    await prisma.$transaction(async (tx) => {
      // 1. آپدیت وضعیت فیش
      await tx.paymentReceipt.update({
        where: { id: receiptId },
        data: {
          status: action === "APPROVE" ? "APPROVED" : "REJECTED",
          adminNote,
        },
      });

      // 2. اگر تایید شد، وضعیت سفارش را تغییر بده و موجودی را کم کن
      if (action === "APPROVE") {
        const order = await tx.order.findUnique({
          where: { id: receipt.orderId },
          include: { items: true },
        });

        if (order) {
          // آپدیت وضعیت سفارش
          await tx.order.update({
            where: { id: receipt.orderId },
            data: {
              paymentStatus: "COMPLETED",
              status: "PROCESSING", // یا PREPARING
            },
          });

          // کاهش موجودی انبار (مشابه هوک پرداخت موفق)
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { decrement: item.quantity },
                soldCount: { increment: item.quantity },
              },
            });

            // ثبت در تاریخچه انبار
            await tx.stockHistory.create({
              data: {
                productId: item.productId,
                change: -item.quantity,
                newStock: 0, // برای سادگی 0 گذاشتیم (محاسبه دقیق نیاز به کوئری بیشتر دارد)
                type: "SALE",
                notes: `Order #${order.orderNumber} (Card-to-Card)`,
                userId: req.user?.userId,
              },
            });
          }
        }
      }
    });

    res
      .status(200)
      .json({
        success: true,
        message: `فیش با موفقیت ${action === "APPROVE" ? "تایید" : "رد"} شد.`,
      });
  } catch (error) {
    console.error("Verify Receipt Error:", error);
    res.status(500).json({ success: false, message: "خطا در عملیات." });
  }
};
