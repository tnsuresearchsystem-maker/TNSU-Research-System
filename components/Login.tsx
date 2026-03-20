
import React, { useState } from 'react';
import { OrganizationType } from '../types';
import { CAMPUSES, SPORTS_SCHOOLS, CENTRAL_OFFICE, LOGO_URL } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { login } = useAuth();

  const [orgType, setOrgType] = useState<OrganizationType | ''>('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getOrgList = () => {
    switch (orgType) {
      case OrganizationType.OfficePresident: return CENTRAL_OFFICE;
      case OrganizationType.Campus: return CAMPUSES;
      case OrganizationType.SportsSchool: return SPORTS_SCHOOLS;
      default: return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const orgList = getOrgList();
    const org = orgList.find(o => o.id === selectedOrgId);
    
    if (org && username && password) {
      setLoading(true);
      try {
        const success = await login(username, password, org);
        if (!success) {
          setError(t('loginError'));
        }
      } catch (err: any) {
        setError(err.message || t('loginError'));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tnsu-green-50 via-white to-tnsu-yellow-50 flex flex-col justify-center items-center p-4 font-sans">
       <div className="absolute top-6 right-6 flex space-x-2 z-10">
         <button 
           onClick={() => setLanguage('th')} 
           className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${language === 'th' ? 'bg-tnsu-green-600 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
         >
           ไทย
         </button>
         <button 
           onClick={() => setLanguage('en')} 
           className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${language === 'en' ? 'bg-tnsu-green-600 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
         >
           ENG
         </button>
       </div>

       <div className="bg-white/80 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-tnsu-green-600 to-tnsu-yellow-400"></div>
          
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md p-3 border-4 border-tnsu-green-50">
               <img src={LOGO_URL} alt="TNSU Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-tnsu-green-900">{t('appTitle')}</h1>
            <p className="text-tnsu-green-600 text-sm mt-1">{t('appSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Organization Type */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">{t('selectType')}</label>
              <div className="relative">
                <select 
                  value={orgType} 
                  onChange={(e) => {
                    setOrgType(e.target.value as OrganizationType);
                    setSelectedOrgId('');
                    // Auto-select if it's Office of President as there is only one
                    if (e.target.value === OrganizationType.OfficePresident) {
                       setSelectedOrgId(CENTRAL_OFFICE[0].id);
                    }
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-tnsu-green-400 focus:border-transparent outline-none transition-all appearance-none text-gray-700"
                  required
                >
                  <option value="">-- {t('selectType')} --</option>
                  <option value={OrganizationType.OfficePresident}>{t('typeOffice')}</option>
                  <option value={OrganizationType.Campus}>{t('typeCampus')}</option>
                  <option value={OrganizationType.SportsSchool}>{t('typeSchool')}</option>
                </select>
                <span className="material-icons absolute right-3 top-3.5 text-gray-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            {/* 2. Specific Organization */}
            {orgType && orgType !== OrganizationType.OfficePresident && (
              <div className="space-y-1 animate-fade-in-up">
                <label className="block text-sm font-semibold text-gray-700">{t('selectOrg')}</label>
                <div className="relative">
                  <select 
                    value={selectedOrgId} 
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-tnsu-green-400 focus:border-transparent outline-none transition-all appearance-none text-gray-700"
                    required
                  >
                    <option value="">-- {t('selectOrg')} --</option>
                    {getOrgList().map(org => (
                      <option key={org.id} value={org.id}>
                        {language === 'th' ? org.nameTh : org.nameEn}
                      </option>
                    ))}
                  </select>
                  <span className="material-icons absolute right-3 top-3.5 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>
            )}

            {/* 3. Username */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">
                {t('usernameOrEmail')}
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-tnsu-green-400 focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400"
                  placeholder="admin"
                  required
                />
                <span className="material-icons absolute left-3 top-3.5 text-gray-400">person</span>
              </div>
            </div>

            {/* 4. Password */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">{t('password')}</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-tnsu-green-400 focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
                <span className="material-icons absolute left-3 top-3.5 text-gray-400">lock</span>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{error}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-tnsu-green-600 to-tnsu-green-500 hover:from-tnsu-green-700 hover:to-tnsu-green-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-tnsu-green-200 hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <span className="animate-pulse">Checking...</span> : t('loginButton')}
            </button>
            
            <div className="mt-4 text-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="font-semibold mb-1 text-gray-700">{t('needAccess')}</p>
              <p>{t('needAccessDesc')} <span className="font-bold text-tnsu-green-700">{t('mainAdmin')}</span>.</p>
              <p className="mt-1 text-[10px] text-gray-400">{t('restrictedAccess')}</p>
            </div>
          </form>
       </div>
       
       <div className="mt-8 text-xs text-gray-400 font-light">
          © {new Date().getFullYear()} Thailand National Sports University
       </div>
    </div>
  );
};

export default Login;
