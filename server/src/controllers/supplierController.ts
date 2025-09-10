import { Response, Request } from "express";
import { prisma } from "../server";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// Create a new Supplier
export const createSupplier = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, contactPerson, phone, email, address } = req.body;
    if (!name) {
      res
        .status(400)
        .json({ success: false, message: "Supplier name is required." });
      return;
    }
    const supplier = await prisma.supplier.create({
      data: { name, contactPerson, phone, email, address },
    });
    res.status(201).json({ success: true, supplier });
  } catch (error) {
    console.error("Error creating supplier:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create supplier." });
  }
};

// Get all Suppliers
export const getAllSuppliers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
    });
    res.status(200).json({ success: true, suppliers });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch suppliers." });
  }
};

// Update a Supplier
export const updateSupplier = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, contactPerson, phone, email, address } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id },
      data: { name, contactPerson, phone, email, address },
    });
    res.status(200).json({ success: true, supplier });
  } catch (error) {
    console.error("Error updating supplier:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update supplier." });
  }
};

// Delete a Supplier
export const deleteSupplier = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const purchaseOrders = await prisma.purchaseOrder.count({
      where: { supplierId: id },
    });
    if (purchaseOrders > 0) {
      res.status(400).json({
        success: false,
        message: "Cannot delete supplier with active purchase orders.",
      });
      return;
    }
    await prisma.supplier.delete({ where: { id } });
    res
      .status(200)
      .json({ success: true, message: "Supplier deleted successfully." });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete supplier." });
  }
};
