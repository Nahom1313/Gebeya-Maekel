import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AdminCreateProductPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploading(true);
      const { data } = await axios.post(
        'http://localhost:5000/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setImage(data.imageUrl);
      setUploading(false);
    } catch (err) {
      setError('Image upload failed');
      setUploading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!name) {
      setError('Please enter a product name first');
      return;
    }
    try {
      setGenerating(true);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{
                text: `Write a short, compelling product description for an Ethiopian e-commerce store called Gebeya Maekel.
                Product name: ${name}
                Category: ${category || 'General'}
                Price: ${price ? `ETB ${price}` : 'Not set'}
                
                Write 2-3 sentences maximum. Make it appealing and highlight the product's value.
                Only return the description, nothing else.`
              }]
            }]
          })
        }
      );
      const data = await response.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        setDescription(data.candidates[0].content.parts[0].text);
      }
      setGenerating(false);
    } catch (err) {
      setError('Failed to generate description');
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(
        'http://localhost:5000/api/products',
        { name, description, price, category, image, countInStock },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/products" className="text-gray-500 hover:text-yellow-500 transition">
            ← Back
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
            <p className="text-gray-500 mt-1">Fill in the details below</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 flex flex-col gap-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Image
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-yellow-400 transition">
              {image ? (
                <div className="flex flex-col items-center gap-3">
                  <img src={image} alt="preview" className="w-32 h-32 object-cover rounded-xl" />
                  <p className="text-green-500 text-sm font-medium">✅ Image uploaded!</p>
                  <label className="cursor-pointer text-yellow-500 hover:underline text-sm">
                    Change Image
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <span className="text-4xl">📸</span>
                  <span className="text-gray-500 text-sm">Click to upload image</span>
                  {uploading && <span className="text-yellow-500 text-sm animate-pulse">Uploading...</span>}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Name
            </label>
            <input
              type="text"
              placeholder="e.g. Traditional Habesha Kemis"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            />
          </div>

          {/* Description with AI Generate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={generating || !name}
                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>🤖 AI Generate</>
                )}
              </button>
            </div>
            <textarea
              placeholder="Describe your product or click AI Generate..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition resize-none"
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price (ETB)
              </label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Count In Stock
              </label>
              <input
                type="number"
                placeholder="e.g. 10"
                value={countInStock}
                onChange={e => setCountInStock(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            >
              <option value="">Select a category</option>
              <option value="Clothing">Clothing</option>
              <option value="Food">Food</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Footwear">Footwear</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Art">Art</option>
              <option value="Electronics">Electronics</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-gray-900 dark:bg-yellow-400 dark:text-gray-900 text-white py-4 rounded-xl font-semibold text-lg hover:bg-yellow-400 hover:text-gray-900 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                Creating...
              </span>
            ) : (
              '+ Create Product'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateProductPage;