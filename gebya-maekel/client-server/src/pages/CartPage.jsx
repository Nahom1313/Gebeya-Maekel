import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../redux/slices/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { cartItems } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartItems.length === 0) return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl mb-4">🛒</p>
      <h2 className="text-xl md:text-2xl font-bold text-gray-700 dark:text-white mb-2">{t('cart.empty_title')}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm md:text-base">{t('cart.empty_subtitle')}</p>
      <Link to="/" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-xl transition">
        {t('cart.browse')}
      </Link>
    </div>
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-6 md:py-10 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">🛒 {t('cart.title')}</h1>
          <button onClick={() => dispatch(clearCart())} className="text-sm text-red-500 hover:underline self-start sm:self-auto">
            {t('cart.clear')}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            {cartItems.map(item => (
              <div key={item._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => { e.target.src = 'https://placehold.co/100x100' }}
                  className="w-full sm:w-20 h-40 sm:h-20 object-cover rounded-lg"
                />
                <div className="flex-1 w-full">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm md:text-base">{item.name}</h3>
                  <p className="text-yellow-500 font-bold text-sm md:text-base">ETB {item.price}</p>
                  <div className="flex items-center justify-between mt-2 gap-3 flex-wrap">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <button onClick={() => dispatch(updateQuantity({ _id: item._id, quantity: Math.max(1, item.quantity - 1) }))} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-yellow-100 dark:hover:bg-gray-600 transition font-bold">−</button>
                      <span className="px-3 py-1 text-gray-800 dark:text-white font-semibold bg-white dark:bg-gray-800 text-sm">{item.quantity}</span>
                      <button onClick={() => dispatch(updateQuantity({ _id: item._id, quantity: item.quantity + 1 }))} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-yellow-100 dark:hover:bg-gray-600 transition font-bold">+</button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm">ETB {(item.price * item.quantity).toLocaleString()}</span>
                      <button onClick={() => dispatch(removeFromCart(item._id))} className="text-red-400 hover:text-red-600 transition text-sm">🗑 {t('cart.remove')}</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-80">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 md:p-6 sticky top-24">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-4">{t('cart.summary')}</h2>
              <div className="space-y-2 mb-4 text-sm md:text-base">
                {cartItems.map(item => (
                  <div key={item._id} className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span className="truncate mr-2">{item.name} x{item.quantity}</span>
                    <span className="whitespace-nowrap">ETB {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between font-bold text-gray-800 dark:text-white text-base md:text-lg">
                <span>{t('cart.total')}</span>
                <span>ETB {total.toLocaleString()}</span>
              </div>
              <button
                onClick={() => user ? navigate('/checkout') : navigate('/login')}
                className="mt-5 w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-xl transition text-sm md:text-base"
              >
                {user ? t('cart.checkout') : t('cart.login_checkout')}
              </button>
              <Link to="/" className="mt-3 block text-center text-sm text-gray-500 dark:text-gray-400 hover:text-yellow-500 transition">
                ← {t('cart.continue')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;