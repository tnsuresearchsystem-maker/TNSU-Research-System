
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ALL_ORGANIZATIONS, CENTRAL_OFFICE, CAMPUSES, SPORTS_SCHOOLS, FACULTIES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface UserFormProps {
  onSave: (user: User) => void;
  onCancel: () => void;
  initialData?: User | null;
}

const UserForm: React.FC<UserFormProps> = ({ onSave, onCancel, initialData }) => {
  const { t, language } = useLanguage();
  
  const [formData, setFormData] = useState<Partial<User>>({
    role: 'User',
    organization: ALL_ORGANIZATIONS[0]
  });

  const [selectedOrgId, setSelectedOrgId] = useState<string>(ALL_ORGANIZATIONS[0].id);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSelectedOrgId(initialData.organization.id);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email) return;

    // Find full org object
    const org = ALL_ORGANIZATIONS.find(o => o.id === selectedOrgId);
    if (!org) return;

    const userToSave: User = {
      id: initialData?.id || `user_${Math.random().toString(36).substr(2, 6)}`,
      username: formData.username!,
      email: formData.email!,
      role: formData.role || 'User',
      password: formData.password || (initialData ? initialData.password : 'password123'), // Keep old password if editing and not changed, default for new
      organization: org,
      mustChangePassword: formData.mustChangePassword !== undefined ? formData.mustChangePassword : true, // Default to true for new users
      fullName: formData.fullName || undefined,
      caretaker: formData.caretaker || undefined,
      phoneNumber: formData.phoneNumber || undefined
    };

    onSave(userToSave);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="material-icons mr-2">{initialData ? 'edit' : 'person_add'}</span>
        {initialData ? t('editUser') : t('addUser')}
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Username */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('username')}</label>
          <input 
            type="text" 
            name="username" 
            value={formData.username || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500"
            required
            disabled={!!initialData} // Prevent changing username
          />
        </div>

        {/* Email */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500"
            required
          />
        </div>

        {/* Full Name */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('fullName')}</label>
          <input 
            type="text" 
            name="fullName" 
            value={formData.fullName || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500"
          />
        </div>

        {/* Caretaker */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('caretaker')}</label>
          <input 
            type="text" 
            name="caretaker" 
            value={formData.caretaker || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500"
          />
        </div>

        {/* Phone Number */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('phoneNumber')}</label>
          <input 
            type="tel" 
            name="phoneNumber" 
            value={formData.phoneNumber || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500"
          />
        </div>

        {/* Password */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password || ''} 
            onChange={handleChange}
            placeholder={initialData ? t('passwordPlaceholderEdit') : t('passwordPlaceholderNew')}
            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500"
            required={!initialData}
          />
          {initialData && <p className="text-xs text-blue-500 mt-1">{t('passwordResetHint')}</p>}
        </div>

        {/* Role */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('role')}</label>
          <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500"
            required
          >
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
        </div>

        {/* Organization - Grouped for Better UX */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('selectOrg')}</label>
          <select 
            value={selectedOrgId} 
            onChange={(e) => setSelectedOrgId(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500"
            required
          >
            <optgroup label={language === 'th' ? "สำนักงานอธิการบดี (Office of President)" : "Office of the President"}>
                {CENTRAL_OFFICE.map(org => (
                  <option key={org.id} value={org.id}>{language === 'th' ? org.nameTh : org.nameEn}</option>
                ))}
            </optgroup>
            
            <optgroup label={language === 'th' ? "วิทยาเขต (Campuses)" : "Campuses"}>
                {CAMPUSES.map(org => (
                  <option key={org.id} value={org.id}>{language === 'th' ? org.nameTh : org.nameEn}</option>
                ))}
            </optgroup>

            <optgroup label={language === 'th' ? "คณะวิชา (Faculties)" : "Faculties"}>
                {FACULTIES.map(org => (
                  <option key={org.id} value={org.id}>{language === 'th' ? org.nameTh : org.nameEn}</option>
                ))}
            </optgroup>

            <optgroup label={language === 'th' ? "โรงเรียนกีฬา (Sports Schools)" : "Sports Schools"}>
                {SPORTS_SCHOOLS.map(org => (
                  <option key={org.id} value={org.id}>{language === 'th' ? org.nameTh : org.nameEn}</option>
                ))}
            </optgroup>
          </select>
        </div>

        {/* Must Change Password Checkbox */}
        <div className="col-span-2 flex items-center mt-2">
          <input
            type="checkbox"
            id="mustChangePassword"
            name="mustChangePassword"
            checked={formData.mustChangePassword !== undefined ? formData.mustChangePassword : true}
            onChange={handleChange}
            className="h-4 w-4 text-tnsu-green-600 focus:ring-tnsu-green-500 border-gray-300 rounded"
          />
          <label htmlFor="mustChangePassword" className="ml-2 block text-sm text-gray-900">
            Require user to change password on next login
          </label>
        </div>

        <div className="col-span-2 flex justify-end space-x-3 mt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            {t('cancel')}
          </button>
          <button 
            type="submit" 
            className="px-8 py-2.5 bg-tnsu-green-600 text-white rounded-lg hover:bg-tnsu-green-700 shadow-md font-medium"
          >
            {t('save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
