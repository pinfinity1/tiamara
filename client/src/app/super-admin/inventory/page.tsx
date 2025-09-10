"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, PlusCircle, Trash2, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupplierStore, Supplier } from "@/store/useSupplierStore";
import {
  useStockHistoryStore,
  StockHistory,
} from "@/store/useStockHistoryStore";
import {
  usePurchaseOrderStore,
  PurchaseOrder,
} from "@/store/usePurchaseOrderStore";
import { useProductStore, Product } from "@/store/useProductStore";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const initialSupplierState = {
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
};

type PurchaseOrderItemForm = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

function InventoryPage() {
  const { toast } = useToast();

  // Stores
  const {
    suppliers,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    isLoading: isSupplierLoading,
  } = useSupplierStore();
  const {
    history,
    fetchHistory,
    isLoading: isHistoryLoading,
  } = useStockHistoryStore();
  const {
    purchaseOrders,
    fetchPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrderStatus,
    isLoading: isPoLoading,
  } = usePurchaseOrderStore();
  const { products, fetchAllProductsForAdmin } = useProductStore();

  // UI State for Suppliers
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierFormData, setSupplierFormData] =
    useState(initialSupplierState);

  // UI State for Purchase Orders
  const [isPoDialogOpen, setIsPoDialogOpen] = useState(false);
  const [poFormData, setPoFormData] = useState<{
    supplierId: string;
    expectedDate: string;
    notes: string;
  }>({ supplierId: "", expectedDate: "", notes: "" });
  const [poItems, setPoItems] = useState<PurchaseOrderItemForm[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");

  useEffect(() => {
    fetchSuppliers();
    fetchHistory();
    fetchPurchaseOrders();
    fetchAllProductsForAdmin();
  }, [
    fetchSuppliers,
    fetchHistory,
    fetchPurchaseOrders,
    fetchAllProductsForAdmin,
  ]);

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });
    setIsSupplierDialogOpen(true);
  };

  const handleAddNewSupplier = () => {
    setEditingSupplier(null);
    setSupplierFormData(initialSupplierState);
    setIsSupplierDialogOpen(true);
  };

  const handleSupplierSubmit = async () => {
    if (!supplierFormData.name) {
      toast({ title: "نام تامین‌کننده اجباری است.", variant: "destructive" });
      return;
    }

    const result = editingSupplier
      ? await updateSupplier(editingSupplier.id, supplierFormData)
      : await createSupplier(supplierFormData);

    if (result) {
      toast({
        title: `تامین‌کننده با موفقیت ${
          editingSupplier ? "ویرایش" : "ایجاد"
        } شد.`,
      });
      setIsSupplierDialogOpen(false);
    } else {
      toast({ title: "عملیات ناموفق بود.", variant: "destructive" });
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (window.confirm("آیا از حذف این تامین‌کننده مطمئن هستید؟")) {
      const success = await deleteSupplier(id);
      if (success) {
        toast({ title: "تامین‌کننده با موفقیت حذف شد." });
      } else {
        toast({ title: "خطا در حذف تامین‌کننده.", variant: "destructive" });
      }
    }
  };

  // --- Purchase Order Handlers ---
  const handleAddNewPO = () => {
    setPoFormData({ supplierId: "", expectedDate: "", notes: "" });
    setPoItems([]);
    setIsPoDialogOpen(true);
  };

  const handleAddPoItem = () => {
    const product = products.find((p) => p.id === selectedProduct);
    if (product && !poItems.some((item) => item.productId === product.id)) {
      setPoItems([
        ...poItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
        },
      ]);
    }
  };

  const handlePoItemChange = (
    productId: string,
    field: "quantity" | "unitPrice",
    value: number
  ) => {
    setPoItems(
      poItems.map((item) =>
        item.productId === productId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemovePoItem = (productId: string) => {
    setPoItems(poItems.filter((item) => item.productId !== productId));
  };

  const poTotalAmount = useMemo(() => {
    return poItems.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );
  }, [poItems]);

  const handlePoSubmit = async () => {
    if (!poFormData.supplierId || poItems.length === 0) {
      toast({
        title: "لطفا تامین‌کننده و حداقل یک محصول را انتخاب کنید.",
        variant: "destructive",
      });
      return;
    }
    const data = {
      ...poFormData,
      totalAmount: poTotalAmount,
      items: poItems.map(({ productId, quantity, unitPrice }) => ({
        productId,
        quantity,
        unitPrice,
      })),
    };

    const result = await createPurchaseOrder(data);
    if (result) {
      toast({ title: "سفارش خرید با موفقیت ایجاد شد." });
      setIsPoDialogOpen(false);
    } else {
      toast({ title: "خطا در ایجاد سفارش خرید.", variant: "destructive" });
    }
  };

  const handleUpdatePoStatus = async (
    id: string,
    status: PurchaseOrder["status"]
  ) => {
    const success = await updatePurchaseOrderStatus(id, status);
    if (success) {
      toast({ title: "وضعیت سفارش خرید با موفقیت به‌روزرسانی شد." });
      if (status === "RECEIVED") {
        await fetchHistory(); // Refresh stock history after receiving goods
      }
    } else {
      toast({ title: "خطا در به‌روزرسانی وضعیت.", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">مدیریت انبار</h1>
      <Tabs defaultValue="stock-history">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stock-history">تاریخچه موجودی</TabsTrigger>
          <TabsTrigger value="suppliers">مدیریت تامین‌کنندگان</TabsTrigger>
          <TabsTrigger value="purchase-orders">سفارشات خرید</TabsTrigger>
        </TabsList>

        {/* Stock History Tab */}
        <TabsContent value="stock-history">
          <Card>
            <CardHeader>
              <CardTitle>تاریخچه کامل تغییرات موجودی</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>محصول</TableHead>
                    <TableHead>تغییر</TableHead>
                    <TableHead>موجودی جدید</TableHead>
                    <TableHead>نوع عملیات</TableHead>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>کاربر</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isHistoryLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        در حال بارگذاری...
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.product?.name || "محصول حذف شده"}
                        </TableCell>
                        <TableCell
                          className={
                            item.change > 0
                              ? "text-green-600 font-bold"
                              : "text-red-600 font-bold"
                          }
                        >
                          {item.change > 0 ? `+${item.change}` : item.change}
                        </TableCell>
                        <TableCell>{item.newStock}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>
                          {format(new Date(item.createdAt), "yyyy/MM/dd HH:mm")}
                        </TableCell>
                        <TableCell>{item.user?.name || "سیستم"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>لیست تامین‌کنندگان</CardTitle>
              <Button onClick={handleAddNewSupplier}>
                <PlusCircle className="ml-2 h-4 w-4" /> افزودن تامین‌کننده
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نام تامین‌کننده</TableHead>
                    <TableHead>فرد مسئول</TableHead>
                    <TableHead>تلفن</TableHead>
                    <TableHead>ایمیل</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isSupplierLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        در حال بارگذاری...
                      </TableCell>
                    </TableRow>
                  ) : (
                    suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">
                          {supplier.name}
                        </TableCell>
                        <TableCell>{supplier.contactPerson}</TableCell>
                        <TableCell>{supplier.phone}</TableCell>
                        <TableCell>{supplier.email}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditSupplier(supplier)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="purchase-orders">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>سفارشات خرید از تامین‌کنندگان</CardTitle>
              <Button onClick={handleAddNewPO}>
                <PlusCircle className="ml-2 h-4 w-4" /> ایجاد سفارش خرید
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره سفارش</TableHead>
                    <TableHead>تامین‌کننده</TableHead>
                    <TableHead>تاریخ سفارش</TableHead>
                    <TableHead>مبلغ کل</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPoLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        در حال بارگذاری...
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchaseOrders.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-mono text-xs">
                          {po.id}
                        </TableCell>
                        <TableCell>{po.supplier.name}</TableCell>
                        <TableCell>
                          {format(new Date(po.orderDate), "yyyy/MM/dd")}
                        </TableCell>
                        <TableCell>
                          {po.totalAmount.toLocaleString("fa-IR")} تومان
                        </TableCell>
                        <TableCell>
                          <Badge>{po.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={po.status}
                            onValueChange={(value) =>
                              handleUpdatePoStatus(
                                po.id,
                                value as PurchaseOrder["status"]
                              )
                            }
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">در انتظار</SelectItem>
                              <SelectItem value="ORDERED">
                                سفارش داده شده
                              </SelectItem>
                              <SelectItem value="RECEIVED">
                                دریافت شده
                              </SelectItem>
                              <SelectItem value="CANCELLED">لغو شده</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for Add/Edit Supplier */}
      <Dialog
        open={isSupplierDialogOpen}
        onOpenChange={setIsSupplierDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSupplier
                ? "ویرایش تامین‌کننده"
                : "افزودن تامین‌کننده جدید"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">نام تامین‌کننده</Label>
              <Input
                id="name"
                value={supplierFormData.name}
                onChange={(e) =>
                  setSupplierFormData({
                    ...supplierFormData,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="contactPerson">فرد مسئول</Label>
              <Input
                id="contactPerson"
                value={supplierFormData.contactPerson}
                onChange={(e) =>
                  setSupplierFormData({
                    ...supplierFormData,
                    contactPerson: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="phone">تلفن</Label>
              <Input
                id="phone"
                value={supplierFormData.phone}
                onChange={(e) =>
                  setSupplierFormData({
                    ...supplierFormData,
                    phone: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                type="email"
                value={supplierFormData.email}
                onChange={(e) =>
                  setSupplierFormData({
                    ...supplierFormData,
                    email: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="address">آدرس</Label>
              <Input
                id="address"
                value={supplierFormData.address}
                onChange={(e) =>
                  setSupplierFormData({
                    ...supplierFormData,
                    address: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                انصراف
              </Button>
            </DialogClose>
            <Button onClick={handleSupplierSubmit} disabled={isSupplierLoading}>
              {isSupplierLoading ? "در حال ذخیره..." : "ذخیره"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Add Purchase Order */}
      <Dialog open={isPoDialogOpen} onOpenChange={setIsPoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>ایجاد سفارش خرید جدید</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label>تامین‌کننده</Label>
              <Select
                value={poFormData.supplierId}
                onValueChange={(v) =>
                  setPoFormData({ ...poFormData, supplierId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب تامین‌کننده" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>تاریخ تحویل مورد انتظار</Label>
              <Input
                type="date"
                value={poFormData.expectedDate}
                onChange={(e) =>
                  setPoFormData({ ...poFormData, expectedDate: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <Label>یادداشت</Label>
              <Textarea
                value={poFormData.notes}
                onChange={(e) =>
                  setPoFormData({ ...poFormData, notes: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex-1 border rounded-lg p-4 overflow-y-auto">
            <div className="flex gap-2 mb-4">
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="انتخاب محصول برای افزودن..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddPoItem}>افزودن</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>محصول</TableHead>
                  <TableHead>تعداد</TableHead>
                  <TableHead>قیمت واحد (تومان)</TableHead>
                  <TableHead>جمع</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poItems.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handlePoItemChange(
                            item.productId,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handlePoItemChange(
                            item.productId,
                            "unitPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell>
                      {(item.quantity * item.unitPrice).toLocaleString("fa-IR")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePoItem(item.productId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="text-left font-bold mt-4">
            مبلغ کل: {poTotalAmount.toLocaleString("fa-IR")} تومان
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                انصراف
              </Button>
            </DialogClose>
            <Button onClick={handlePoSubmit} disabled={isPoLoading}>
              {isPoLoading ? "در حال ایجاد..." : "ایجاد سفارش"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InventoryPage;
