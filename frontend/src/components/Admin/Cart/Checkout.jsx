import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createCheckout, payCheckout, finalizeCheckout } from "../../../redux/slices/checkoutSlice";
import { logout } from '../../../redux/slices/authSlice';
import PayPalButton from "./PayPalButton";
import CartContents from "./CartContents";
import { formatZAR } from '../../../utils/formatPrice';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
const DISPLAY_CURRENCY = import.meta.env.VITE_PAYPAL_CURRENCY || "ZAR";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, loading: cartLoading, error } = useSelector((state) => state.cart);
  const { checkout, loading: checkoutLoading, error: checkoutError } = useSelector((state) => state.checkout);
  const { user, guestId } = useSelector((state) => state.auth);

  const [checkoutId, setCheckoutId] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const checkoutSessionId = checkoutId || checkout?._id;
  // Tracks whether the cart ever had items this session — prevents redirect after user deletes
  const cartInitialized = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!user || !token) {
      navigate("/login?redirect=checkout");
      return;
    }
    // Mark initialized the moment we see items — once true, stays true for this session
    if (cart?.products?.length > 0) {
      cartInitialized.current = true;
    }
    // Only redirect to home if the cart fetch is done AND we never saw any items
    if (!cartLoading && !cartInitialized.current) {
      navigate("/");
    }
  }, [cart, user, cartLoading, navigate]);

  useEffect(() => {
    if (!checkoutId && checkout && checkout._id) {
      setCheckoutId(checkout._id);
    }
  }, [checkout, checkoutId]);

  const handleCreateCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login?redirect=checkout");
      return;
    }

    const requiredFields = [
      "firstName",
      "lastName",
      "address",
      "city",
      "postalCode",
      "country",
      "phone",
    ];

    const missingField = requiredFields.find((field) => !shippingAddress[field]?.trim());
    if (missingField) {
      setPaymentError("Please complete all shipping fields before continuing.");
      return;
    }

    if (cart && cart.products.length > 0) {
      try {
        setPaymentError(null);

        // Fetch USD equivalent so the backend can verify the PayPal charge amount
        let totalPriceUSD = null;
        if (DISPLAY_CURRENCY !== "USD") {
          try {
            const convRes = await fetch(
              `${BACKEND_URL}/api/currency/convert?from=${DISPLAY_CURRENCY}&to=USD&amount=${cart.totalPrice}`
            );
            const convData = await convRes.json();
            if (convData.convertedAmount) totalPriceUSD = convData.convertedAmount;
          } catch {
            // Non-fatal: backend will skip amount check if totalPriceUSD is null
          }
        } else {
          totalPriceUSD = cart.totalPrice;
        }

        const res = await dispatch(
          createCheckout({
            checkoutItems: cart.products,
            shippingAddress,
            paymentMethod: "PayPal",
            totalPrice: cart.totalPrice,
            totalPriceUSD,
          })
        ).unwrap();
        if (res && res._id) {
          setCheckoutId(res._id);
        }
      } catch (error) {
        const message = error?.message || error?.payload?.message || "Unable to create checkout. Please try again.";
        if (message?.toString().toLowerCase().includes("not authorized")) {
          dispatch(logout());
          navigate("/login?redirect=checkout");
          return;
        }
        setPaymentError(message);
      }
    }
  };

  const handlePaymentSuccess = async (details) => {
    const sessionId = checkoutId || checkout?._id;
    if (!sessionId) return;
    setPaymentError(null);
    setIsPaymentProcessing(true);

    const paymentDetails = {
      id: details.id,
      status: details.status,
      payer: details.payer,
      purchase_units: details.purchase_units,
      raw: details,
    };

    try {
      await dispatch(payCheckout({ checkoutId: sessionId, paymentDetails })).unwrap();
      const result = await dispatch(finalizeCheckout(sessionId)).unwrap();
      if (result && result._id) {
        navigate("/order-confirmation");
      }
    } catch (error) {
      setPaymentError(error?.message || "Payment processing failed.");
      console.error("Payment error:", error);
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  if (cartLoading && (!cart?.products?.length)) {
    return <p>Loading cart...</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter">
      {/* Left section */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl uppercase mb-6">Checkout</h2>
        <form onSubmit={(e) => e.preventDefault()} noValidate>
          <h3 className="text-lg mb-4">Contact Details</h3>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={user ? user.email : ""}
              className="w-full p-2 border border-gray-200 rounded"
              disabled
            />
          </div>
          <h3 className="text-lg mb-4">Delivery</h3>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">First Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded border-gray-200"
                required
                value={shippingAddress.firstName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    firstName: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-gray-700">Last Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded border-gray-200"
                required
                value={shippingAddress.lastName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    lastName: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Address</label>
            <input
              type="text"
              className="w-full p-2 border rounded border-gray-200"
              required
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  address: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">City</label>
              <input
                type="text"
                className="w-full p-2 border rounded border-gray-200"
                required
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    city: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-gray-700">Postal Code</label>
              <input
                type="text"
                className="w-full p-2 border rounded border-gray-200"
                required
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    postalCode: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Country</label>
            <input
              type="text"
              className="w-full p-2 border rounded border-gray-200"
              required
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  country: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone</label>
            <input
              type="tel"
              className="w-full p-2 border rounded border-gray-200"
              required
              value={shippingAddress.phone}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  phone: e.target.value,
                })
              }
            />
          </div>
          <div className="mt-6">
            {(paymentError || checkoutError) && (
              <p className="text-sm text-red-600 mb-4">{paymentError || checkoutError}</p>
            )}
            {!checkoutSessionId ? (
              <button
                type="button"
                onClick={handleCreateCheckout}
                className="w-full bg-black text-white py-3 rounded"
                disabled={checkoutLoading || isPaymentProcessing}
              >
                {checkoutLoading ? "Creating checkout..." : "Continue to Payment"}
              </button>
            ) : (
              <div>
                <h3 className="text-lg mb-4">Pay with PayPal</h3>
                {(paymentError || checkoutError) && (
                  <p className="text-sm text-red-600 mb-4">{paymentError || checkoutError}</p>
                )}
                <PayPalButton
                  totalAmount={cart.totalPrice}
                  onSuccess={handlePaymentSuccess}
                  onError={(err) => setPaymentError(err?.message || "PayPal payment failed")}
                  onCancel={() => setPaymentError("Payment was cancelled.")}
                  disabled={isPaymentProcessing}
                />
                {isPaymentProcessing && (
                  <p className="mt-4 text-sm text-gray-600">Completing payment…</p>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
      {/* Right section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg mb-4">Order Summary</h3>
        <div className="border-t border-gray-200 py-4 mb-4">
          {!checkoutSessionId ? (
            cart.products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Your cart is empty.</p>
                <button
                  onClick={() => navigate("/collections/all")}
                  className="bg-black text-white px-4 py-2 rounded text-sm"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              /* Editable cart — quantity controls and delete available before payment */
              <CartContents
                cart={cart}
                userId={user?._id}
                guestId={guestId}
              />
            )
          ) : (
            /* Read-only summary once PayPal session has started */
            cart.products.map((product, index) => (
              <div
                key={index}
                className="flex items-start justify-between py-2 border-b border-gray-200"
              >
                <div className="flex items-start">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-24 object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-md">{product.name}</h3>
                    <p className="text-gray-500">Size: {product.size}</p>
                    <p className="text-gray-500">Color: {product.color}</p>
                    <p className="text-gray-500">Qty: {product.quantity}</p>
                  </div>
                </div>
                <p className="text-xl">{formatZAR(product.price * product.quantity)}</p>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-between items-center text-lg mb-4">
          <p>Subtotal</p>
          <p>{formatZAR(cart.totalPrice)}</p>
        </div>
        <div className="flex justify-between items-center text-lg">
          <p>Shipping</p>
          <p>Free</p>
        </div>
        <div className="flex justify-between items-center text-lg mt-4 border-t pt-4">
          <p>Total</p>
          <p>{formatZAR(cart.totalPrice)}</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;