const express = require("express");
const receiptController = require("../controllers/receiptController");

const router = express.Router();

router.post("/generate-receipt", receiptController.generateReceipt);

module.exports = router;
