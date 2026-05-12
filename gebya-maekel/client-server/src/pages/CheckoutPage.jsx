import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../redux/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { cartItems } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const [form, setForm] = useState({ address: '', city: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 👇 Fix: use useEffect instead of calling navigate during render
  useEffect(() => {
  if (cartItems.length === 0) return; // 👈 just return, don't redirect
}, [cartItems, navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleOrder = async () => {
  if (!form.address || !form.city || !form.phone) {
    setError(t('checkout.fill_fields'));
    return;
  }
  try {
    setLoading(true);

    // Step 1 - Create order
    const { data: order } = await axios.post(
      'http://localhost:5000/api/orders',
      { items: cartItems, shippingAddress: form, totalPrice: total },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    // Step 2 - Initialize Chapa payment
    const { data: payment } = await axios.post(
      'http://localhost:5000/api/payment/initialize',
      { orderId: order._id },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    // Step 3 - Clear cart and redirect to Chapa
    dispatch(clearCart());
    window.location.href = payment.checkoutUrl;

  } catch (err) {
    setError(err.response?.data?.message || err.message);
    setLoading(false);
  }
};

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-6 md:py-10 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">📦 {t('checkout.title')}</h1>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-8">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-5">{t('checkout.shipping')}</h2>
            {error && (
              <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              {[
                { name: 'address', label: t('checkout.address'), placeholder: t('checkout.address_placeholder') },
                { name: 'city', label: t('checkout.city'), placeholder: t('checkout.city_placeholder') },
                { name: 'phone', label: t('checkout.phone'), placeholder: t('checkout.phone_placeholder') },
              ].map(field => (
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

          <div className="w-full lg:w-80">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-6 sticky top-24">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-4">
                {t('checkout.summary')}
              </h2>
              <div className="space-y-2 mb-4">
                {cartItems.map(item => (
                  <div key={item._id} className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span className="truncate mr-2">{item.name} x{item.quantity}</span>
                    <span className="whitespace-nowrap">ETB {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between font-bold text-gray-800 dark:text-white text-base md:text-lg">
                <span>{t('checkout.total')}</span>
                <span>ETB {total.toLocaleString()}</span>
              </div>
              <button
                onClick={handleOrder}
                disabled={loading}
                className="mt-5 w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-gray-900 font-bold py-3 rounded-xl transition text-sm md:text-base"
              >
                {loading ? t('checkout.placing') : t('checkout.place_order')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;