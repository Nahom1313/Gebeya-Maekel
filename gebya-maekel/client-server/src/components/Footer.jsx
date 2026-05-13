import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">🛒 Gebeya Maekel</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Ethiopia's premier online marketplace. Discover authentic Ethiopian products delivered to your door.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="bg-gray-800 hover:bg-yellow-400 hover:text-gray-900 w-9 h-9 rounded-full flex items-center justify-center transition">
                📘
              </a>
              <a href="#" className="bg-gray-800 hover:bg-yellow-400 hover:text-gray-900 w-9 h-9 rounded-full flex items-center justify-center transition">
                📸
              </a>
              <a href="#" className="bg-gray-800 hover:bg-yellow-400 hover:text-gray-900 w-9 h-9 rounded-full flex items-center justify-center transition">
                🐦
              </a>
              <a href="#" className="bg-gray-800 hover:bg-yellow-400 hover:text-gray-900 w-9 h-9 rounded-full flex items-center justify-center transition">
                📱
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="flex flex-col gap-2">
              {[
                { to: '/', label: '🏠 Home' },
                { to: '/cart', label: '🛒 Cart' },
                { to: '/wishlist', label: '❤️ Wishlist' },
                { to: '/profile', label: '👤 Profile' },
                { to: '/login', label: '🔐 Login' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-yellow-400 transition text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
            <ul className="flex flex-col gap-2">
              {['Clothing', 'Food', 'Kitchen', 'Footwear', 'Jewelry', 'Art', 'Electronics'].map(cat => (
                <li key={cat}>
                  <Link
                    to={`/?category=${cat}`}
                    className="text-gray-400 hover:text-yellow-400 transition text-sm"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <span>📍</span>
                <span>Mekelle, Tigray, Ethiopia</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <span>📞</span>
                <span>+251 912 345 678</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <span>✉️</span>
                <span>info@gebeyamaekel.com</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <span>⏰</span>
                <span>Mon - Sat: 8AM - 8PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2025 Gebeya Maekel. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-yellow-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-yellow-400 transition">Terms of Service</a>
            <a href="#" className="hover:text-yellow-400 transition">Refund Policy</a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Payments:</span>
            <span className="bg-gray-800 px-3 py-1 rounded-lg text-xs text-yellow-400 font-semibold">Chapa</span>
            <span className="bg-gray-800 px-3 py-1 rounded-lg text-xs text-gray-400">Cash</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;