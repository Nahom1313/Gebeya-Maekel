import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setProducts, setLoading, setError } from '../redux/slices/productSlice';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const categoryKeys = ['All', 'Clothing', 'Food', 'Kitchen', 'Footwear', 'Jewelry', 'Art', 'Electronics', 'Other'];

const HomePage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { products, loading, error } = useSelector(state => state.products);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.get('http://localhost:5000/api/products');
        dispatch(setProducts(data));
        dispatch(setLoading(false));
      } catch (err) {
        dispatch(setError(err.message));
        dispatch(setLoading(false));
      }
    };
    fetchProducts();
  }, [dispatch]);

  const filteredProducts = products
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  if (loading) return (
    <div className="flex justify-center items-center h-64 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400"></div>
    </div>
  );

  if (error) return (
    <div className="text-center text-red-500 mt-10 px-4">{error}</div>
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Hero */}
      <div className="bg-gray-900 dark:bg-gray-950 text-white py-12 md:py-16 px-4 md:px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-3 md:mb-4">
          {t('home.hero_title')}
        </h1>
        <p className="text-gray-300 text-base md:text-lg mb-6 md:mb-8">
          {t('home.hero_subtitle')}
        </p>
        <div className="max-w-xl mx-auto relative">
          <input
            type="text"
            placeholder={t('home.search_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-5 md:px-6 py-3 md:py-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base md:text-lg"
          />
          <span className="absolute right-5 top-3 md:top-4 text-gray-400 text-xl">🔍</span>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {categoryKeys.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-white dark:bg-gray-800 dark:text-gray-200 text-gray-600 hover:bg-yellow-100 dark:hover:bg-gray-700'
                }`}
              >
                {t(`categories.${cat}`)}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full sm:w-auto"
            >
              <option value="default">{t('home.sort_default')}</option>
              <option value="price-asc">{t('home.sort_price_asc')}</option>
              <option value="price-desc">{t('home.sort_price_desc')}</option>
              <option value="name">{t('home.sort_name')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 md:mb-6">
          {t('home.showing')} {filteredProducts.length} {filteredProducts.length !== 1 ? t('home.products') : t('home.product')}
          {selectedCategory !== 'All' && ` ${t('home.in')} ${t(`categories.${selectedCategory}`)}`}
          {search && ` ${t('home.for')} "${search}"`}
        </p>

        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 md:p-12 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl">{t('home.no_products')}</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); }}
              className="mt-4 text-yellow-500 hover:underline"
            >
              {t('home.clear_filters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map(product => (
              <div
                key={product._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 group"
              >
                <div className="overflow-hidden h-36 md:h-48">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => { e.target.src = 'https://placehold.co/300x300' }}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-3 md:p-4">
                  <span className="text-xs text-yellow-500 font-semibold uppercase tracking-wide">
                    {t(`categories.${product.category}`) || product.category}
                  </span>
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm md:text-lg mt-1 mb-1 truncate">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mb-2 md:mb-3 truncate">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-yellow-500 font-bold text-sm md:text-lg">
                      ETB {product.price}
                    </span>
                    <Link
                      to={`/product/${product._id}`}
                      className="bg-gray-900 dark:bg-yellow-400 dark:text-gray-900 text-white text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-yellow-400 hover:text-gray-900 transition whitespace-nowrap"
                    >
                      {t('home.view')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;