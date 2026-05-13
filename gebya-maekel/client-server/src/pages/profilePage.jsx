import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import API_URL from '../config/api';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      setLoading(true); setError('');
      const { data } = await axios.put(`${API_URL}/api/auth/profile`, form, { headers: { Authorization: `Bearer ${user.token}` } });
      dispatch(setUser({ ...data, token: user.token }));
      setSuccess(t('profile.success'));
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-6 md:py-10 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">👤 {t('profile.title')}</h1>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-3xl font-bold text-gray-900 shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user?.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
              {user?.isAdmin && (
                <span className="inline-block mt-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full">Admin</span>
              )}
            </div>
          </div>

          {success && <div className="mb-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">{success}</div>}
          {error && <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <div className="space-y-4">
            {[
              { name: 'name', label: t('profile.full_name'), type: 'text', placeholder: '' },
              { name: 'email', label: t('profile.email'), type: 'email', placeholder: '' },
              { name: 'password', label: t('profile.new_password'), type: 'password', placeholder: t('profile.password_placeholder') },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                <input name={field.name} type={field.type} value={form[field.name]} onChange={handleChange} placeholder={field.placeholder} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm md:text-base" />
              </div>
            ))}
            <button onClick={handleSubmit} disabled={loading} className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-gray-900 font-bold py-3 rounded-xl transition text-sm md:text-base">
              {loading ? t('profile.saving') : t('profile.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;