import React from 'react'
import axios from 'axios';
import MyOrdersPage from './MyOrdersPage'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../redux/slices/cartSlice';
import { logout } from '../redux/slices/authSlice';

const initialFormState = {
    title: "",
    brand: "",
    size: "",
    condition: "New",
    price: "",
    imageUrl: "",
    description: "",
};

const maskEmail = (email = "") => {
    const [name = "", domain = ""] = email.split("@");
    if (!name || !domain) return "Email unavailable";
    if (name.length <= 2) return `${name[0] || "*"}***@${domain}`;
    return `${name[0]}${"*".repeat(Math.max(name.length - 2, 1))}${name[name.length - 1]}@${domain}`;
};

const Profile = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = React.useState(initialFormState);
    const [myListings, setMyListings] = React.useState([]);
    const [allListings, setAllListings] = React.useState([]);
    const [submitting, setSubmitting] = React.useState(false);
    const [success, setSuccess] = React.useState("");
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchListings = async () => {
            try {
                const token = localStorage.getItem("userToken");
                const [mineResponse, allResponse] = await Promise.all([
                  axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/marketplace/mine`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                  }),
                  axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/marketplace`),
                ]);
                setMyListings(Array.isArray(mineResponse.data) ? mineResponse.data : []);
                setAllListings(Array.isArray(allResponse.data) ? allResponse.data : []);
            } catch (fetchError) {
                setError(fetchError.response?.data?.message || "Unable to load your marketplace listings.");
            }
        };

        fetchListings();
    }, [user, navigate]);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearCart());
        navigate('/login');
    }

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmitListing = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccess("");
        setError("");

        try {
            const token = localStorage.getItem("userToken");
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/marketplace`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMyListings((prev) => [response.data, ...prev]);
            setAllListings((prev) => [
                {
                    ...response.data,
                    seller: {
                        name: user?.name,
                        email: user?.email,
                    },
                },
                ...prev,
            ]);
            setFormData(initialFormState);
            setSuccess("Your sneaker has been published to the marketplace.");
        } catch (submitError) {
            setError(submitError.response?.data?.message || "Unable to publish listing.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return null;
    }

  return (
    <div className='min-h-screen flex flex-col'>
        <div className="grow container mx-auto p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
                {/* Left section */}
                <div className="w-full md:w-1/3 lg:w-1/4 shadow-md rounded-lg p-6">
                    <h1 className="text-2xl md:text-3xl font-bold mb-4">{user?.name}</h1>
                    <p className="text-lg text-gray-600 mb-4">{user?.email}</p>
                    <button onClick={handleLogout} className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">Logout</button>
                </div>
                {/* Right section */}
                <div className="w-full md:w-2/3 lg:3/4 space-y-6">
                    <div className="shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Sell a Sneaker</h2>
                        <p className="text-gray-600 mb-4">Publish your own sneaker listing so other consumers can buy it in the marketplace.</p>
                        <form onSubmit={handleSubmitListing} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="title" value={formData.title} onChange={handleChange} placeholder="Sneaker title" className="border border-gray-300 rounded px-3 py-2" required />
                            <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand (e.g. Nike)" className="border border-gray-300 rounded px-3 py-2" required />
                            <input name="size" value={formData.size} onChange={handleChange} placeholder="Size (e.g. UK 9)" className="border border-gray-300 rounded px-3 py-2" required />
                            <select name="condition" value={formData.condition} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2" required>
                                <option value="New">New</option>
                                <option value="Used - Like New">Used - Like New</option>
                                <option value="Used - Good">Used - Good</option>
                            </select>
                            <input name="price" type="number" min="1" step="0.01" value={formData.price} onChange={handleChange} placeholder="Price" className="border border-gray-300 rounded px-3 py-2" required />
                            <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="Image URL (optional)" className="border border-gray-300 rounded px-3 py-2" />
                            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your sneaker" className="md:col-span-2 border border-gray-300 rounded px-3 py-2 min-h-28" required />
                            <button type="submit" disabled={submitting} className="md:col-span-2 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 disabled:opacity-60">
                                {submitting ? "Publishing..." : "Publish Sneaker"}
                            </button>
                        </form>
                        {success && <p className="text-green-600 mt-3">{success}</p>}
                        {error && <p className="text-red-600 mt-3">{error}</p>}
                    </div>

                    <div className="shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Your Marketplace Listings</h2>
                        {myListings.length === 0 ? (
                            <p className="text-gray-600">You have not published any sneakers yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {myListings.map((listing) => (
                                    <div key={listing._id} className="border border-gray-200 rounded p-3">
                                        <p className="font-semibold">{listing.title}</p>
                                        <p className="text-sm text-gray-600">{listing.brand} | Size {listing.size} | {listing.condition}</p>
                                        <p className="text-sm text-gray-700">R {Number(listing.price).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Marketplace Listings</h2>
                        <p className="text-gray-600 mb-4">Browse active listings from other consumers and contact sellers directly.</p>
                        {allListings.length === 0 ? (
                            <p className="text-gray-600">No active marketplace listings yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {allListings.map((listing) => (
                                    <article key={listing._id} className="border border-gray-200 rounded p-4">
                                        <p className="font-semibold text-lg">{listing.title}</p>
                                        <p className="text-sm text-gray-600 mb-1">{listing.brand} | Size {listing.size} | {listing.condition}</p>
                                        <p className="text-sm text-gray-700 mb-2">Seller: {listing.seller?.name || "SSneakers User"}</p>
                                        <p className="font-semibold mb-2">R {Number(listing.price).toFixed(2)}</p>
                                        <p className="text-sm text-gray-600 mb-3">{listing.description}</p>
                                        {listing.seller?.email && (
                                            <>
                                                <p className="text-xs text-gray-500 mb-2">Contact: {maskEmail(listing.seller.email)}</p>
                                                <a
                                                    href={`mailto:${listing.seller.email}?subject=${encodeURIComponent(`Interested in ${listing.title}`)}`}
                                                    className="inline-block bg-black text-white text-sm px-3 py-2 rounded hover:bg-gray-800"
                                                >
                                                    Contact Seller
                                                </a>
                                            </>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>

                    <MyOrdersPage />
                </div>
            </div>
        </div>
    </div>
  )
}

export default Profile