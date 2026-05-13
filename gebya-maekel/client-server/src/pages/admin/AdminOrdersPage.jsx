import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import API_URL from '../../config/api';
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  picked_up: 'bg-purple-100 text-purple-700',
  on_the_way: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersons();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setOrders(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchDeliveryPersons = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setDeliveryPersons(data.filter(u => u.isDelivery));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignDelivery = async (orderId, deliveryPersonId) => {
    try {
      await axios.put(
        `${API_URL}/api/orders/${orderId}/assign`,
        { deliveryPersonId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSuccess('Delivery person assigned!');
      fetchOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await axios.put(
        `${API_URL}/api/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSuccess('Status updated!');
      fetchOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📦 Orders</h1>
          <p className="text-gray-500 mt-1">Manage and assign orders</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl mb-6">{error}</div>
        )}
        {success && (
          <div className="bg-green-100 text-green-600 px-4 py-3 rounded-xl mb-6">{success}</div>
        )}

        <div className="flex flex-col gap-4">
          {orders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-12 text-center">
              <p className="text-5xl mb-4">📦</p>
              <p className="text-gray-400 text-xl">No orders yet</p>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Order Info */}
                  <div>
                    <p className="text-sm text-gray-500 font-mono">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="font-bold text-gray-800 dark:text-white mt-1">
                      {order.user?.name || order.guestInfo?.name || 'Guest'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {order.user?.email || order.guestInfo?.email}
                    </p>
                    <p className="text-yellow-500 font-bold mt-1">
                      ETB {order.totalPrice?.toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>

                    {/* Items */}
                    <div className="mt-2">
                      {order.items?.map((item, i) => (
                        <p key={i} className="text-xs text-gray-500">
                          x{item.quantity} — ETB {item.price}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col gap-2 min-w-48">
                    {/* Payment Method */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                      order.paymentMethod === 'cash'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {order.paymentMethod === 'cash' ? '💵 Cash on Delivery' :
                       order.paymentMethod === 'telebirr' ? '📱 Telebirr' :
                       '💳 Chapa'}
                    </span>

                    {/* Paid Status */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                      order.isPaid
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {order.isPaid ? '✅ Paid' : '❌ Unpaid'}
                    </span>

                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${statusColors[order.status]}`}>
                      {order.status?.replace('_', ' ').toUpperCase()}
                    </span>

                    {/* Update Status */}
                    <select
                      value={order.status}
                      onChange={e => handleUpdateStatus(order._id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="on_the_way">On The Way</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Assign Delivery */}
                    <select
                      value={order.deliveryPerson?._id || ''}
                      onChange={e => handleAssignDelivery(order._id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="">Assign Delivery Person</option>
                      {deliveryPersons.map(dp => (
                        <option key={dp._id} value={dp._id}>{dp.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-sm min-w-48">
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      📍 Address
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {order.shippingAddress?.address}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {order.shippingAddress?.city}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      📞 {order.shippingAddress?.phone}
                    </p>
                    {order.shippingAddress?.lat && (
                      
                       <a href={`https://www.google.com/maps?q=${order.shippingAddress.lat},${order.shippingAddress.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-yellow-500 hover:underline text-xs mt-1 block"
                      >
                        📍 View on Google Maps
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;