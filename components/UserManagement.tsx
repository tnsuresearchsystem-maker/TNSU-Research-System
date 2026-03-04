
import React, { useState, useEffect } from 'react';
import { User, SystemLog, OrganizationType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ALL_ORGANIZATIONS } from '../constants';
import { getSystemLogs, sendUserPasswordResetEmail } from '../services/dbService';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import CSVImportModal from './CSVImportModal';

interface UserManagementProps {
  users: User[];
  onAdd: () => void;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onBulkAdd: (users: User[]) => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAdd, onEdit, onDelete, onBulkAdd }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL'); // New Filter State
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Pagination State for Logs
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [lastLogDoc, setLastLogDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);

  useEffect(() => {
    if (activeTab === 'logs' && logs.length === 0) {
      fetchLogs(true);
    }
  }, [activeTab]);

  const fetchLogs = async (isInitial = false) => {
    setLoadingLogs(true);
    // If initial load, start from null. If load more, use lastLogDoc
    const cursor = isInitial ? null : lastLogDoc;
    const { logs: newLogs, lastDoc } = await getSystemLogs(cursor);
    
    if (isInitial) {
      setLogs(newLogs);
    } else {
      setLogs(prev => [...prev, ...newLogs]);
    }
    
    setLastLogDoc(lastDoc);
    
    // Assume if we got fewer than requested (20), we reached the end
    if (newLogs.length < 20) {
       setHasMoreLogs(false);
    } else {
       setHasMoreLogs(true);
    }
    
    setLoadingLogs(false);
  };

  const handleResetPassword = async (email: string) => {
    if (confirm(t('confirmResetPassword').replace('{email}', email))) {
       const result = await sendUserPasswordResetEmail(email);
       if (result.success) {
         alert(t('resetPasswordSuccess'));
       } else {
         alert(t('resetPasswordError') + result.message);
       }
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (language === 'th' ? u.organization.nameTh : u.organization.nameEn).toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === 'ALL' || u.organization.type === filterType;

    return matchesSearch && matchesType;
  });

  const findOrganization = (idOrName: string) => {
    const term = idOrName.trim().toLowerCase();
    return ALL_ORGANIZATIONS.find(org => 
      org.id.toLowerCase() === term || 
      org.nameEn.toLowerCase() === term ||
      org.nameTh.toLowerCase() === term
    );
  };

  const handleImportUsers = async (data: any[]) => {
    const newUsers: User[] = [];
    for (const row of data) {
      // Basic validation
      if (!row.username || !row.email || !row.role || !row.campus_id) continue;

      const org = findOrganization(row.campus_id);
      if (org) {
        newUsers.push({
          id: `user_${Math.random().toString(36).substr(2, 9)}`,
          username: row.username,
          email: row.email,
          role: row.role.toLowerCase() === 'admin' ? 'Admin' : 'User',
          password: 'TNSU1234', // Default password
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
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'users' ? 'border-b-2 border-tnsu-green-600 text-tnsu-green-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="material-icons text-sm mr-2 align-middle">group</span>
          {t('userList')}
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'logs' ? 'border-b-2 border-tnsu-green-600 text-tnsu-green-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('logs')}
        >
          <span className="material-icons text-sm mr-2 align-middle">history</span>
          {t('systemLogs')}
        </button>
      </div>

      {activeTab === 'users' ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex gap-2 w-full md:w-auto flex-grow max-w-2xl">
                {/* Search Box */}
                <div className="relative flex-grow">
                  <input 
                    type="text" 
                    placeholder={t('searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm transition-all"
                  />
                  <span className="material-icons absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
                </div>

                {/* Filter Dropdown */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-gray-700"
                >
                  <option value="ALL">{language === 'th' ? 'ทั้งหมด (All)' : 'All Organizations'}</option>
                  <option value={OrganizationType.Campus}>{language === 'th' ? 'วิทยาเขต (Campuses)' : 'Campuses'}</option>
                  <option value={OrganizationType.SportsSchool}>{language === 'th' ? 'โรงเรียนกีฬา (Sports Schools)' : 'Sports Schools'}</option>
                  <option value={OrganizationType.OfficePresident}>{language === 'th' ? 'สนง.อธิการบดี (Office)' : 'Office of President'}</option>
                </select>
             </div>
             
             <div className="flex space-x-3">
                <button 
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center transition-colors shadow-sm"
                >
                  <span className="material-icons text-base mr-2">upload_file</span>
                  <span className="hidden lg:inline">{t('importCsv')}</span>
                </button>

                <button 
                  onClick={onAdd}
                  className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg flex items-center shadow-md transition-colors"
                >
                  <span className="material-icons mr-2">person_add</span>
                  {t('addUser')}
                </button>
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
                {filteredUsers.length > 0 ? filteredUsers.map(user => (
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
                      <div className="text-xs text-gray-400">
                        {user.organization.type === OrganizationType.OfficePresident ? (language === 'th' ? 'ส่วนกลาง' : 'Central') : 
                         user.organization.type === OrganizationType.Campus ? (language === 'th' ? 'วิทยาเขต/คณะ' : 'Campus/Faculty') : 
                         (language === 'th' ? 'โรงเรียนกีฬา' : 'Sports School')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button 
                          onClick={() => handleResetPassword(user.email)}
                          className="text-orange-500 hover:text-orange-700 p-1 hover:bg-orange-50 rounded"
                          title="Reset Password (Email)"
                        >
                          <span className="material-icons text-lg">vpn_key</span>
                        </button>
                        <button 
                          onClick={() => onEdit(user)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                          title={t('edit')}
                        >
                          <span className="material-icons text-lg">edit</span>
                        </button>
                        <button 
                          onClick={() => onDelete(user.id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title={t('delete')}
                        >
                          <span className="material-icons text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                   <tr>
                     <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                       {t('noUsersFound')}
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Logs View (Paginated) */
        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
          <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
             <h3 className="text-gray-700 font-bold flex items-center">
               <span className="material-icons text-gray-500 mr-2">list_alt</span>
               {t('systemLogs')}
             </h3>
             <button onClick={() => fetchLogs(true)} className="text-sm text-blue-600 hover:underline">{t('refresh')}</button>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('logTime')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('logUser')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('logAction')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('logDetails')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length > 0 ? logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                    {new Date(log.timestamp).toLocaleString(language === 'th' ? 'th-TH' : 'en-US')}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-900">
                    {log.actor_username}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                     <span className={`px-2 py-1 rounded text-xs font-bold 
                       ${log.action_type === 'LOGIN' ? 'bg-green-100 text-green-800' : 
                         log.action_type === 'DELETE' ? 'bg-red-100 text-red-800' : 
                         log.action_type === 'CREATE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                       {log.action_type}
                     </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{log.details}</td>
                </tr>
              )) : (
                !loadingLogs && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-400">{t('noLogsFound')}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {/* Load More Button - Only shows if there are more logs to fetch */}
          {hasMoreLogs && (
            <div className="p-4 border-t border-gray-200 text-center">
              <button 
                onClick={() => fetchLogs(false)}
                disabled={loadingLogs}
                className="text-sm font-medium text-tnsu-green-600 hover:text-tnsu-green-800 disabled:opacity-50 flex items-center justify-center mx-auto"
              >
                {loadingLogs ? (
                    <>
                        <span className="animate-spin h-4 w-4 border-2 border-tnsu-green-600 border-t-transparent rounded-full mr-2"></span>
                        {t('loading')}
                    </>
                ) : t('loadMoreLogs')}
              </button>
            </div>
          )}
        </div>
      )}
      
      {showImportModal && (
        <CSVImportModal
          type="user"
          onImport={handleImportUsers}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
};

export default UserManagement;
