import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  Mail,
  Instagram,
  Twitter,
  Facebook,
  MessageCircle,
  Send,
} from "lucide-react";
import logo from "../../../public/images/Logo/tiamara-logo-1.png";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-700">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="col-span-2 lg:col-span-1 flex flex-col items-center text-center md:items-start md:text-right">
            <Link
              href="/"
              className="mb-4 w-[180px] mx-auto h-[60px] overflow-hidden"
            >
              <Image
                src={logo}
                alt="Tiamara Logo"
                width={180}
                height={60}
                className="object-cover w-full h-full"
              />
            </Link>
            <p className="text-sm leading-relaxed">
              تیامارا، مقصد شما برای کشف زیبایی و اصالت. ما بهترین محصولات
              آرایشی و بهداشتی را با عشق برای شما فراهم می‌کنیم.
            </p>
          </div>

          {/* بخش دسترسی سریع */}
          <div>
            <h3 className="font-bold text-lg mb-4">دسترسی سریع</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  فروشگاه
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-primary transition-colors"
                >
                  محصولات
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us"
                  className="hover:text-primary transition-colors"
                >
                  درباره ما
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="hover:text-primary transition-colors"
                >
                  تماس با ما
                </Link>
              </li>
            </ul>
          </div>

          {/* بخش خدمات مشتریان */}
          <div>
            <h3 className="font-bold text-lg mb-4">خدمات مشتریان</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
                  قوانین و مقررات
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  حریم خصوصی
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  پیگیری سفارشات
                </a>
              </li>
            </ul>
          </div>

          {/* بخش تماس با ما و شبکه‌های اجتماعی */}
          <div>
            <h3 className="font-bold text-lg mb-4">با ما در ارتباط باشید</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <p className="text-gray-600">tiamara.official@gmail.com</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                <p className="text-gray-600" dir="ltr">
                  ۰۳۸-۳۳۳۵۲۱۲۲
                </p>
              </div>
            </div>
            <div className="flex space-x-4 space-x-reverse mt-2">
              <Link
                href="https://instagram.com/tiamara.official"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-300 hover:bg-gray-200 p-1 rounded transition-all duration-150"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-primary" />
              </Link>
              <Link
                href="https://wa.me/989397155826"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-300 hover:bg-gray-200 p-1 rounded transition-all duration-150"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-primary" />
              </Link>
              {/* <Link
                href="#" // TODO: لینک تلگرام خود را اینجا قرار دهید
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-300"
                aria-label="Telegram"
              >
                <Send className="h-6 w-6" />
              </Link> */}
            </div>
          </div>
        </div>

        {/* بخش پایینی فوتر */}
        <div className="mt-10 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
          <p>
            تمامی حقوق مادی و معنوی این وب‌سایت متعلق به فروشگاه تیامارا است.
          </p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Tiamara.ir</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
