import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import API_URL from '../../config/api';
const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleDelivery = async (userId, isDelivery) => {
    try {
      await axios.put(
        `${API_URL}/api/auth/users/${userId}/delivery`,
        { isDelivery: !isDelivery },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSuccess('User updated successfully!');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleAdmin = async (userId, isAdmin) => {
    try {
      await axios.put(
        `${API_URL}/api/auth/users/${userId}/admin`,
        { isAdmin: !isAdmin },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSuccess('User updated successfully!');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">👥 Users</h1>
          <p className="text-gray-500 mt-1">Manage users and roles</p>
        </div>

        {error && <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl mb-6">{error}</div>}
        {success && <div className="bg-green-100 text-green-600 px-4 py-3 rounded-xl mb-6">{success}</div>}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Admin</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Delivery</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr
                  key={u._id}
                  className={`border-b ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'} hover:bg-yellow-50 dark:hover:bg-gray-700 transition`}
                >
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-gray-900">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleAdmin(u._id, u.isAdmin)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        u.isAdmin
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {u.isAdmin ? '✅ Admin' : 'Make Admin'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleDelivery(u._id, u.isDelivery)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        u.isDelivery
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {u.isDelivery ? '🚚 Delivery' : 'Make Delivery'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;