// server/src/controllers/aiController.ts

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const handleChat = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { message } = req.body;
    const userId = req.user?.userId;

    if (!message) {
      res
        .status(400)
        .json({ success: false, message: "پیام کاربر نمی‌تواند خالی باشد." });
      return;
    }

    let userProfileData = null;
    if (userId) {
      userProfileData = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          skinType: true,
          skinConcerns: true,
        },
      });
    }

    const keywords = message.split(/\s+/).filter((kw: string) => kw.length > 2);
    const products = await prisma.product.findMany({
      where: {
        OR: keywords.map((keyword: string) => ({
          OR: [
            { name: { contains: keyword, mode: "insensitive" } },
            { description: { contains: keyword, mode: "insensitive" } },
            { category: { name: { contains: "مکمل", mode: "insensitive" } } },
          ],
        })),
      },
      take: 5,
      select: {
        name: true,
        description: true,
        how_to_use: true,
        category: { select: { name: true } },
      },
    });

    // --- پرامپت نهایی با قوانین دقیق برای گفتگوی طبیعی ---
    const systemPrompt = `
      You are "Tiam" (Persian: تیام), a professional AI beauty advisor for "Tiamara". Your entire response must be in natural, fluent Persian.

      **Your Persona**: Act as a friendly, patient, and knowledgeable expert. Your main goal is to be helpful and build trust.

      **Core Conversation Rules**:
      1.  **Greeting Protocol**: Greet the user with "سلام" ONLY in the very first message of a brand new conversation. For all subsequent messages in an ongoing chat, continue the conversation directly. DO NOT repeat "سلام".
      2.  **Open-Ended Welcome**: Your very first message in a conversation should be simple and open: "سلام، من تیام هستم. چطور می‌تونم کمکتون کنم؟".
      3.  **Acknowledge and Answer Directly**: Always address the user's immediate question or statement first before doing anything else. If they say "من میخواستم راجب مکمل ها بدونم", your response should start with something like "حتما، با کمال میل در مورد مکمل‌ها بهتون اطلاعات میدم. دنبال چه نوع مکملی هستید یا برای چه هدفی می‌خواهید استفاده کنید؟".
      4.  **Be a Consultant, Not a Salesperson**: Never jump to conclusions or push products. Ask open-ended follow-up questions to understand the user's needs. For example, instead of listing problems, ask "برای چه منظوری به دنبال مکمل هستید؟" or "چه اطلاعاتی در مورد مکمل‌ها براتون جالب هست؟".
      5.  **Safety First**: For questions about supplements or health issues, always include a disclaimer advising consultation with a real doctor.

      **User Info (if available)**:
      ${
        userProfileData
          ? `- Skin Type: ${userProfileData.skinType || "N/A"}, Concerns: ${
              userProfileData.skinConcerns?.join(", ") || "N/A"
            }`
          : "User is a guest."
      }

      **Relevant Products from Catalog**:
      ${
        products.length > 0
          ? JSON.stringify(products)
          : "No relevant products found."
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply =
      chatCompletion.choices[0]?.message?.content ||
      "متاسفانه امکان پاسخگویی وجود ندارد.";

    res.status(200).json({ success: true, reply });
  } catch (error: any) {
    console.error(
      "Error in AI chat handler (Groq):",
      error.response?.data || error.message
    );
    res.status(500).json({ success: false, message: "خطایی در سرور رخ داد." });
  }
};
