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
    await page.setViewport({ width: 380, height: 600 });

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    await page.evaluate(() => {
      document.body.style.height = "auto";
    });

    await page.addStyleTag({
      content: `
    body {
      margin: 0;
      padding: 5px;
    }
  `,
    });

    const screenshot = await page.screenshot({ type: "png", fullPage: true });

    return screenshot;
  } finally {
    if (browser) await browser.close();
  }
};
