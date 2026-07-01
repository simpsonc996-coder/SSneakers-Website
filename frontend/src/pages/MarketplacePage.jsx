import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const maskEmail = (email = "") => {
  const [name = "", domain = ""] = email.split("@");
  if (!name || !domain) return "Email unavailable";
  if (name.length <= 2) return `${name[0] || "*"}***@${domain}`;
  return `${name[0]}${"*".repeat(Math.max(name.length - 2, 1))}${name[name.length - 1]}@${domain}`;
};

const MarketplacePage = () => {
  const [listings, setListings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/marketplace`);
        setListings(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load marketplace listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6 min-h-screen">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Sneaker Marketplace</h1>
          <p className="text-gray-600 mt-1">Buy sneakers listed by other SSneakers users.</p>
        </div>
        <Link
          to="/profile"
          className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800"
        >
          Sell Your Pair
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading marketplace listings...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && listings.length === 0 && (
        <p className="text-gray-500">No listings yet. Be the first to publish a sneaker.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <article key={listing._id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="h-48 bg-gray-100">
              {listing.imageUrl ? (
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                  No image provided
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-1">{listing.title}</h2>
              <p className="text-sm text-gray-600 mb-2">{listing.brand}</p>
              <p className="text-sm text-gray-700 mb-1">Size: {listing.size}</p>
              <p className="text-sm text-gray-700 mb-1">Condition: {listing.condition}</p>
              <p className="text-sm text-gray-700 mb-3">Seller: {listing.seller?.name || "SSneakers User"}</p>
              <p className="text-xl font-bold mb-3">R {Number(listing.price).toFixed(2)}</p>
              <p className="text-sm text-gray-600 line-clamp-3">{listing.description}</p>
              {listing.seller?.email && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Contact: {maskEmail(listing.seller.email)}</p>
                  <a
                    href={`mailto:${listing.seller.email}?subject=${encodeURIComponent(`Interested in ${listing.title}`)}`}
                    className="inline-block bg-black text-white text-sm px-3 py-2 rounded hover:bg-gray-800"
                  >
                    Contact Seller
                  </a>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default MarketplacePage;
