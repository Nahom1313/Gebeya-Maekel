import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import API_URL from '../config/api';
const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [latestOrder, setLatestOrder] = useState(null);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    fetchLatestOrder();
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchLatestOrder = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/orders/myorders`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (data.length > 0) setLatestOrder(data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center py-12 px-6">
      <div className="max-w-lg w-full">
        {/* Success Animation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl animate-bounce">✅</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Order Placed!
          </h1>
          <p className="text-gray-500 mb-6">
            Thank you for shopping at Gebeya Maekel! Your order has been received.
          </p>

          {/* Order Details */}
          {latestOrder && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Order Summary</h3>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span>Order ID</span>
                <span className="font-mono">#{latestOrder._id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span>Items</span>
                <span>{latestOrder.items?.length} item(s)</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span>Subtotal</span>
                <span>ETB {latestOrder.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span>VAT (15%)</span>
                <span>ETB {latestOrder.taxAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span>Delivery Fee</span>
                <span>{latestOrder.deliveryFee === 0 ? '🎉 Free' : `ETB ${latestOrder.deliveryFee}`}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 flex justify-between font-bold text-gray-800 dark:text-white">
                <span>Total Paid</span>
                <span className="text-yellow-500">ETB {latestOrder.totalPrice?.toLocaleString()}</span>
              </div>

              {/* Shipping Address */}
              {latestOrder.shippingAddress && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 mb-1">📍 Delivering to:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {latestOrder.shippingAddress.address}, {latestOrder.shippingAddress.city}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    📞 {latestOrder.shippingAddress.phone}
                  </p>
                </div>
              )}

              {/* Status */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                    🕐 {latestOrder.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Order Tracking Steps */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4 text-left">
              🚚 Order Journey
            </h3>
            <div className="flex justify-between items-center relative">
              <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-0">
                <div className="h-full bg-yellow-400 w-1/5"></div>
              </div>
              {[
                { icon: '📋', label: 'Placed' },
                { icon: '✅', label: 'Confirmed' },
                { icon: '📦', label: 'Picked Up' },
                { icon: '🚚', label: 'On Way' },
                { icon: '🏠', label: 'Delivered' },
              ].map((step, index) => (
                <div key={index} className="flex flex-col items-center z-10 gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    index === 0
                      ? 'bg-yellow-400 text-gray-900'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {step.icon}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Countdown */}
          <p className="text-gray-400 text-sm mb-6">
            Redirecting to home in <span className="text-yellow-500 font-bold">{countdown}</span> seconds...
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 bg-gray-900 dark:bg-yellow-400 dark:text-gray-900 text-white font-bold py-3 rounded-xl hover:bg-yellow-400 hover:text-gray-900 transition text-center"
            >
              🏠 Continue Shopping
            </Link>
            <Link
              to="/profile"
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition text-center"
            >
              📦 View My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;