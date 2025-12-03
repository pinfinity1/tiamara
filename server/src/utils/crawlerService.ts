import puppeteer from "puppeteer";

const extractUrlsFromDeepJson = (obj: any, foundUrls: Set<string>) => {
  if (!obj) return;

  if (typeof obj === "string") {
    if (
      (obj.includes(".jpg") ||
        obj.includes(".jpeg") ||
        obj.includes(".png") ||
        obj.includes(".webp")) &&
      obj.startsWith("http") &&
      !obj.includes("svg") &&
      !obj.includes("icon") &&
      !obj.includes("thumb") &&
      !obj.includes("avatar") &&
      !obj.includes("logo") &&
      !obj.includes("loader")
    ) {
      foundUrls.add(obj);
    }
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item) => extractUrlsFromDeepJson(item, foundUrls));
    return;
  }

  if (typeof obj === "object") {
    Object.values(obj).forEach((value) =>
      extractUrlsFromDeepJson(value, foundUrls)
    );
  }
};

export const scrapeDataFromUrl = async (url: string) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
        // فلگ‌های اضافی برای مخفی کردن اتوماسیون
        "--disable-blink-features=AutomationControlled",
      ],
    });

    const page = await browser.newPage();

    // ✅ تکنیک ۱: بلاک کردن منابع سنگین و غیرضروری
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      // ما فقط Document (HTML) و Script (برای JSONها) را می‌خواهیم
      // عکس، فونت، استایل و مدیا را بلاک می‌کنیم تا سرعت بالا برود
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // ✅ تکنیک ۲: کاهش حساسیت لودینگ
    // به جای اینکه منتظر بمانیم همه چیز تمام شود (networkidle2)،
    // فقط منتظر می‌مانیم تا ساختار صفحه لود شود (domcontentloaded)
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // کمی صبر برای اینکه اسکریپت‌های JS اجرا شوند (مثلاً ۲ ثانیه)
    // این کار برای سایت‌های CSR (مثل Cult Beauty) حیاتی است ولی خیلی کمتر از ۶۰ ثانیه طول می‌کشد
    // @ts-ignore
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const pageData = await page.evaluate(() => {
      // پاکسازی المان‌های مزاحم
      const scriptsToRemove = document.querySelectorAll(
        "style, nav, footer, header, iframe, noscript, svg, button"
      );
      scriptsToRemove.forEach((s) => s.remove());

      const rawText = document.body.innerText
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 15000);

      const title =
        document.querySelector("h1")?.textContent?.trim() ||
        document
          .querySelector('meta[property="og:title"]')
          ?.getAttribute("content") ||
        document.title ||
        "Unknown Product";

      const scriptContents: string[] = [];
      document.querySelectorAll("script").forEach((s) => {
        // جمع‌آوری تمام اسکریپت‌های حاوی دیتا
        if (
          s.getAttribute("type") === "application/ld+json" ||
          s.id === "__NEXT_DATA__" ||
          s.innerHTML.includes("__INITIAL_STATE__") ||
          s.innerHTML.includes("digitalData") ||
          s.innerHTML.includes("product") // هر اسکریپتی که کلمه product دارد
        ) {
          scriptContents.push(s.innerHTML);
        }
      });

      const imgSources: string[] = [];
      document.querySelectorAll("img").forEach((img: any) => {
        if (img.src) imgSources.push(img.src);
        if (img.dataset && img.dataset.src) imgSources.push(img.dataset.src);
        if (img.dataset && img.dataset.highRes)
          imgSources.push(img.dataset.highRes);
        if (img.dataset && img.dataset.zoomImage)
          imgSources.push(img.dataset.zoomImage);
      });

      return { title, rawText, scriptContents, imgSources };
    });

    const imagesToCheck = new Set<string>();

    pageData.scriptContents.forEach((content) => {
      try {
        const json = JSON.parse(content);
        extractUrlsFromDeepJson(json, imagesToCheck);
      } catch (e) {
        const urlMatches = content.match(
          /https?:\/\/[^"'\s]+\.(jpg|jpeg|png|webp)/g
        );
        if (urlMatches) {
          urlMatches.forEach((u) => imagesToCheck.add(u));
        }
      }
    });

    pageData.imgSources.forEach((src) => {
      if (
        src.startsWith("http") &&
        !src.includes("svg") &&
        !src.includes("icon")
      ) {
        imagesToCheck.add(src);
      }
    });

    await browser.close();

    let finalImages = Array.from(imagesToCheck);

    // فیلتر کردن عکس‌های خیلی کوچک یا بی‌کیفیت (Cult Beauty معمولاً عکس‌های باکیفیتش کلمه large یا zoom دارد)
    finalImages.sort((a, b) => {
      const keywords = ["large", "zoom", "1000", "1500", "hero", "main"];
      const scoreA = keywords.reduce(
        (acc, kw) => acc + (a.toLowerCase().includes(kw) ? 1 : 0),
        0
      );
      const scoreB = keywords.reduce(
        (acc, kw) => acc + (b.toLowerCase().includes(kw) ? 1 : 0),
        0
      );
      return scoreB - scoreA;
    });

    if (finalImages.length > 30) {
      finalImages = finalImages.slice(0, 30);
    }

    return {
      title: pageData.title,
      rawText: pageData.rawText,
      images: finalImages,
    };
  } catch (error) {
    if (browser) await browser.close();
    console.error("Puppeteer Scraper Error:", error);
    throw new Error("Failed to scrape URL (Anti-bot or Timeout).");
  }
};
