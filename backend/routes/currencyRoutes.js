import express from "express";

const router = express.Router();

// Simple in-memory cache: { "ZAR_USD": { rate: 0.054, fetchedAt: Date } }
const rateCache = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// GET /api/currency/convert?from=ZAR&to=USD&amount=1500
router.get("/convert", async (req, res) => {
  const from = (req.query.from || "ZAR").toUpperCase();
  const to = (req.query.to || "USD").toUpperCase();
  const amount = parseFloat(req.query.amount);

  if (isNaN(amount) || amount < 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  if (from === to) {
    return res.json({ from, to, rate: 1, convertedAmount: amount });
  }

  const cacheKey = `${from}_${to}`;
  const cached = rateCache[cacheKey];
  const now = Date.now();

  try {
    let rate;

    if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
      rate = cached.rate;
    } else {
      const response = await fetch(
        `https://api.frankfurter.app/latest?from=${from}&to=${to}`
      );

      if (!response.ok) {
        throw new Error(`Exchange rate API returned ${response.status}`);
      }

      const data = await response.json();

      if (!data.rates || !data.rates[to]) {
        return res.status(502).json({ error: `Rate not available for ${from} → ${to}` });
      }

      rate = data.rates[to];
      rateCache[cacheKey] = { rate, fetchedAt: now };
    }

    const convertedAmount = parseFloat((amount * rate).toFixed(2));
    res.json({ from, to, rate, convertedAmount });
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch exchange rate", details: err.message });
  }
});

export default router;
