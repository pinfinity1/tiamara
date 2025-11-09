"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import logo from "../../../../public/images/Logo/tiamara-logo.png";
import { Brand } from "@/store/useBrandStore";
import { Category } from "@/store/useCategoryStore";

interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  brands: Brand[];
  categories: Category[];
}

const MobileNav = ({
  isOpen,
  setIsOpen,
  brands,
  categories,
}: MobileNavProps) => {
  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] p-0 flex flex-col">
          <SheetHeader>
            <SheetTitle>
              <Link href="/" onClick={() => setIsOpen(false)}>
                <Image src={logo} alt="Logo" width={120} height={56} />
              </Link>
            </SheetTitle>
            <SheetDescription className="sr-only">تیامارا</SheetDescription>
          </SheetHeader>
          <nav className="flex-1 overflow-y-auto">
            <div className="p-4 flex flex-col gap-4">
              <Link
                href="/products"
                className="text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                محصولات
              </Link>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="brands">
                  <AccordionTrigger>برندها</AccordionTrigger>
                  <AccordionContent className="pr-2">
                    {brands.slice(0, 10).map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/brands/${brand.slug}`}
                        className="block py-1.5 text-gray-700 text-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        {brand.name}
                      </Link>
                    ))}
                    {brands.length > 10 && (
                      <Link
                        href="/brands"
                        className="block py-1.5 text-primary font-semibold text-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        همه برندها...
                      </Link>
                    )}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="categories">
                  <AccordionTrigger>دسته‌بندی‌ها</AccordionTrigger>
                  <AccordionContent className="pr-2">
                    {categories.slice(0, 10).map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        className="block py-1.5 text-gray-700 text-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                    {categories.length > 10 && (
                      <Link
                        href="/categories"
                        className="block py-1.5 text-primary font-semibold text-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        همه دسته‌بندی‌ها...
                      </Link>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </nav>
          <div className="p-4 mt-auto border-t">
            <p className="text-xs text-muted-foreground mb-4">
              تیامارا، مقصد شما برای کشف زیبایی و اصالت.
            </p>
            <div className="mt-4">
              <Link
                href="https://instagram.com/tiamara.official"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <Instagram className="ml-2 h-5 w-5" />
                ما را در اینستاگرام دنبال کنید
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNav;
