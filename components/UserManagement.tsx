
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ALL_ORGANIZATIONS } from '../constants';

interface UserManagementProps {
  users: User[];
  onAdd: () => void;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onBulkAdd: (users: User[]) => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAdd, onEdit, onDelete, onBulkAdd }) => {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (language === 'th' ? u.organization.nameTh : u.organization.nameEn).toLowerCase().includes(search.toLowerCase())
  );

  const handleDownloadTemplate = () => {
    // Simple CSV content
    const csvContent = "data:text/csv;charset=utf-8,Username,Email,Role (Admin/User),Organization ID\nuser1,user1@tnsu.ac.th,User,c_chiangmai\nadmin2,admin2@tnsu.ac.th,Admin,c_bangkok";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tnsu_users_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const findOrganization = (idOrName: string) => {
    const term = idOrName.trim().toLowerCase();
    return ALL_ORGANIZATIONS.find(org => 
      org.id.toLowerCase() === term || 
      org.nameEn.toLowerCase() === term ||
      org.nameTh.toLowerCase() === term
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const rows = text.split('\n').slice(1); // Skip header
        const newUsers: User[] = [];

        for (const row of rows) {
          if (!row.trim()) continue;
          
          // Simple split by comma (doesn't handle commas inside quotes, but fine for simple usernames/emails)
          const cols = row.split(',').map(c => c.trim());
          if (cols.length < 4) continue;

          const [username, email, roleStr, orgStr] = cols;
          const org = findOrganization(orgStr);

          if (username && email && org) {
            newUsers.push({
              id: `user_${Math.random().toString(36).substr(2, 9)}`,
              username,
              email,
              role: roleStr.toLowerCase() === 'admin' ? 'Admin' : 'User',
              password: 'TNSU1234', // Default password for bulk import
              organization: org
            });
          }
        }

        if (newUsers.length > 0) {
          await onBulkAdd(newUsers);
          alert(`${t('importSuccess')} (${newUsers.length} users)`);
        } else {
          alert(t('importError'));
        }
      } catch (error) {
        console.error(error);
        alert(t('importError'));
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
         <h2 className="text-2xl font-bold text-gray-800">{t('users')}</h2>
         
         <div className="flex space-x-3">
            <button 
              onClick={handleDownloadTemplate}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm flex items-center transition-colors"
            >
              <span className="material-icons text-base mr-2">download</span>
              {t('downloadTemplate')}
            </button>

            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center transition-colors disabled:opacity-50"
              >
                {isImporting ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                ) : (
                  <span className="material-icons text-base mr-2">upload_file</span>
                )}
                {isImporting ? t('processing') : t('importCsv')}
              </button>
            </div>

            <button 
              onClick={onAdd}
              className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg flex items-center shadow-md transition-colors"
            >
              <span className="material-icons mr-2">person_add</span>
              {t('addUser')}
            </button>
         </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm transition-all"
          />
          <span className="material-icons absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('username')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('role')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('campusOrg')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('email')}</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center">
                     <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                       <span className="material-icons text-sm">person</span>
                     </div>
                     <span className="text-sm font-medium text-gray-900">{user.username}</span>
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {language === 'th' ? user.organization.nameTh : user.organization.nameEn}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => onEdit(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    {t('edit')}
                  </button>
                  <button 
                    onClick={() => onDelete(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    {t('delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
