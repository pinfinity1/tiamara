import { Response, Request } from "express";
import { prisma } from "../server";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// Helper function to log stock changes, we'll need it here too
const logStockChange = async (
  productId: string,
  change: number,
  newStock: number,
  type: "INITIAL" | "SALE" | "RETURN" | "PURCHASE" | "ADJUSTMENT" | "DAMAGE",
  userId: string | null,
  notes?: string
) => {
  if (change !== 0) {
    await prisma.stockHistory.create({
      data: {
        productId,
        change,
        newStock,
        type,
        notes: notes || `${type} action`,
        userId: userId || undefined,
      },
    });
  }
};

// Create a new Purchase Order
export const createPurchaseOrder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { supplierId, expectedDate, notes, items, totalAmount } = req.body;

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: "Supplier and at least one item are required.",
      });
      return;
    }

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        supplierId,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        notes,
        totalAmount: parseFloat(totalAmount),
        items: {
          create: items.map(
            (item: {
              productId: string;
              quantity: number;
              unitPrice: number;
            }) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })
          ),
        },
      },
    });
    res.status(201).json({ success: true, purchaseOrder });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create purchase order." });
  }
};

// Get all Purchase Orders
export const getAllPurchaseOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      orderBy: { orderDate: "desc" },
      include: {
        supplier: true,
        items: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
      },
    });
    res.status(200).json({ success: true, purchaseOrders });
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch purchase orders." });
  }
};

// Update a Purchase Order Status (e.g., to RECEIVED)
export const updatePurchaseOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.userId;

    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      res
        .status(404)
        .json({ success: false, message: "Purchase order not found." });
      return;
    }

    // --- Critical Logic: Update stock when order is received ---
    if (status === "RECEIVED" && order.status !== "RECEIVED") {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          const updatedProduct = await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });

          // Log this change in stock history
          await logStockChange(
            item.productId,
            item.quantity,
            updatedProduct.stock,
            "PURCHASE",
            userId || null,
            `Received from purchase order ${order.id}`
          );
        }

        // Finally, update the order status
        const updatedOrder = await tx.purchaseOrder.update({
          where: { id },
          data: { status },
        });

        res.status(200).json({ success: true, purchaseOrder: updatedOrder });
      });
    } else {
      // If status is not 'RECEIVED', just update the status
      const updatedOrder = await prisma.purchaseOrder.update({
        where: { id },
        data: { status },
      });
      res.status(200).json({ success: true, purchaseOrder: updatedOrder });
    }
  } catch (error) {
    console.error("Error updating purchase order status:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update status." });
  }
};
