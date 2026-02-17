
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { LOGO_URL } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();

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
      <header className="bg-tnsu-green-800 text-white shadow-xl relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-tnsu-green-700 rounded-full opacity-50 blur-3xl"></div>

        <div className="container mx-auto px-6 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-1 rounded-full shadow-md">
               <img src={LOGO_URL} alt="TNSU Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{t('appTitle')}</h1>
              <p className="text-tnsu-green-200 text-xs font-light">{t('appSubtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
             {/* Language Switcher */}
             <div className="flex bg-tnsu-green-900/50 rounded-full p-1 backdrop-blur-sm">
                <button 
                  onClick={() => setLanguage('th')} 
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${language === 'th' ? 'bg-white text-tnsu-green-800 shadow-sm' : 'text-tnsu-green-200 hover:text-white'}`}
                >
                  TH
                </button>
                <button 
                  onClick={() => setLanguage('en')} 
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${language === 'en' ? 'bg-white text-tnsu-green-800 shadow-sm' : 'text-tnsu-green-200 hover:text-white'}`}
                >
                  EN
                </button>
             </div>

             {/* User Profile */}
             <div className="text-right hidden md:block border-r border-tnsu-green-600 pr-6">
                <div className="text-sm font-bold text-white flex items-center justify-end">
                   {user?.username}
                   <span className="ml-2 px-1.5 py-0.5 bg-tnsu-yellow-500 text-tnsu-green-900 text-[10px] rounded uppercase font-bold">{user?.role}</span>
                </div>
                <div className="text-xs text-tnsu-yellow-400 font-medium">
                  {language === 'th' ? user?.organization.nameTh : user?.organization.nameEn}
                </div>
             </div>

             <button 
               onClick={logout}
               className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg flex items-center transition-colors border border-white/10"
             >
               <span className="material-icons text-sm mr-2">logout</span>
               {t('logout')}
             </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-[3px] font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-tnsu-green-500 text-tnsu-green-700'
                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
                }`}
              >
                <span className={`material-icons text-xl ${activeTab === tab.id ? 'text-tnsu-green-500' : 'text-gray-400'}`}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center space-x-4 mb-4">
             <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-tnsu-green-50 hover:text-tnsu-green-600 transition-colors cursor-pointer">
                <span className="material-icons text-sm">facebook</span>
             </div>
             <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-tnsu-green-50 hover:text-tnsu-green-600 transition-colors cursor-pointer">
                <span className="material-icons text-sm">language</span>
             </div>
          </div>
          <p className="text-gray-500 text-sm font-light">
            &copy; {new Date().getFullYear()} {t('appSubtitle')}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
