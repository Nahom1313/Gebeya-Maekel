import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LocationPicker from "../components/LocationPicker";
import axios from "axios";
import API_URL from '../config/api';


const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ address: "", city: "", phone: "" });
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("chapa");
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = Math.round(total * 0.15);
  const deliveryFee = total >= 1000 ? 0 : 50;
  const finalTotal = Math.max(0, total + tax + deliveryFee - promoDiscount);

  useEffect(() => {
    if (cartItems.length === 0) navigate("/");
  }, [cartItems, navigate]);

  const handleLocationSelect = (location) => {
    setForm({
      ...form,
      address: location.address,
      city: location.city,
    });
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleGuestChange = (e) =>
    setGuestInfo({ ...guestInfo, [e.target.name]: e.target.value });

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    try {
      setPromoLoading(true);
      setPromoError("");
      const headers = user ? { Authorization: `Bearer ${user.token}` } : {};
      const { data } = await axios.post(`${API_URL}/api/promo/validate`,
        "http://localhost:5000/api/promo/validate",
        { code: promoCode, orderAmount: total },
        { headers },
      );
      
      setPromoDiscount(data.discount);
      setPromoMessage(data.message);
      setPromoLoading(false);
    } catch (err) {
      setPromoError(err.response?.data?.message || "Invalid promo code");
      setPromoDiscount(0);
      setPromoLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!form.address || !form.city || !form.phone) {
      setError("Please fill in all shipping fields");
      return;
    }
    if (!user && (!guestInfo.name || !guestInfo.email)) {
      setError("Please fill in your name and email");
      return;
    }
    try {
      setLoading(true);
      const headers = user ? { Authorization: `Bearer ${user.token}` } : {};
      const { data: order } = await axios.post(
        `${API_URL}/api/orders`,
        {
          items: cartItems,
          shippingAddress: form,
          guestInfo: user ? null : guestInfo,
          paymentMethod,
        },
        { headers },
      );

      // Handle different payment methods
      if (paymentMethod === "cash") {
        // Cash on delivery - go directly to success
        dispatch(clearCart());
        navigate("/order-success");
      } else if (paymentMethod === "chapa" || paymentMethod === "telebirr") {
        // Online payment - redirect to Chapa
        const { data: payment } = await axios.post(
          `${API_URL}/api/payment/initialize`,
          {
            orderId: order._id,
            guestInfo: user ? null : guestInfo,
          },
          { headers },
        );
        dispatch(clearCart());
        window.location.href = payment.checkoutUrl;
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-6 md:py-10 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">
          📦 Checkout
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4">
            {/* Guest Info */}
            {!user && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-8">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    👤 Your Information
                  </h2>
                  <Link
                    to="/login"
                    className="text-yellow-500 text-sm hover:underline"
                  >
                    Already have an account? Login
                  </Link>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      name="name"
                      value={guestInfo.name}
                      onChange={handleGuestChange}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={guestInfo.email}
                      onChange={handleGuestChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
                <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3">
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                    💡 No account needed! You can track your order with your
                    email.
                  </p>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-8">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-5">
                📍 Shipping Address
              </h2>
              {error && (
                <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* 👇 Add Location Picker here */}
              <LocationPicker onLocationSelect={handleLocationSelect} />

              <div className="space-y-4">{/* rest of fields */}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-8">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-5">
                📍 Shipping Address
              </h2>
              {error && (
                <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                {[
                  {
                    name: "address",
                    label: "Street Address",
                    placeholder: "e.g. Kebele 12, House No. 34",
                  },
                  { name: "city", label: "City", placeholder: "e.g. Mekelle" },
                  {
                    name: "phone",
                    label: "Phone Number",
                    placeholder: "e.g. 0912345678",
                  },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.label}
                    </label>
                    <input
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm md:text-base"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-6 sticky top-24">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between text-sm text-gray-600 dark:text-gray-300"
                  >
                    <span className="truncate mr-2">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="whitespace-nowrap">
                      ETB {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoLoading}
                    className="bg-gray-900 dark:bg-yellow-400 dark:text-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-400 hover:text-gray-900 transition disabled:opacity-50"
                  >
                    {promoLoading ? "..." : "Apply"}
                  </button>
                </div>
                {promoMessage && (
                  <p className="text-green-500 text-xs">{promoMessage}</p>
                )}
                {promoError && (
                  <p className="text-red-500 text-xs">{promoError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>ETB {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>VAT (15%)</span>
                  <span>ETB {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Delivery Fee</span>
                  <span className={total >= 1000 ? "text-green-500" : ""}>
                    {total >= 1000 ? "🎉 Free" : "ETB 50"}
                  </span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-500">
                    <span>Promo Discount</span>
                    <span>- ETB {promoDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-gray-800 dark:text-white text-base md:text-lg">
                  <span>Total</span>
                  <span className="text-yellow-500">
                    ETB {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>
              {/* Payment Method */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                  💳 Payment Method
                </h3>
                <div className="flex flex-col gap-2">
                  {/* Chapa */}
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === "chapa"
                        ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-yellow-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value="chapa"
                      checked={paymentMethod === "chapa"}
                      onChange={() => setPaymentMethod("chapa")}
                      className="accent-yellow-400"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💳</span>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">
                          Chapa
                        </p>
                        <p className="text-gray-500 text-xs">
                          Pay with Telebirr, CBE, or card
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Telebirr Direct */}
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === "telebirr"
                        ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-yellow-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value="telebirr"
                      checked={paymentMethod === "telebirr"}
                      onChange={() => setPaymentMethod("telebirr")}
                      className="accent-yellow-400"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📱</span>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">
                          Telebirr
                        </p>
                        <p className="text-gray-500 text-xs">
                          Pay directly with Telebirr
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === "cash"
                        ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-yellow-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                      className="accent-yellow-400"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💵</span>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">
                          Cash on Delivery
                        </p>
                        <p className="text-gray-500 text-xs">
                          Pay when your order arrives
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              <button
                onClick={handleOrder}
                disabled={loading}
                className="mt-5 w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-gray-900 font-bold py-3 rounded-xl transition text-sm md:text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-gray-900"></div>
                    Processing...
                  </span>
                ) : (
                  "💳 Place Order"
                )}
              </button>

              {!user && (
                <p className="text-center text-gray-400 text-xs mt-3">
                  🔒 Secure checkout — no account required
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
