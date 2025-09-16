// server/src/controllers/aiController.ts

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";
import Groq from "groq-sdk";
import { Order } from "@prisma/client";
// 1. Import the specific type for chat messages from the Groq SDK
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type OrderWithItems = Order & {
  items: { productName: string; quantity: number }[];
};

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
}

interface HandleChatBody {
  message: string;
  messages?: ChatMessage[];
}

export const handleChat = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { message, messages: history } = req.body as HandleChatBody;
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
          skincareGoals: true,
          productPreferences: true,
        },
      });
    }

    let orderData: OrderWithItems[] | null = null;
    const orderKeywords = ["سفارش", "خرید قبلی", "وضعیت", "ارسال", "بسته"];
    const isOrderQuery = orderKeywords.some((keyword) =>
      message.includes(keyword)
    );

    if (isOrderQuery && userId) {
      orderData = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          items: {
            select: { productName: true, quantity: true },
          },
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
          ],
        })),
      },
      take: 5,
      select: {
        name: true,
        slug: true,
        description: true,
        how_to_use: true,
        skin_type: true,
        concern: true,
      },
    });

    const systemPrompt = `
      You are "Tiam", a friendly and expert AI beauty advisor for "Tiamara".

      **CRITICAL OUTPUT FORMAT**:
      You MUST respond in a valid JSON format. The JSON object must have two keys:
      1.  "response": (string) Your natural, conversational reply in Persian.
      2.  "suggestions": (string[]) An array of relevant follow-up questions.

      **CRITICAL RULES**:
      1.  **Suggestion Rule**: ONLY populate the "suggestions" array if the user's LATEST message is EXACTLY "پیشنهاد بده". In all other cases, the "suggestions" array MUST be empty ([]).
      2.  **Product Recommendation**: When recommending a product, use the tag \`[PRODUCT_RECOMMENDATION:product-slug-here]\` in the "response" string. ONLY use slugs from the provided catalog.
      3.  **Natural Persona**: NEVER list the user's profile. Use it naturally in your sentences. AVOID being repetitive or robotic.
      4.  **Order Queries**: If the user asks about an order, use the provided "Order Information".
      5.  **Safety First**: For health issues, always advise consulting a doctor.

      **User Info (Full Profile)**:
      ${userProfileData ? JSON.stringify(userProfileData) : "User is a guest."}

      **Order Information (if available)**:
      ${
        orderData && orderData.length > 0
          ? JSON.stringify(orderData)
          : "No order information."
      }

      **Relevant Products from Catalog (for context and finding slugs)**:
      ${
        products.length > 0
          ? JSON.stringify(products)
          : "No relevant products found."
      }
    `;

    const conversationMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((msg: ChatMessage) => ({
        role: (msg.sender === "user" ? "user" : "assistant") as
          | "user"
          | "assistant",
        content: msg.text,
      })),
      { role: "user", content: message },
    ];

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: conversationMessages,
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const reply =
      chatCompletion.choices[0]?.message?.content ||
      '{"response": "متاسفانه امکان پاسخگویی وجود ندارد.", "suggestions": []}';

    res.status(200).json({ success: true, reply });
  } catch (error: any) {
    console.error(
      "Error in AI chat handler (Groq):",
      error.response?.data || error.message
    );
    res.status(500).json({ success: false, message: "خطایی در سرور رخ داد." });
  }
};
