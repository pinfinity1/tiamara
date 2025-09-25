import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";
import { PaymentStatus } from "@prisma/client";

export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      lowStockProducts,
      recentOrders,
    ] = await prisma.$transaction([
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          paymentStatus: PaymentStatus.COMPLETED,
        },
      }),

      prisma.order.count(),

      prisma.user.count({
        where: {
          role: "USER",
        },
      }),

      prisma.product.findMany({
        where: {
          stock: {
            lt: 10,
          },
        },
        orderBy: {
          stock: "asc",
        },
        take: 5,
        select: {
          id: true,
          name: true,
          stock: true,
        },
      }),

      prisma.order.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        include: {
          user: {
            select: { name: true },
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue: totalRevenue._sum.total || 0,
        totalOrders,
        totalCustomers,
        lowStockProducts,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch dashboard stats." });
  }
};
