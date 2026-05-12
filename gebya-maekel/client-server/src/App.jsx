import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCreateProductPage from './pages/admin/AdminCreateProductPage';
import AdminEditProductPage from './pages/admin/AdminEditProductPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AIChatbot from './components/AIchatbot';

function App() {
  const { darkMode } = useSelector(state => state.theme);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

 return (
  <div className={darkMode ? 'dark' : ''}>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-success" element={<OrderSuccessPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
      <Route path="/admin/products/create" element={<AdminRoute><AdminCreateProductPage /></AdminRoute>} />
      <Route path="/admin/products/edit/:id" element={<AdminRoute><AdminEditProductPage /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
    </Routes>
    <AIChatbot />
  </div>
);
}

export default App;