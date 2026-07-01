import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductGrid from "../components/Products/ProductGrid";

const KicksSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState("");

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!searchTerm.trim()) {
      setError("Enter a product name, SKU, or identifier to search KicksDB.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setInfo("");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/kicks?query=${encodeURIComponent(searchTerm.trim())}&limit=24`
      );
      const payload = response.data?.data || [];
      const normalizedProducts = payload.map((item) => ({
        _id: item.variant_id || item.product_id || item.identifier || item.slug || item.link,
        name: item.name,
        brand: item.brand,
        price: item.retail_price || item.price || item.lowest_price || 0,
        images: [{ url: item.image || item.images?.[0] || "https://via.placeholder.com/300", altText: item.name }],
        sizes: item.size ? [item.size] : [],
        colors: item.color ? [item.color] : [],
        description: item.description || item.name,
        source: item.source,
        link: item.link,
      }));

      setProducts(normalizedProducts);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message || "Unable to fetch KicksDB results.";

      if (status === 403 && message.toLowerCase().includes("subscription")) {
        try {
          const fallback = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/products?search=${encodeURIComponent(searchTerm.trim())}&limit=24`
          );
          setProducts(fallback.data || []);
          setInfo("KicksDB subscription is required for this endpoint. Showing local catalog results instead.");
          return;
        } catch {
          setError("KicksDB subscription is required, and local fallback search also failed.");
          return;
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/60 text-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight mb-2">KicksDB Sneaker Search</h1>
          <p className="text-sm text-slate-600 mb-6">
            Search authenticated sneaker metadata from KicksDB in one place. Use keywords, SKU, identifier, or model name.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-black"
              placeholder="Search KicksDB by query, SKU, identifier, or style name"
            />
            <button className="inline-flex items-center justify-center rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-900">
              Search
            </button>
          </form>
          {info && <p className="mt-4 text-sm text-amber-700">{info}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </header>

        <section>
          {loading ? (
            <div className="text-center text-slate-500 py-16">Searching KicksDB...</div>
          ) : (
            <ProductGrid products={products} loading={loading} error={error} />
          )}
        </section>
      </div>
    </div>
  );
};

export default KicksSearchPage;
