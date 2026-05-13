import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-black text-gray-200 dark:text-gray-800 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl animate-bounce">🛒</span>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 rounded-xl transition duration-300"
          >
            🏠 Go Home
          </Link>
          <Link
            to="/cart"
            className="bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 text-white font-bold px-8 py-4 rounded-xl transition duration-300"
          >
            🛒 View Cart
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12">
          <p className="text-gray-500 text-sm mb-4">Or try these popular pages:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { to: '/login', label: '🔐 Login' },
              { to: '/register', label: '📝 Register' },
              { to: '/wishlist', label: '❤️ Wishlist' },
              { to: '/profile', label: '👤 Profile' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-xl text-sm hover:border-yellow-400 hover:text-yellow-500 border border-gray-200 dark:border-gray-700 transition"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;