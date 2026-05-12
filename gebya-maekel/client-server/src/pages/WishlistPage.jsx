import { useDispatch, useSelector } from 'react-redux';
import { removeFromWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { wishlistItems } = useSelector(state => state.wishlist);

  if (wishlistItems.length === 0) return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl mb-4">❤️</p>
      <h2 className="text-xl md:text-2xl font-bold text-gray-700 dark:text-white mb-2">{t('wishlist.empty_title')}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm md:text-base">{t('wishlist.empty_subtitle')}</p>
      <Link to="/" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-xl transition">{t('wishlist.browse')}</Link>
    </div>
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-6 md:py-10 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">❤️ {t('wishlist.title')}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {wishlistItems.map(item => (
            <div key={item._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 group">
              <div className="overflow-hidden h-36 md:h-48">
                <img src={item.image} alt={item.name} onError={(e) => { e.target.src = 'https://placehold.co/300x300' }} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
              <div className="p-3 md:p-4">
                <span className="text-xs text-yellow-500 font-semibold uppercase tracking-wide">{t(`categories.${item.category}`) || item.category}</span>
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm md:text-base mt-1 truncate">{item.name}</h3>
                <p className="text-yellow-500 font-bold text-sm md:text-base mt-1 mb-3">ETB {item.price}</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))} className="w-full bg-gray-900 dark:bg-yellow-400 dark:text-gray-900 text-white text-xs md:text-sm py-2 rounded-lg hover:bg-yellow-400 hover:text-gray-900 transition">
                    🛒 {t('wishlist.add_to_cart')}
                  </button>
                  <button onClick={() => dispatch(removeFromWishlist(item._id))} className="w-full border border-red-300 dark:border-red-700 text-red-500 text-xs md:text-sm py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                    🗑 {t('wishlist.remove')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;