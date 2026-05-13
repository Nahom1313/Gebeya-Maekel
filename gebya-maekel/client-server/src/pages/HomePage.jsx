import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setProducts, setLoading, setError } from '../redux/slices/productSlice';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ProductSkeleton from '../components/ProductSkeleton';
import API_URL from '../config/api';

const categoryKeys = ['All', 'Clothing', 'Food', 'Kitchen', 'Footwear', 'Jewelry', 'Art', 'Electronics', 'Other'];

const HomePage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { products, loading, error } = useSelector(state => state.products);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        dispatch(setLoading(true));
        const { data } = await axios.get(`${API_URL}/api/products`);
        dispatch(setProducts(data));
        dispatch(setLoading(false));
      } catch (err) {
        dispatch(setError(err.message));
        dispatch(setLoading(false));
      }
    };
    fetchProducts();
  }, [dispatch]);

  // Max price from products
  const maxPrice = Math.max(...products.map(p => p.price), 10000);

  const filteredProducts = products
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .filter(p => p.rating >= minRating)
    .filter(p => !inStockOnly || p.countInStock > 0)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSortBy('default');
    setPriceRange([0, maxPrice]);
    setMinRating(0);
    setInStockOnly(false);
  };

  const activeFiltersCount = [
    selectedCategory !== 'All',
    priceRange[0] > 0 || priceRange[1] < maxPrice,
    minRating > 0,
    inStockOnly,
    sortBy !== 'default',
  ].filter(Boolean).length;

  if (loading) return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="bg-gray-900 dark:bg-gray-950 text-white py-12 md:py-16 px-4 md:px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-3 md:mb-4">
          Welcome to Gebeya Maekel
        </h1>
        <div className="max-w-xl mx-auto">
          <div className="w-full h-12 bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <ProductSkeleton key={i} />)}
        </div>
      </div>
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

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          {/* Categories */}
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
                {cat}
              </button>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              🎛️ Filters
              {activeFiltersCount > 0 && (
                <span className="bg-gray-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest First</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Advanced Filters</h3>
              <button
                onClick={clearFilters}
                className="text-yellow-500 hover:underline text-sm"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  💰 Price Range: ETB {priceRange[0].toLocaleString()} — ETB {priceRange[1].toLocaleString()}
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-8">Min</span>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="flex-1 accent-yellow-400"
                    />
                    <span className="text-xs text-gray-500 w-16 text-right">ETB {priceRange[0]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-8">Max</span>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="flex-1 accent-yellow-400"
                    />
                    <span className="text-xs text-gray-500 w-16 text-right">ETB {priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  ⭐ Minimum Rating
                </label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                        minRating === rating
                          ? 'bg-yellow-400 text-gray-900'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-yellow-100'
                      }`}
                    >
                      {rating === 0 ? 'All' : `${rating}★`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  📦 Availability
                </label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setInStockOnly(!inStockOnly)}
                      className={`w-12 h-6 rounded-full transition relative ${
                        inStockOnly ? 'bg-yellow-400' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                        inStockOnly ? 'right-0.5' : 'left-0.5'
                      }`}></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      In stock only
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 md:mb-6">
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          {search && ` for "${search}"`}
        </p>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 md:p-12 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl">No products found</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-yellow-500 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map(product => (
              <div
                key={product._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 group"
              >
                <div className="overflow-hidden h-36 md:h-48 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => { e.target.src = 'https://placehold.co/300x300' }}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {product.countInStock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-sm bg-red-500 px-3 py-1 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {product.countInStock > 0 && product.countInStock <= 5 && (
                    <div className="absolute top-2 left-2">
                      <span className="text-white font-bold text-xs bg-orange-500 px-2 py-1 rounded-full">
                        Only {product.countInStock} left!
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <span className="text-xs text-yellow-500 font-semibold uppercase tracking-wide">
                    {product.category}
                  </span>
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm md:text-lg mt-1 mb-1 truncate">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  {product.numReviews > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-yellow-400 text-xs">
                        {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
                      </span>
                      <span className="text-gray-400 text-xs">({product.numReviews})</span>
                    </div>
                  )}

                  <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mb-2 md:mb-3 truncate">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-yellow-500 font-bold text-sm md:text-lg">
                      ETB {product.price.toLocaleString()}
                    </span>
                    <Link
                      to={`/product/${product._id}`}
                      className="bg-gray-900 dark:bg-yellow-400 dark:text-gray-900 text-white text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-yellow-400 hover:text-gray-900 transition whitespace-nowrap"
                    >
                      View
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