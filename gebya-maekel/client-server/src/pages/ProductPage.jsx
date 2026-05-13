import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { useTranslation } from 'react-i18next';
import ProductDetailSkeleton from '../components/ProductDetailSkeleton';
import axios from 'axios';
import API_URL from '../config/api';

// Simple Star Rating Helper
const StarRating = ({ rating }) => {
  return (
    <div className="flex text-yellow-400 text-xs">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>{star <= rating ? '★' : '☆'}</span>
      ))}
    </div>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { wishlistItems } = useSelector(state => state.wishlist);
  const { user } = useSelector(state => state.auth);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const isWishlisted = wishlistItems.some(item => item._id === id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = () => {
    if (isWishlisted) dispatch(removeFromWishlist(product._id));
    else dispatch(addToWishlist(product));
  };

  if (loading) return <ProductDetailSkeleton />;

  if (error) return (
    <div className="text-center text-red-500 mt-10 px-4 dark:bg-gray-900 min-h-screen">{error}</div>
  );

  if (!product) return null;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-6 md:py-10 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 md:mb-6 text-gray-500 dark:text-gray-400 hover:text-yellow-500 transition text-sm flex items-center gap-1"
        >
          ← {t('product.back')}
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 h-64 md:h-auto">
              <img
                src={product.image}
                alt={product.name}
                onError={(e) => { e.target.src = 'https://placehold.co/600x400' }}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full md:w-1/2 p-5 md:p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs text-yellow-500 font-semibold uppercase tracking-wide">
                  {t(`categories.${product.category}`) || product.category}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-1 mb-2">
                  {product.name}
                </h1>
                <p className="text-2xl md:text-3xl font-bold text-yellow-500 mb-4">
                  ETB {product.price}
                </p>

                <div className="flex items-center gap-3 mb-5">
                  <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">{t('product.qty')}:</span>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-yellow-100 dark:hover:bg-gray-600 transition text-lg font-bold">−</button>
                    <span className="px-4 py-2 text-gray-800 dark:text-white font-semibold bg-white dark:bg-gray-800">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-yellow-100 dark:hover:bg-gray-600 transition text-lg font-bold">+</button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3 rounded-xl font-semibold transition text-sm md:text-base ${added ? 'bg-green-500 text-white' : 'bg-gray-900 dark:bg-yellow-400 dark:text-gray-900 text-white hover:bg-yellow-400 hover:text-gray-900'}`}
                  >
                    {added ? `✓ ${t('product.added_to_cart')}` : `🛒 ${t('product.add_to_cart')}`}
                  </button>
                  <button
                    onClick={handleWishlist}
                    className={`flex-1 py-3 rounded-xl font-semibold border transition text-sm md:text-base ${isWishlisted ? 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-500' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-red-400 hover:text-red-500'}`}
                  >
                    {isWishlisted ? `❤️ ${t('product.wishlisted')}` : `🤍 ${t('product.wishlist')}`}
                  </button>
                </div>

                {user && (
                  <button
                    onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                    className="mt-3 w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition text-sm md:text-base"
                  >
                    ⚡ {t('product.buy_now')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto">
              {['description', 'details', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 md:px-8 py-3 md:py-4 text-sm font-medium capitalize whitespace-nowrap transition border-b-2 ${activeTab === tab ? 'border-yellow-400 text-yellow-500' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-yellow-400'}`}
                >
                  {t(`product.${tab}`)}
                </button>
              ))}
            </div>
            <div className="p-5 md:p-8">
              {activeTab === 'description' && (
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                  {product.description || t('product.no_description')}
                </p>
              )}
              {activeTab === 'details' && (
                <div className="space-y-2 text-sm md:text-base">
                  {[
                    { label: t('product.category'), value: t(`categories.${product.category}`) || product.category },
                    { label: t('product.price'), value: `ETB ${product.price}` },
                    { label: t('product.availability'), value: t('product.in_stock'), green: true },
                  ].map(row => (
                    <div key={row.label} className="flex flex-col sm:flex-row sm:gap-4">
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-32">{row.label}</span>
                      <span className={row.green ? 'text-green-500 font-medium' : 'text-gray-500 dark:text-gray-400'}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === 'reviews' && (
                /* REPLACE STARTS HERE */
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    💬 Customer Reviews ({product.numReviews})
                  </h3>
                  {product.reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-4xl mb-3">💬</p>
                      <p className="text-gray-400">No reviews yet. Be the first!</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
                      {product.reviews.map(review => (
                        <div
                          key={review._id}
                          className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:border-yellow-400 transition"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-gray-900 text-sm">
                                {review.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 dark:text-white text-sm">
                                  {review.name}
                                </p>
                                {review.isVerified && (
                                  <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                                    ✅ Verified Purchase
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-400 text-xs">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="mb-2">
                            <StarRating rating={review.rating} />
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                /* REPLACE ENDS HERE */
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;