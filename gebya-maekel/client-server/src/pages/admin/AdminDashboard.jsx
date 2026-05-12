import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        const [productsRes, ordersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/products', { headers }),
          axios.get('http://localhost:5000/api/orders', { headers }),
        ]);
        const revenue = ordersRes.data.reduce((sum, o) => sum + o.totalPrice, 0);
        setStats({
          products: productsRes.data.length,
          orders: ordersRes.data.length,
          revenue,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const cards = [
    { label: 'Total Products', value: stats.products, icon: '📦', link: '/admin/products', color: 'bg-blue-500' },
    { label: 'Total Orders', value: stats.orders, icon: '🧾', link: '/admin/orders', color: 'bg-green-500' },
    { label: 'Total Revenue', value: `ETB ${stats.revenue.toLocaleString()}`, icon: '💰', color: 'bg-yellow-500' },
  ];

  const quickLinks = [
    { label: 'Manage Products', icon: '📦', link: '/admin/products' },
    { label: 'Create Product', icon: '➕', link: '/admin/products/create' },
    { label: 'Manage Orders', icon: '🧾', link: '/admin/orders' },
  ];

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-6 md:py-10 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">⚙️ Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 md:mb-8 text-sm md:text-base">Welcome back, {user?.name}</p>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-yellow-400"></div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
              {cards.map(card => (
                <div key={card.label} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-6 flex items-center gap-4">
                  <div className={`${card.color} w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-2xl shrink-0`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">{card.label}</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{card.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.link}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 md:p-6 flex items-center gap-4 hover:shadow-lg hover:border-yellow-400 border border-transparent transition"
                >
                  <span className="text-2xl">{link.icon}</span>
                  <span className="font-semibold text-gray-800 dark:text-white text-sm md:text-base">{link.label}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;