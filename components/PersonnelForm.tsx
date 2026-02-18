
import React, { useState, useEffect } from 'react';
import { PersonnelDevelopment, FiscalYear, DevelopmentType } from '../types';
import { FISCAL_YEARS, DEVELOPMENT_TYPES, ALL_ORGANIZATIONS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface PersonnelFormProps {
  onSave: (personnel: PersonnelDevelopment) => void;
  onCancel: () => void;
  initialData?: PersonnelDevelopment | null;
}

const PersonnelForm: React.FC<PersonnelFormProps> = ({ onSave, onCancel, initialData }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Partial<PersonnelDevelopment>>({
    fiscal_year: FiscalYear.Y2568,
    development_type: DevelopmentType.Training,
    organization_name: user?.organization.nameEn || '',
    duration_hours: 0,
    activity_date: new Date().toISOString().split('T')[0],
    staff_name: '',
    course_name: ''
  });

  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.certificate_url) {
        setFileName(initialData.certificate_url);
      }
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (!formData.staff_name || !formData.course_name || !formData.organization_name) {
      alert("Please fill in all required fields.");
      return;
    }

    const dataToSave: PersonnelDevelopment = {
      id: initialData?.id || `pd_${Math.random().toString(36).substr(2, 6)}`,
      fiscal_year: formData.fiscal_year || FiscalYear.Y2568,
      staff_name: formData.staff_name,
      organization_name: formData.organization_name,
      development_type: formData.development_type || DevelopmentType.Training,
      course_name: formData.course_name,
      activity_date: formData.activity_date || new Date().toISOString().split('T')[0],
      duration_hours: Number(formData.duration_hours),
      certificate_url: fileName // Simulating file path save for DB
    };
    
    onSave(dataToSave);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // In a real app, this would upload to Firebase Storage and return a URL
      // Here we simulate by storing the filename
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-tnsu-green-800 mb-6 flex items-center">
        <span className="material-icons mr-2">{initialData ? 'edit' : 'add_circle'}</span>
        {initialData ? t('editPersonnel') : t('addPersonnel')}
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Fiscal Year */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('fiscalYear')}</label>
          <select 
            name="fiscal_year" 
            value={formData.fiscal_year} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5 bg-white"
            required
          >
            {FISCAL_YEARS.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>

        {/* Development Type */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('devType')}</label>
          <select 
            name="development_type" 
            value={formData.development_type} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5 bg-white"
          >
            {DEVELOPMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        {/* Staff Name */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('staffName')}</label>
          <input 
            type="text" 
            name="staff_name" 
            value={formData.staff_name || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5"
            placeholder="e.g. Dr. Somchai Jai-dee"
            required
          />
        </div>

        {/* Organization Name */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('campusOrg')}</label>
          <select 
            name="organization_name" 
            value={formData.organization_name || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5 bg-white"
            required
          >
             <option value="">{t('selectOrg')}</option>
            {ALL_ORGANIZATIONS.map(org => (
              <option key={org.id} value={org.nameEn}>
                 {language === 'th' ? org.nameTh : org.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Course / Project Name */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('courseName')}</label>
          <input 
            type="text" 
            name="course_name" 
            value={formData.course_name || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5"
            placeholder="e.g. Advanced Sports Analytics Workshop"
            required
          />
        </div>

        {/* Activity Date */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('activityDate')}</label>
          <input 
            type="date" 
            name="activity_date" 
            value={formData.activity_date || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5"
            required
          />
        </div>

        {/* Duration (Hours) */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('duration')}</label>
          <input 
            type="number" 
            name="duration_hours" 
            value={formData.duration_hours || ''} 
            onChange={handleChange}
            min="0"
            step="0.5"
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5"
            required
          />
        </div>

        {/* Certificate / Report Upload */}
        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('certificate')} / Report</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors bg-gray-50/30">
              <div className="space-y-1 text-center">
                <span className="material-icons text-gray-400 text-3xl">upload_file</span>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-tnsu-green-600 hover:text-tnsu-green-500 focus-within:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tnsu-green-500 px-2">
                    <span>{t('uploadCert')}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  {fileName ? (
                    <span className="font-bold text-tnsu-green-700 flex items-center justify-center">
                      <span className="material-icons text-sm mr-1">check_circle</span>
                      {fileName}
                    </span>
                  ) : "PDF, Word, or Images up to 10MB"}
                </p>
              </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="col-span-2 flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-100">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            {t('cancel')}
          </button>
          <button 
            type="submit" 
            className="px-8 py-2.5 bg-tnsu-green-600 text-white rounded-lg hover:bg-tnsu-green-700 shadow-md hover:shadow-lg transition-all font-medium flex items-center"
          >
            <span className="material-icons text-sm mr-2">save</span>
            {t('save')}
          </button>
        </div>

      </form>
    </div>
  );
};

export default PersonnelForm;
