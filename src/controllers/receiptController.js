const { renderHtmlToPng } = require("../utils/htmlToPng");
const fs = require("fs");
const path = require("path");

exports.generateReceipt = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: "Data struk diperlukan" });
    }

    // Render HTML dari template
    const htmlContent = renderTemplate(data);

    // Convert HTML ke PNG
    const pngBuffer = await renderHtmlToPng(htmlContent);

    // Option 1: Return Base64
    const base64 = pngBuffer.toString("base64");

    res.json({
      success: true,
      data: {
        base64: `data:image/png;base64,${base64}`,
        // Atau return URL jika disimpan di storage
      },
    });
  } catch (error) {
    console.error("Error generating receipt:", error);
    res.status(500).json({ error: error.message });
  }
};

// Helper: Render template dengan data
function renderTemplate(data) {
  const template = fs.readFileSync(
    path.join(__dirname, "../templates/receipt.html"),
    "utf-8",
  );

  // Replace placeholder dengan data
  let html = template;
  Object.keys(data).forEach((key) => {
    html = html.replace(`{{${key}}}`, data[key] || "");
  });

  return html;
}
