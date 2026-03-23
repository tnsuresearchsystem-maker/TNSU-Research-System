import React, { useState, useEffect } from 'react';
import { FacultyLecturerCount, FiscalYear } from '../types';
import { FISCAL_YEARS, FACULTIES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getFacultyStatsFromDB, saveFacultyStatsToDB } from '../services/dbService';

interface FacultyLecturerModalProps {
  onClose: () => void;
}

const FacultyLecturerModal: React.FC<FacultyLecturerModalProps> = ({ onClose }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [fiscalYear, setFiscalYear] = useState<FiscalYear>(FiscalYear.Y2568);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [fiscalYear]);

  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const stats = await getFacultyStatsFromDB(user);
      const yearStats = stats.filter(s => s.fiscal_year === fiscalYear && s.campus_id === user.organization.nameEn);
      
      const newCounts: Record<string, number> = {};
      yearStats.forEach(s => {
        newCounts[s.faculty] = s.total_lecturers;
      });
      setCounts(newCounts);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCountChange = (facultyId: string, value: string) => {
    setCounts(prev => ({
      ...prev,
      [facultyId]: parseInt(value) || 0
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const promises = FACULTIES.map(fac => {
        const stat: FacultyLecturerCount = {
          id: `${user.organization.nameEn}_${fiscalYear}_${fac.id}`,
          campus_id: user.organization.nameEn,
          fiscal_year: fiscalYear,
          faculty: fac.id,
          total_lecturers: counts[fac.id] || 0
        };
        return saveFacultyStatsToDB(stat);
      });
      await Promise.all(promises);
      alert(t('saveSuccess') || 'Saved successfully');
      onClose();
    } catch (error) {
      console.error("Error saving stats:", error);
      alert(t('saveError') || 'Error saving data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">
            {t('totalLecturers') || 'Total Regular Lecturers'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('fiscalYear')}</label>
            <select 
              value={fiscalYear} 
              onChange={(e) => setFiscalYear(e.target.value as FiscalYear)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5"
            >
              {FISCAL_YEARS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tnsu-green-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {FACULTIES.map(fac => {
                const facultyName = language === 'th' ? fac.nameTh : fac.nameEn;
                return (
                  <div key={fac.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{facultyName}</label>
                    <input 
                      type="number" 
                      min="0"
                      value={counts[fac.id] || ''} 
                      onChange={(e) => handleCountChange(fac.id, e.target.value)}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5"
                      placeholder="0"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('cancel')}
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-tnsu-green-600 rounded-lg hover:bg-tnsu-green-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {saving ? <span className="material-icons animate-spin text-sm mr-2">refresh</span> : null}
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyLecturerModal;
