
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { LOGO_URL } from '../constants';
import ChangePasswordModal from './ChangePasswordModal';
import UserManual from './UserManual';
import FeedbackModal from './FeedbackModal';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: t('dashboard'), icon: 'dashboard' },
    { id: 'projects', label: t('projects'), icon: 'folder_open' },
    { id: 'publications', label: t('publications'), icon: 'article' },
    { id: 'personnel', label: t('personnel'), icon: 'badge' },
    { id: 'utilization', label: t('utilization'), icon: 'handshake' },
    { id: 'ip_mou', label: t('ip_mou'), icon: 'copyright' },
  ];

  // Add User Management tab only for Admins
  if (user?.role === 'Admin') {
    tabs.push({ id: 'users', label: t('users'), icon: 'manage_accounts' });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 z-30 relative">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden"
            >
              <span className="material-icons">menu</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-tnsu-green-50 p-1.5 rounded-lg">
                 <img src={LOGO_URL} alt="TNSU Logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800 leading-tight hidden sm:block">{t('appTitle')}</h1>
                <p className="text-tnsu-green-600 text-xs font-medium hidden sm:block">{t('appSubtitle')}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             {/* Help & Feedback Buttons */}
             <div className="hidden md:flex space-x-2">
               <button 
                 onClick={() => setIsManualOpen(true)}
                 className="p-2 text-gray-400 hover:text-tnsu-green-600 hover:bg-tnsu-green-50 rounded-full transition-colors"
                 title={t('userManual')}
               >
                 <span className="material-icons">help_outline</span>
               </button>
               <button 
                 onClick={() => setIsFeedbackOpen(true)}
                 className="p-2 text-gray-400 hover:text-tnsu-green-600 hover:bg-tnsu-green-50 rounded-full transition-colors"
                 title={t('feedback')}
               >
                 <span className="material-icons">rate_review</span>
               </button>
             </div>

             {/* Language Switcher */}
             <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => setLanguage('th')} 
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${language === 'th' ? 'bg-white text-tnsu-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  TH
                </button>
                <button 
                  onClick={() => setLanguage('en')} 
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${language === 'en' ? 'bg-white text-tnsu-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  EN
                </button>
             </div>

             {/* User Profile */}
             <div className="flex items-center pl-4 border-l border-gray-200 space-x-3">
                <div className="text-right hidden md:block">
                   <div className="text-sm font-bold text-gray-800 flex items-center justify-end">
                      {user?.username}
                      <span className="ml-2 px-1.5 py-0.5 bg-tnsu-green-100 text-tnsu-green-800 text-[10px] rounded uppercase font-bold tracking-wider">{user?.role}</span>
                   </div>
                   <div className="text-xs text-gray-500 font-medium">
                     {language === 'th' ? user?.organization.nameTh : user?.organization.nameEn}
                   </div>
                </div>
                
                <div className="relative group">
                  <button className="w-9 h-9 rounded-full bg-tnsu-green-600 text-white flex items-center justify-center shadow-sm hover:bg-tnsu-green-700 transition-colors">
                    <span className="material-icons text-lg">person</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 hidden group-hover:block transform transition-all origin-top-right z-50">
                    <button
                      onClick={() => setIsChangePasswordOpen(true)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <span className="material-icons text-gray-400 text-sm mr-2">vpn_key</span>
                      Change Password
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <span className="material-icons text-red-400 text-sm mr-2">logout</span>
                      {t('logout')}
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside 
          className={`
            bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'w-64' : 'w-20'}
            hidden lg:flex flex-col
          `}
        >
          <div className="p-4 space-y-2 flex-1 overflow-y-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                  ${activeTab === tab.id 
                    ? 'bg-tnsu-green-50 text-tnsu-green-700 font-semibold shadow-sm ring-1 ring-tnsu-green-200' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${!isSidebarOpen ? 'justify-center px-2' : ''}
                `}
                title={!isSidebarOpen ? tab.label : ''}
              >
                <span className={`material-icons text-xl ${activeTab === tab.id ? 'text-tnsu-green-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                  {tab.icon}
                </span>
                
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 hidden'}`}>
                  {tab.label}
                </span>
                
                {/* Active Indicator Strip */}
                {activeTab === tab.id && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-tnsu-green-600 rounded-r-full"></div>
                )}
              </button>
            ))}
          </div>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
              title={isSidebarOpen ? "Collapse Menu" : "Expand Menu"}
            >
              <span className="material-icons transform transition-transform duration-300" style={{ transform: isSidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                chevron_left
              </span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Mobile Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
           <div className="p-4 border-b border-gray-100 flex justify-between items-center">
             <span className="font-bold text-gray-800">Menu</span>
             <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500">
               <span className="material-icons">close</span>
             </button>
           </div>
           <div className="p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'bg-tnsu-green-50 text-tnsu-green-700 font-semibold' 
                    : 'text-gray-500 hover:bg-gray-50'
                  }
                `}
              >
                <span className="material-icons text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
           </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
          
          {/* Footer */}
          <footer className="mt-12 py-6 border-t border-gray-200 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} {t('appSubtitle')}. All rights reserved.</p>
          </footer>
        </main>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordOpen && <ChangePasswordModal onClose={() => setIsChangePasswordOpen(false)} />}
      
      {/* User Manual Modal */}
      {isManualOpen && <UserManual section={activeTab} onClose={() => setIsManualOpen(false)} />}
      
      {/* Feedback Modal */}
      {isFeedbackOpen && <FeedbackModal onClose={() => setIsFeedbackOpen(false)} />}
    </div>
  );
};

export default Layout;
