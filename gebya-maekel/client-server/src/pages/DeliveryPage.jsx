import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OrderSkeleton from '../components/OrderSkeleton';
import OrderMap from '../components/OrderMap';
import API_URL from '../config/api';
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  picked_up: 'bg-purple-100 text-purple-700',
  on_the_way: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusSteps = ['pending', 'confirmed', 'picked_up', 'on_the_way', 'delivered'];

const DeliveryPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/orders/delivery`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || (!user.isDelivery && !user.isAdmin)) {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [user]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSuccess('Order status updated!');
      fetchOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-8 animate-pulse"></div>
        <div className="flex flex-col gap-6">
          {[1, 2, 3].map(i => <OrderSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );

  const getNextStatus = (currentStatus) => {
    const currentIndex = statusSteps.indexOf(currentStatus);
    return statusSteps[currentIndex + 1] || null;
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🚚 My Deliveries</h1>
          <p className="text-gray-500 mt-1">Manage your assigned orders</p>
        </div>

        {error && <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl mb-6">{error}</div>}
        {success && <div className="bg-green-100 text-green-600 px-4 py-3 rounded-xl mb-6">{success}</div>}

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-12 text-center">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-gray-400 text-xl">No deliveries assigned yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500 font-mono">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="font-bold text-gray-800 dark:text-white text-lg mt-1">
                      {order.user?.name}
                    </p>
                    <p className="text-gray-500 text-sm">{order.user?.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📍 Delivery Address</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{order.shippingAddress?.address}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{order.shippingAddress?.city}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">📞 {order.shippingAddress?.phone}</p>
                </div>

                {/* Map Section - ADDED HERE */}
                <div className="mb-4 overflow-hidden rounded-xl">
                  <OrderMap
                    lat={order.shippingAddress?.lat}
                    lng={order.shippingAddress?.lng}
                    address={order.shippingAddress?.address}
                  />
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📦 Items</p>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>x{item.quantity} item</span>
                      <span>ETB {item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <p className="font-bold text-yellow-500">ETB {order.totalPrice}</p>
                  {getNextStatus(order.status) && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, getNextStatus(order.status))}
                      className="bg-gray-900 dark:bg-yellow-400 dark:text-gray-900 text-white px-4 py-2 rounded-xl font-semibold hover:bg-yellow-400 hover:text-gray-900 transition"
                    >
                      Mark as {getNextStatus(order.status).replace('_', ' ')} →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPage;