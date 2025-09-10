import { Response, Request } from "express";
import { prisma } from "../server";

// Get all Stock History records, optionally filtered by productId
export const getStockHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;

    const whereClause = productId ? { productId: productId } : {};

    const history = await prisma.stockHistory.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { name: true },
        },
        user: {
          select: { name: true },
        },
      },
    });

    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error("Error fetching stock history:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch stock history." });
  }
};
