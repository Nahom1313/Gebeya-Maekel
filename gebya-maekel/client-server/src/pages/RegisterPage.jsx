import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) { setError(t('auth.fill_fields')); return; }
    if (form.password !== form.confirmPassword) { setError(t('auth.passwords_match')); return; }
    try {
      setLoading(true);
      const { data } = await axios.post('http://localhost:5000/api/auth/register', { name: form.name, email: form.email, password: form.password });
      dispatch(setUser(data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center px-4 py-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md p-6 md:p-10">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{t('auth.create_account')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base">{t('auth.register_subtitle')}</p>
        </div>
        {error && <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}
        <div className="space-y-4">
          {[
            { name: 'name', label: t('auth.full_name'), type: 'text', placeholder: 'John Doe' },
            { name: 'email', label: t('auth.email'), type: 'email', placeholder: 'you@example.com' },
            { name: 'password', label: t('auth.password'), type: 'password', placeholder: '••••••••' },
            { name: 'confirmPassword', label: t('auth.confirm_password'), type: 'password', placeholder: '••••••••' },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
              <input name={field.name} type={field.type} value={form[field.name]} onChange={handleChange} placeholder={field.placeholder} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm md:text-base" />
            </div>
          ))}
          <button onClick={handleSubmit} disabled={loading} className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-gray-900 font-bold py-3 rounded-xl transition text-sm md:text-base">
            {loading ? t('auth.registering') : t('auth.register')}
          </button>
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-6 text-sm">
          {t('auth.have_account')}{' '}
          <Link to="/login" className="text-yellow-500 hover:underline font-medium">{t('auth.login_link')}</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;