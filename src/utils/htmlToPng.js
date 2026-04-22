const puppeteer = require("puppeteer");

exports.renderHtmlToPng = async (htmlContent) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set viewport untuk receipt (80mm width)
    await page.setViewport({ width: 330, height: 680 });

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const screenshot = await page.screenshot({ type: "png" });

    return screenshot;
  } finally {
    if (browser) await browser.close();
  }
};
