// server/src/controllers/aiController.ts

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";

export const handleChat = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { message } = req.body;

    if (!message) {
      res
        .status(400)
        .json({ success: false, message: "پیام کاربر نمی‌تواند خالی باشد." });
      return;
    }

    const keywords = message.split(" ");
    const products = await prisma.product.findMany({
      where: {
        OR: keywords.map((keyword: string) => ({
          // <--- نوع 'string' در اینجا اضافه شد
          OR: [
            { name: { contains: keyword, mode: "insensitive" } },
            { description: { contains: keyword, mode: "insensitive" } },
          ],
        })),
      },
      take: 3,
    });

    let reply = "";
    if (products.length > 0) {
      const productNames = products.map((p) => `- ${p.name}`).join("\n");
      reply = `بر اساس صحبت شما، چند محصول مرتبط پیدا کردم:\n\n${productNames}\n\nمی‌توانم اطلاعات بیشتری در مورد هر کدام بدهم.`;
    } else {
      reply =
        "متاسفانه محصولی که دقیقاً با درخواست شما مطابقت داشته باشد پیدا نکردم. می‌توانید سوال خود را به شکل دیگری بپرسید؟";
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("Error in AI chat handler:", error);
    res.status(500).json({ success: false, message: "خطایی در سرور رخ داد." });
  }
};
