"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { Product } from "@/store/useProductStore";

interface Props {
  products: Product[];
  isLoading: boolean;
  activeTab: "active" | "archived";
  onEdit: (product: Product) => void;
  onArchive: (product: Product) => void;
  onDelete: (product: Product) => void;
  onRestore: (id: string) => void;
  onSort: (key: string) => void;
}

export default function ProductListTable({
  products,
  isLoading,
  activeTab,
  onEdit,
  onArchive,
  onDelete,
  onRestore,
  onSort,
}: Props) {
  return (
    <div className="border rounded-xl overflow-hidden bg-white shadow-sm relative min-h-[400px]">
      {/* لودینگ به صورت Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center backdrop-blur-[1px]">
          <div className="bg-white px-4 py-2 rounded-full shadow-lg border flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-gray-600">
              در حال بروزرسانی لیست...
            </span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[80px]">تصویر</TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary transition-colors"
                onClick={() => onSort("name")}
              >
                نام محصول
              </TableHead>
              <TableHead>برند</TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary transition-colors"
                onClick={() => onSort("stock")}
              >
                موجودی
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary transition-colors"
                onClick={() => onSort("price")}
              >
                قیمت
              </TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  {activeTab === "active"
                    ? "هیچ محصول فعالی وجود ندارد."
                    : "سطل زباله خالی است."}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow
                  key={product.id}
                  className={`hover:bg-gray-50/50 ${
                    activeTab === "archived" ? "bg-red-50/30" : ""
                  }`}
                >
                  <TableCell>
                    <div className="relative w-10 h-10 rounded-md overflow-hidden border bg-gray-100">
                      <Image
                        src={
                          product.images?.[0]?.url || "/images/placeholder.png"
                        }
                        alt={product.name}
                        fill
                        className={`object-cover ${
                          activeTab === "archived" ? "grayscale" : ""
                        }`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="font-medium truncate" title={product.name}>
                      {product.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 truncate font-sans">
                        {product.sku}
                      </span>
                      {activeTab === "archived" && (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-red-500 border-red-200 bg-red-50 h-5 px-1"
                        >
                          آرشیو شده
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-normal text-gray-500"
                    >
                      {product.brand?.name || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.stock === 0 ? (
                      <Badge variant="destructive">ناموجود</Badge>
                    ) : product.stock <= 10 ? (
                      <Badge className="bg-amber-500 hover:bg-amber-600">
                        کمبود
                      </Badge>
                    ) : (
                      <Badge variant="secondary">{product.stock} عدد</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {product.price.toLocaleString("fa-IR")}
                      </span>
                      <span className="text-[10px] text-gray-400">تومان</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    {activeTab === "active" ? (
                      // ✅✅✅ تغییر اصلی اینجاست: modal={false} ✅✅✅
                      // این باعث می‌شود دراپ‌داون صفحه را قفل نکند
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>عملیات محصول</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onEdit(product)}>
                            <Pencil className="ml-2 h-4 w-4 text-blue-600" />
                            ویرایش اطلاعات
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-orange-600 focus:text-orange-700 focus:bg-orange-50 cursor-pointer"
                            onClick={() => onArchive(product)}
                          >
                            <Trash2 className="ml-2 h-4 w-4" />
                            انتقال به سطل زباله
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50 h-8 text-xs px-2"
                          onClick={() => onRestore(product.id)}
                        >
                          <RotateCcw className="w-3.5 h-3.5 ml-1" />
                          بازیابی
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 text-xs px-2"
                          onClick={() => onDelete(product)}
                        >
                          <Trash2 className="w-3.5 h-3.5 ml-1" />
                          حذف دائم
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
