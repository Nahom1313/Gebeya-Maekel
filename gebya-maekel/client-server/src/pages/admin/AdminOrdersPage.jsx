import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const statusColors = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  processing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  delivered: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400',
};

const AdminOrdersPage = () => {
  const { user } = useSelector(state => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-6 md:py-10 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">🧾 Orders</h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-yellow-400"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-12 text-center">
            <p className="text-4xl mb-3">🧾</p>
            <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 text-left">Order ID</th>
                    <th className="px-6 py-4 text-left">Customer</th>
                    <th className="px-6 py-4 text-left">Total</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {orders.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-gray-800 dark:text-white">
                        {order.user?.name || 'Guest'}
                      </td>
                      <td className="px-6 py-4 text-yellow-500 font-semibold">
                        ETB {order.totalPrice?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status] || statusColors.pending}`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status || 'pending'}
                          onChange={e => handleStatusChange(order._id, e.target.value)}
                          className="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                          {Object.keys(statusColors).map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {orders.map(order => (
                <div key={order._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">
                        {order.user?.name || 'Guest'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status] || statusColors.pending}`}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-yellow-500 font-bold text-sm">ETB {order.totalPrice?.toLocaleString()}</p>
                    <select
                      value={order.status || 'pending'}
                      onChange={e => handleStatusChange(order._id, e.target.value)}
                      className="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      {Object.keys(statusColors).map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;