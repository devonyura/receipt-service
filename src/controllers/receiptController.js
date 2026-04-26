const { renderHtmlToPng } = require("../utils/htmlToPng");
const fs = require("fs");
const path = require("path");

exports.generateReceipt = async (req, res) => {
  try {
    const { transactions, transaction_details } = req.body;

    // Validasi bentuk data
    if (!transactions || !transaction_details) {
      return res
        .status(400)
        .json({ error: "transactions & transactions_details wajib ada" });
    }

    // TRANSFORM DATA -> HTML FRIENDLY
    const mappedData = mapTransactionToTemplate(
      transactions,
      transaction_details,
    );

    // Render HTML dari template
    const htmlContent = renderTemplate(mappedData);

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

// Helper:map transaction to template
function mapTransactionToTemplate(trx, details) {
  // FOrmat tanggal
  const date = new Date(trx.date_time).toLocaleString("id-ID");

  // Format currency
  const formatRupiah = (val) => {
    return "Rp " + Number(val).toLocaleString("id-ID");
  };

  // Build items HTML
  const itemsHtml = details
    .map(
      (item) => `
  <tr>
    <td class="col-name" colspan="4">
      ${formatProductName(item.product_name, item.weight_grams)}
    </td>
  </tr>
  <tr>
    <td></td>
    <td class="col-qty">${item.quantity}x</td>
    <td class="col-price">${formatRupiah(item.price)}</td>
    <td class="col-total">${formatRupiah(item.subtotal)}</td>
  </tr>
`,
    )
    .join("");

  let customerSection = "";

  if (trx.is_online_order === "1") {
    customerSection = `
    <div class="line"></div>
    <div class="section-title">PEMESAN</div>
    <table>
      <tr>
        <td>Nama</td>
        <td class="right">${trx.customer_name || "-"}</td>
      </tr>
      <tr>
        <td>HP</td>
        <td class="right">${trx.customer_phone || "-"}</td>
      </tr>
      <tr>
        <td colspan="2">Alamat:</td>
      </tr>
      <tr>
        <td colspan="2">${trx.customer_address || "-"}</td>
      </tr>
      <tr>
        <td colspan="2">Catatan:</td>
      </tr>
      <tr>
        <td colspan="2">${trx.notes || "-"}</td>
      </tr>
    </table>
  `;
  }
  const logoBase64 =
    "data:image/png;base64,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";
  return {
    storeAddress: `${trx.branch_address}`,
    date,
    itemsHtml,
    total: formatRupiah(trx.total_price),
    cash: formatRupiah(trx.cash_amount),
    change: formatRupiah(trx.change_amount),
    paymentMethod: trx.payment_method,
    transactionCode: trx.transaction_code,
    cashier: trx.username,
    customerSection,
    logo: logoBase64,
  };
}

// Helper: Render template dengan data
function renderTemplate(data) {
  const template = fs.readFileSync(
    path.join(__dirname, "../templates/receipt.html"),
    "utf-8",
  );

  // Replace placeholder dengan data
  let html = template;

  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    html = html.replace(regex, data[key] ?? "");
  });

  return html;
}

function formatProductName(name, quantity) {
  const formattedWeight = formatWeight(quantity);

  if (!formattedWeight) {
    return name;
  }

  return `${name} (${formattedWeight})`;
}

function formatWeight(quantity) {
  if (quantity === undefined || quantity === null || quantity === "") {
    return null;
  }

  const grams = Number(quantity);

  if (isNaN(grams) || grams <= 0) {
    return null;
  }

  // ✅ Convert ke KG jika >= 1000 gr
  if (grams >= 1000) {
    const kg = grams / 1000;

    // hilangkan .0 jika bulat
    return `${Number.isInteger(kg) ? kg : kg.toFixed(2)}kg`;
  }

  return `${grams}gr`;
}
