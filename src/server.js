const express = require("express");
const dotenv = require("dotenv");

const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ whitelist origin
const allowedOrigins = [
  "http://localhost:8100", // ionic dev
  "http://localhost:5173", // vite dev (optional)
  "https://app.basrenghosting.biz.id",
];

// ✅ config CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // allow non-browser (Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// 🔥 PENTING: handle preflight
app.options("*", cors());

app.use(express.json({ limit: "50mb" }));

dotenv.config();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
const receiptRoutes = require("./routes/receipt");
app.use("/api", receiptRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Receipt Service running on port ${PORT}`);
});
