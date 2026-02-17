import React, { useState, useEffect } from 'react';
import { ProjectMaster, FiscalYear, FundingSource, ResearchCategory, ProjectStatus } from '../types';
import { FISCAL_YEARS, FUNDING_SOURCES, RESEARCH_CATEGORIES, PROJECT_STATUSES, ALL_ORGANIZATIONS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface ProjectFormProps {
  onSave: (project: ProjectMaster) => void;
  onCancel: () => void;
  initialData?: ProjectMaster | null;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSave, onCancel, initialData }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Partial<ProjectMaster>>({
    funding_fiscal_year: FiscalYear.Y2568,
    status: ProjectStatus.Ongoing,
    funding_source: FundingSource.Internal,
    research_category: ResearchCategory.SportsScience,
    // Default to user's organization if adding new
    campus_id: user?.organization.nameEn || '' 
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectToSave: ProjectMaster = {
      // Keep existing ID if editing, otherwise generate new one
      project_id: initialData?.project_id || `p_${Math.random().toString(36).substr(2, 6)}`,
      ...formData as ProjectMaster,
      budget_amount: Number(formData.budget_amount)
    };
    onSave(projectToSave);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-tnsu-green-800 mb-6 flex items-center">
        <span className="material-icons mr-2">{initialData ? 'edit' : 'add_circle'}</span>
        {initialData ? t('editProject') : t('addProject')}
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Project ID (Read-only if editing) */}
        {initialData && (
          <div className="col-span-2 p-3 bg-gray-50 rounded-lg border border-gray-200 mb-2">
            <p className="text-xs text-gray-500 uppercase font-bold">Project ID</p>
            <p className="text-gray-700 font-mono">{initialData.project_id}</p>
          </div>
        )}

        {/* Funding Year */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('fundingYear')}</label>
          <select 
            name="funding_fiscal_year" 
            value={formData.funding_fiscal_year} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5 transition-all hover:border-tnsu-green-300"
            required
          >
            {FISCAL_YEARS.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>

        {/* Campus/Organization */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('campusOrg')}</label>
          <select 
            name="campus_id" 
            value={formData.campus_id || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5 transition-all hover:border-tnsu-green-300"
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

        {/* Project Name */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('projectName')}</label>
          <input 
            type="text" 
            name="project_name" 
            value={formData.project_name || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5 transition-all hover:border-tnsu-green-300"
            required
          />
        </div>

        {/* Head Researcher */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('researcher')}</label>
          <input 
            type="text" 
            name="head_researcher" 
            value={formData.head_researcher || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5 transition-all hover:border-tnsu-green-300"
            required
          />
        </div>

        {/* Budget */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('budget')} (THB)</label>
          <input 
            type="number" 
            name="budget_amount" 
            value={formData.budget_amount || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5 transition-all hover:border-tnsu-green-300"
            min="0"
            required
          />
        </div>

        {/* Metadata */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('fundingSource')}</label>
          <select name="funding_source" value={formData.funding_source} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500">
            {FUNDING_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('category')}</label>
          <select name="research_category" value={formData.research_category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500">
            {RESEARCH_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('status')}</label>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500">
            {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="col-span-2 flex justify-end space-x-3 mt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            {t('cancel')}
          </button>
          <button 
            type="submit" 
            className="px-8 py-2.5 bg-tnsu-green-600 text-white rounded-lg hover:bg-tnsu-green-700 shadow-md hover:shadow-lg transition-all font-medium"
          >
            {t('save')}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProjectForm;