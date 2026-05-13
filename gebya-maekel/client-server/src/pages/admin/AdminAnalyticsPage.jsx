import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import API_URL from '../../config/api';
const COLORS = ['#FBBF24', '#34D399', '#60A5FA', '#F87171', '#A78BFA'];

const AdminAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/api/orders/stats`, { headers }),
        axios.get(`${API_URL}/api/orders`, { headers }),
        axios.get(`${API_URL}/api/products`),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Revenue by month
  const revenueByMonth = orders
    .filter(o => o.isPaid)
    .reduce((acc, order) => {
      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
      const existing = acc.find(a => a.month === month);
      if (existing) {
        existing.revenue += order.totalPrice;
        existing.orders += 1;
      } else {
        acc.push({ month, revenue: order.totalPrice, orders: 1 });
      }
      return acc;
    }, []);

  // Orders by status
  const ordersByStatus = [
    { name: 'Pending', value: orders.filter(o => o.status === 'pending').length },
    { name: 'Confirmed', value: orders.filter(o => o.status === 'confirmed').length },
    { name: 'On The Way', value: orders.filter(o => o.status === 'on_the_way').length },
    { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
    { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length },
  ].filter(s => s.value > 0);

  // Top products by category
  const productsByCategory = products.reduce((acc, product) => {
    const existing = acc.find(a => a.category === product.category);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ category: product.category, count: 1 });
    }
    return acc;
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400"></div>
    </div>
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📊 Analytics</h1>
          <p className="text-gray-500 mt-1">Store performance overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <h3 className="text-2xl font-bold text-yellow-500 mt-1">
              ETB {stats?.totalRevenue?.toLocaleString() || 0}
            </h3>
            <p className="text-green-500 text-xs mt-1">💰 From paid orders</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <p className="text-gray-500 text-sm">Total Orders</p>
            <h3 className="text-2xl font-bold text-blue-500 mt-1">
              {stats?.totalOrders || 0}
            </h3>
            <p className="text-gray-400 text-xs mt-1">📦 All time</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <p className="text-gray-500 text-sm">Tax Collected</p>
            <h3 className="text-2xl font-bold text-purple-500 mt-1">
              ETB {stats?.totalTax?.toLocaleString() || 0}
            </h3>
            <p className="text-gray-400 text-xs mt-1">🏛️ VAT 15%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <p className="text-gray-500 text-sm">Pending Orders</p>
            <h3 className="text-2xl font-bold text-orange-500 mt-1">
              {stats?.pendingOrders || 0}
            </h3>
            <p className="text-gray-400 text-xs mt-1">⏳ Need attention</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              💰 Revenue Over Time
            </h3>
            {revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FBBF24"
                    strokeWidth={3}
                    dot={{ fill: '#FBBF24', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400">
                No revenue data yet
              </div>
            )}
          </div>

          {/* Orders by Status Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              📦 Orders by Status
            </h3>
            {ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400">
                No order data yet
              </div>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders per Month Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              📈 Orders per Month
            </h3>
            {revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Bar dataKey="orders" fill="#60A5FA" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400">
                No order data yet
              </div>
            )}
          </div>

          {/* Products by Category */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              🛍️ Products by Category
            </h3>
            {productsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={productsByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="category" type="category" stroke="#9CA3AF" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Bar dataKey="count" fill="#FBBF24" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400">
                No product data yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            🕐 Recent Orders
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="py-3 px-4 text-sm font-mono text-gray-500">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-white">
                      {order.user?.name}
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-yellow-500">
                      ETB {order.totalPrice?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {order.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;