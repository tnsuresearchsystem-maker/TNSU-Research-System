
import React, { useState, useEffect } from 'react';
import { ProjectMaster, Utilization, FiscalYear, UtilizationType } from '../types';
import { FISCAL_YEARS, UTILIZATION_TYPES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface UtilizationFormProps {
  projects: ProjectMaster[];
  onSave: (util: Utilization) => void;
  onCancel: () => void;
  initialData?: Utilization | null;
}

const UtilizationForm: React.FC<UtilizationFormProps> = ({ projects, onSave, onCancel, initialData }) => {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState<Partial<Utilization>>({
    utilization_reporting_year: FiscalYear.Y2568,
    utilization_type: UtilizationType.Academic,
    description: '',
    evidence_url: ''
  });

  const [searchProject, setSearchProject] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ref_project_id) {
      alert("Please link a project source.");
      return;
    }
    if (!formData.description) {
      alert("Please enter a description.");
      return;
    }

    const newUtil: Utilization = {
      id: initialData?.id || `u_${Math.random().toString(36).substr(2, 6)}`,
      ...formData as Utilization
    };
    onSave(newUtil);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredProjects = projects.filter(p => 
    p.project_name.toLowerCase().includes(searchProject.toLowerCase()) || 
    p.head_researcher.toLowerCase().includes(searchProject.toLowerCase()) ||
    p.project_id.includes(searchProject)
  );

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in-up">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-800 flex items-center">
            <span className="material-icons mr-2">{initialData ? 'edit' : 'handshake'}</span>
            {initialData ? t('editUtil') : t('addUtil')}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Record how research outputs are being utilized or creating impact.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Project Link - Search */}
        <div className="col-span-2 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
          <label className="block text-sm font-bold text-blue-900 mb-2">
            <span className="material-icons text-sm align-middle mr-1">link</span>
            {t('linkProject')}
          </label>
          
          <div className="mb-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')}
                value={searchProject}
                onChange={(e) => setSearchProject(e.target.value)}
                className="w-full border border-gray-300 p-2.5 pl-10 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none"
              />
              <span className="material-icons absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-inner">
             {filteredProjects.length === 0 ? (
               <div className="p-6 text-center text-gray-500 text-sm">No projects found matching your search.</div>
             ) : (
               filteredProjects.map(p => (
                 <div 
                  key={p.project_id}
                  onClick={() => setFormData({...formData, ref_project_id: p.project_id})}
                  className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors flex justify-between items-center ${formData.ref_project_id === p.project_id ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''}`}
                 >
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{p.project_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        <span className="material-icons text-[10px] align-middle mr-0.5">person</span>
                        {p.head_researcher} <span className="mx-1">•</span> ID: {p.project_id}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">Funded: {p.funding_fiscal_year}</span>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>

        {/* Reporting Year */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportYear')}</label>
          <select 
            name="utilization_reporting_year" 
            value={formData.utilization_reporting_year} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5"
            required
          >
            {FISCAL_YEARS.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>

        {/* Utilization Type */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('utilType')}</label>
          <select 
            name="utilization_type" 
            value={formData.utilization_type} 
            onChange={handleChange}
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            {UTILIZATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('utilDescription')}</label>
          <textarea 
            name="description" 
            value={formData.description || ''} 
            onChange={handleChange}
            rows={4}
            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Describe how the research outcome was utilized..."
          />
        </div>

        {/* URL Input */}
        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('uploadCert')} (Evidence URL)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-gray-400">link</span>
              </div>
              <input 
                type="url" 
                name="evidence_url"
                value={formData.evidence_url || ''}
                onChange={handleChange}
                className="w-full pl-10 border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://drive.google.com/..."
              />
            </div>
        </div>
        
        {/* Buttons */}
        <div className="col-span-2 flex justify-end space-x-3 mt-4 border-t pt-6">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            {t('cancel')}
          </button>
          <button 
            type="submit" 
            disabled={!formData.ref_project_id}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
          >
            {t('save')}
          </button>
        </div>

      </form>
    </div>
  );
};

export default UtilizationForm;
