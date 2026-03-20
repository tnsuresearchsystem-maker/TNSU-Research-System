import React, { useState } from 'react';
import { changeMyPassword, updateUserInDB } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

export const ChangePasswordForm: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [caretaker, setCaretaker] = useState(user?.caretaker || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (!caretaker.trim() || !phoneNumber.trim() || !email.trim()) {
      setError('Please provide coordinator name, phone number, and email.');
      return;
    }

    if (!user) return;

    setLoading(true);
    // Update password and email
    const result = await changeMyPassword(user, oldPassword, newPassword, email);
    
    if (result.success) {
      // Update profile info
      const updatedUser = { 
        ...user, 
        caretaker, 
        phoneNumber, 
        email,
        mustChangePassword: false 
      };
      
      try {
        await updateUserInDB(updatedUser, user);
        updateUser(updatedUser);
      } catch (err: any) {
        setError('Password changed, but failed to update profile info: ' + err.message);
      }
    } else {
      setError(result.message || 'Failed to change password.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">First Time Setup</h2>
        <p className="text-gray-600 mb-6 text-sm text-center">
          Please update your password and contact information before continuing.
        </p>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="caretaker">
              Coordinator Name (ชื่อผู้ประสานงาน)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="caretaker"
              type="text"
              placeholder="Coordinator Name"
              value={caretaker}
              onChange={(e) => setCaretaker(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email Address (อีเมล)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6 border-b pb-6 border-gray-200">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
              Phone Number (เบอร์โทรศัพท์)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="phoneNumber"
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="oldPassword">
              Current Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="oldPassword"
              type="password"
              placeholder="Current Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
              New Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="newPassword"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="confirmPassword"
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-tnsu-green-600 hover:bg-tnsu-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
