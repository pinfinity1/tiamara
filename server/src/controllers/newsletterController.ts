import { Request, Response } from "express";
import { prisma } from "../server";

export const subscribeToNewsletter = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "ایمیل الزامی است." });
  }

  try {
    const existingSubscription = await prisma.newsletterSubscription.findUnique(
      {
        where: { email },
      }
    );

    if (existingSubscription) {
      return res
        .status(409)
        .json({ message: "این ایمیل قبلاً در خبرنامه عضو شده است." });
    }

    await prisma.newsletterSubscription.create({
      data: { email },
    });

    return res
      .status(201)
      .json({ message: "عضویت شما در خبرنامه با موفقیت انجام شد." });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return res.status(500).json({ message: "خطایی در سرور رخ داد." });
  }
};
