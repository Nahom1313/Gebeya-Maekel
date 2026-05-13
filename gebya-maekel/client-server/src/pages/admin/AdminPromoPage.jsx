import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import API_URL from '../../config/api';
const AdminPromoPage = () => {
  const [promos, setPromos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(state => state.auth);

  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxUses: '',
    expiryDate: '',
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/promo`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPromos(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/promo`, form, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSuccess('Promo code created!');
      setForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxUses: '', expiryDate: '' });
      fetchPromos();
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this promo code?')) {
      try {
        await axios.delete(`${API_URL}/api/promo/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setSuccess('Promo code deleted!');
        fetchPromos();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.put(`${API_URL}/api/promo/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchPromos();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🎟️ Promo Codes</h1>
          <p className="text-gray-500 mt-1">Create and manage discount codes</p>
        </div>

        {error && <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl mb-6">{error}</div>}
        {success && <div className="bg-green-100 text-green-600 px-4 py-3 rounded-xl mb-6">{success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New Code</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Promo Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. SAVE20"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={form.discountType}
                    onChange={e => setForm({ ...form, discountType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="percentage">Percentage %</option>
                    <option value="fixed">Fixed ETB</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    placeholder={form.discountType === 'percentage' ? '20' : '100'}
                    value={form.discountValue}
                    onChange={e => setForm({ ...form, discountValue: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Order (ETB)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.minOrderAmount}
                    onChange={e => setForm({ ...form, minOrderAmount: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Uses
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    value={form.maxUses}
                    onChange={e => setForm({ ...form, maxUses: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-xl transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : '+ Create Promo Code'}
              </button>
            </form>
          </div>

          {/* Promo Codes List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Active Codes ({promos.length})
            </h3>
            {promos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🎟️</p>
                <p className="text-gray-400">No promo codes yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
                {promos.map(promo => (
                  <div
                    key={promo._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-mono font-bold text-yellow-500 text-lg">
                          {promo.code}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {promo.discountType === 'percentage'
                            ? `${promo.discountValue}% off`
                            : `ETB ${promo.discountValue} off`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggle(promo._id)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                            promo.isActive
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {promo.isActive ? '✅ Active' : '❌ Inactive'}
                        </button>
                        <button
                          onClick={() => handleDelete(promo._id)}
                          className="bg-red-100 text-red-500 px-3 py-1 rounded-full text-xs font-semibold hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500 mt-2">
                      <span>Used: {promo.usedCount}/{promo.maxUses}</span>
                      <span>Min: ETB {promo.minOrderAmount}</span>
                      <span>Expires: {new Date(promo.expiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPromoPage;