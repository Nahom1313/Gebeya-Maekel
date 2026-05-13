import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { toggleTheme } from '../redux/slices/themeSlice';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useSelector(state => state.auth);
  const { cartItems } = useSelector(state => state.cart);
  const { wishlistItems } = useSelector(state => state.wishlist);
  const { darkMode } = useSelector(state => state.theme);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setMenuOpen(false);
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en');
  };

  const LangButton = ({ mobile }) => (
    <button
      onClick={toggleLanguage}
      className={`font-semibold transition rounded-lg ${
        mobile
          ? 'bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm text-white'
          : 'bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm text-white'
      }`}
    >
      {i18n.language === 'en' ? '🇪🇹 አማ' : '🇬🇧 EN'}
    </button>
  );

  return (
    <nav className="bg-gray-900 dark:bg-gray-950 text-white px-6 py-4 shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-xl md:text-2xl font-bold text-yellow-400 tracking-wide">
          🛒 {t('nav.brand')}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <LangButton />
          <button
            onClick={() => dispatch(toggleTheme())}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition text-lg"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <Link to="/cart" className="relative flex items-center gap-1 hover:text-yellow-400 transition">
            🛒 {t('nav.cart')}
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </Link>

          <Link to="/wishlist" className="relative hover:text-yellow-400 transition">
            ❤️ {t('nav.wishlist')}
            {wishlistItems.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Admin Link */}
          {user?.isAdmin && (
            <Link to="/admin" className="hover:text-yellow-400 transition">
              ⚙️ {t('nav.admin')}
            </Link>
          )}

          {/* 👇 Added Desktop Delivery Link */}
          {user?.isDelivery && (
            <Link to="/delivery" className="hover:text-yellow-400 transition">
              🚚 {t('nav.delivery') || 'Deliveries'}
            </Link>
          )}

          {user ? (
            <>
              <Link to="/profile" className="hover:text-yellow-400 transition">
                👤 {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-yellow-400 transition">{t('nav.login')}</Link>
              <Link
                to="/register"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-lg transition"
              >
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Right Side Icons */}
        <div className="flex md:hidden items-center gap-2">
          <LangButton mobile />
          <button
            onClick={() => dispatch(toggleTheme())}
            className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-lg transition"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <Link to="/cart" className="relative px-1">
            🛒
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </Link>
          <Link to="/wishlist" className="relative px-1">
            ❤️
            {wishlistItems.length > 0 && (
              <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-lg transition text-xl"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 bg-gray-800 dark:bg-gray-900 rounded-xl px-6 py-4">
          {user?.isAdmin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition py-1">
              ⚙️ {t('nav.admin')}
            </Link>
          )}
          
          {/* 👇 Added Mobile Delivery Link (Inside Auth Check) */}
          {user?.isDelivery && (
            <Link to="/delivery" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition py-1">
              🚚 {t('nav.delivery') || 'Deliveries'}
            </Link>
          )}

          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition py-1">
                👤 {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition text-left"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition py-1">
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-lg transition text-center"
              >
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;