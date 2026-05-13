import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-2">Manage your Gebeya Maekel store</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/admin/products"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 text-center hover:shadow-xl transition duration-300 group"
          >
            <div className="text-5xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-yellow-500 transition">
              Products
            </h3>
            <p className="text-gray-500 mt-2 text-sm">
              Add, edit and delete products
            </p>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 text-center hover:shadow-xl transition duration-300 group"
          >
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-yellow-500 transition">
              Orders
            </h3>
            <p className="text-gray-500 mt-2 text-sm">View and manage orders</p>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 text-center hover:shadow-xl transition duration-300 group"
          >
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-yellow-500 transition">
              Users
            </h3>
            <p className="text-gray-500 mt-2 text-sm">Manage users and roles</p>
          </Link>

          <Link
            to="/admin/analytics"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 text-center hover:shadow-xl transition duration-300 group"
          >
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-yellow-500 transition">
              Analytics
            </h3>
            <p className="text-gray-500 mt-2 text-sm">View store statistics</p>
          </Link>
          <Link
            to="/admin/promo"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 text-center hover:shadow-xl transition duration-300 group"
          >
            <div className="text-5xl mb-4">🎟️</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-yellow-500 transition">
              Promo Codes
            </h3>
            <p className="text-gray-500 mt-2 text-sm">
              Create and manage discounts
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
