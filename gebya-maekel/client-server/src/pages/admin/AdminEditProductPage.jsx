import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const categories = ['Clothing', 'Food', 'Kitchen', 'Footwear', 'Jewelry', 'Art', 'Electronics', 'Other'];

const AdminEditProductPage = () => {
  const { id } = useParams();
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', image: '' });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        setForm({ name: data.name, description: data.description, price: data.price, category: data.category, image: data.image });
      } catch (err) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.category) { setError('Please fill in all required fields.'); return; }
    try {
      setLoading(true);
      setError('');
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append('image', imageFile);

      await axios.put(`http://localhost:5000/api/products/${id}`, formData, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' },
      });
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex justify-center items-center h-64 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-yellow-400"></div>
    </div>
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-6 md:py-10 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-4 text-gray-500 dark:text-gray-400 hover:text-yellow-500 transition text-sm flex items-center gap-1">
          ← Back
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">✏️ Edit Product</h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 md:p-8">
          {error && (
            <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {form.image && (
            <div className="mb-4">
              <img
                src={form.image}
                alt="Current"
                onError={(e) => { e.target.src = 'https://placehold.co/300x200' }}
                className="w-full h-40 object-cover rounded-xl"
              />
            </div>
          )}

          <div className="space-y-4">
            {[
              { name: 'name', label: 'Product Name *', type: 'text' },
              { name: 'price', label: 'Price (ETB) *', type: 'number' },
              { name: 'image', label: 'Image URL', type: 'text' },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                <input
                  name={field.name}
                  type={field.type}
                  value={form[field.name]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm md:text-base"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload New Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files[0])}
                className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200 dark:file:bg-yellow-900/30 dark:file:text-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm md:text-base"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm md:text-base resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-gray-900 font-bold py-3 rounded-xl transition text-sm md:text-base"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditProductPage;