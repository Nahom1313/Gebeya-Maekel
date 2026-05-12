import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const OrderSuccessPage = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12 max-w-md w-full text-center">
        <div className="text-6xl md:text-7xl mb-4">🎉</div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-3">{t('order_success.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm md:text-base">{t('order_success.subtitle')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-xl transition text-sm md:text-base">{t('order_success.continue')}</Link>
          <Link to="/profile" className="border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-yellow-400 hover:text-yellow-500 font-semibold px-6 py-3 rounded-xl transition text-sm md:text-base">{t('order_success.profile')}</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;