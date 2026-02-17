
import React, { useState, useEffect } from 'react';
import { User, OrganizationType } from '../types';
import { ALL_ORGANIZATIONS } from '../constants';
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
      organization: org
    };

    onSave(userToSave);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

        {/* Password */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password || ''} 
            onChange={handleChange}
            placeholder={initialData ? "******** (Leave empty to keep)" : ""}
            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500"
            required={!initialData}
          />
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

        {/* Organization */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('selectOrg')}</label>
          <select 
            value={selectedOrgId} 
            onChange={(e) => setSelectedOrgId(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500"
            required
          >
            {ALL_ORGANIZATIONS.map(org => (
              <option key={org.id} value={org.id}>
                {language === 'th' ? org.nameTh : org.nameEn}
              </option>
            ))}
          </select>
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
