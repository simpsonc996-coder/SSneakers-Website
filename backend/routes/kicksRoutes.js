import express from "express";
import Product from "../models/Product.js";

const router = express.Router();
const KICKSDB_BASE_URL = "https://api.kicks.dev";
const KICKSDB_SEARCH_PATH = "/v3/unified/gtin";
const KICKSDB_PRODUCT_PATH = "/v3/unified/products";

function getKicksdbHeaders() {
  const apiKey = process.env.KICKSDB_API_KEY;
  if (!apiKey) {
    throw new Error("KicksDB API key is not configured. Set KICKSDB_API_KEY in backend/.env.");
  }
  return {
    Authorization: apiKey,
    Accept: "application/json",
  };
}

function buildKicksdbSearchUrl(queryParams) {
  const url = new URL(`${KICKSDB_BASE_URL}${KICKSDB_SEARCH_PATH}`);
  const allowedParams = ["query", "identifier", "identifier_type", "sku", "source", "page", "limit", "sort"];

  allowedParams.forEach((param) => {
    if (queryParams[param]) {
      url.searchParams.set(param, queryParams[param]);
    }
  });

  if (!url.searchParams.has("limit")) {
    url.searchParams.set("limit", "20");
  }

  if (!url.searchParams.has("query") && !url.searchParams.has("identifier") && !url.searchParams.has("sku")) {
    throw new Error("Please provide at least one of query, identifier, or sku.");
  }

  return url.toString();
}

async function fetchKicksdb(url) {
  const res = await fetch(url, {
    headers: getKicksdbHeaders(),
  });

  const rawBody = await res.text();
  let data = null;
  try {
    data = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const detail = data?.detail || data?.message || data?.error || data?.title || rawBody || "KicksDB request failed";
    const error = new Error(`${res.status} ${detail}`);
    error.status = res.status;
    throw error;
  }

  return data || {};
}

async function fetchLocalFallbackProducts({ query, limit = 20 }) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const searchText = (query || "").trim();

  const mongoQuery = searchText
    ? {
        $or: [
          { name: { $regex: searchText, $options: "i" } },
          { description: { $regex: searchText, $options: "i" } },
          { brand: { $regex: searchText, $options: "i" } },
          { sku: { $regex: searchText, $options: "i" } },
        ],
      }
    : {};

  const products = await Product.find(mongoQuery).sort({ createdAt: -1 }).limit(safeLimit);

  const data = products.map((product) => ({
    variant_id: product._id.toString(),
    product_id: product._id.toString(),
    identifier: product.sku,
    identifier_type: "SKU",
    name: product.name,
    brand: product.brand,
    color: product.colors?.[0] || "",
    size: product.sizes?.[0] || "",
    image: product.images?.[0]?.url || "",
    link: `/product/${product._id}`,
    retail_price: product.price,
    price: product.price,
    sku: product.sku,
    source: "local_catalog",
    description: product.description,
  }));

  return {
    data,
    meta: {
      source: "local_catalog",
      fallback: true,
      reason: "KicksDB subscription required for unified endpoints",
    },
  };
}

// @route GET /api/kicks
// @desc Search KicksDB sneakers using query / sku / identifier
// @access Public
router.get("/", async (req, res) => {
  try {
    const url = buildKicksdbSearchUrl(req.query);
    const data = await fetchKicksdb(url);
    res.json(data);
  } catch (error) {
    const subscriptionBlocked = error.status === 403 && error.message?.toLowerCase().includes("subscription");

    if (subscriptionBlocked) {
      try {
        const fallbackData = await fetchLocalFallbackProducts({
          query: req.query.query || req.query.sku || req.query.identifier,
          limit: req.query.limit,
        });
        return res.json(fallbackData);
      } catch (fallbackError) {
        console.log("KicksDB local fallback error:", fallbackError.message);
      }
    }

    console.log("KicksDB search error:", error.message);
    res.status(error.status || 500).json({ message: error.message });
  }
});

// @route GET /api/kicks/:identifier
// @desc Get detailed KicksDB sneaker metadata by product identifier
// @access Public
router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    if (!identifier) {
      return res.status(400).json({ message: "Missing identifier parameter." });
    }

    const url = new URL(`${KICKSDB_BASE_URL}${KICKSDB_PRODUCT_PATH}/${encodeURIComponent(identifier)}`);
    if (req.query.source) {
      url.searchParams.set("source", req.query.source);
    }

    const data = await fetchKicksdb(url.toString());
    res.json(data);
  } catch (error) {
    console.log("KicksDB detail error:", error.message);
    res.status(error.status || 500).json({ message: error.message });
  }
});

export default router;
