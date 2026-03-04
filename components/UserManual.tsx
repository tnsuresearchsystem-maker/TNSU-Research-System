import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface UserManualProps {
  section: string;
  onClose: () => void;
}

const UserManual: React.FC<UserManualProps> = ({ section, onClose }) => {
  const { t } = useLanguage();

  const getManualContent = () => {
    switch (section) {
      case 'dashboard': return t('manualDashboard');
      case 'projects': return t('manualProjects');
      case 'publications': return t('manualPublications');
      case 'personnel': return t('manualPersonnel');
      case 'utilization': return t('manualUtilization');
      case 'ip_mou': return t('manualIPMOU');
      case 'users': return t('manualUsers');
      default: return t('selectSection');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold text-tnsu-green-800 flex items-center">
            <span className="material-icons mr-2 text-tnsu-green-600">menu_book</span>
            {t('userManual')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="bg-tnsu-green-50 p-4 rounded-lg border border-tnsu-green-100 mb-4">
          <h3 className="font-semibold text-tnsu-green-900 mb-2 capitalize">{section.replace('_', ' ')} Module</h3>
          <p className="text-gray-700 leading-relaxed">{getManualContent()}</p>
        </div>

        <div className="text-sm text-gray-500">
          <p className="font-medium mb-1">{t('tips')}</p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>{t('tipCSV')}</li>
            <li>{t('tipEdit')}</li>
            <li>{t('tipSearch')}</li>
            <li>{t('tipCSVCodes')}</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManual;
