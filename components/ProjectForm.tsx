
import React, { useState, useEffect } from 'react';
import { ProjectMaster, FiscalYear, FundingSource, ResearchCategory, ProjectStatus, ApprovalStatus, ReportingPeriod } from '../types';
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
    campus_id: user?.organization.nameEn || '',
    owner_organization: user?.organization.nameEn || '',
    approval_status: ApprovalStatus.Draft
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
      ...formData as ProjectMaster,
      project_id: initialData?.project_id || `p_${Math.random().toString(36).substr(2, 6)}`,
      budget_amount: Number(formData.budget_amount),
      approval_status: formData.approval_status || ApprovalStatus.Draft
    };
    onSave(projectToSave);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-tnsu-green-800 mb-6 flex items-center">
        <span className="material-icons mr-2">{initialData ? 'edit' : 'add_circle'}</span>
        {initialData ? t('editProject') : t('addProject')}
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Project ID (Read-only if editing) */}
        {initialData && (
          <div className="col-span-2 p-3 bg-gray-50 rounded-lg border border-gray-200 mb-2 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Project ID</p>
              <p className="text-gray-700 font-mono">{initialData.project_id}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold border ${
              formData.approval_status === ApprovalStatus.Approved ? 'bg-green-100 text-green-700 border-green-200' :
              formData.approval_status === ApprovalStatus.Pending ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
              formData.approval_status === ApprovalStatus.Rejected ? 'bg-red-100 text-red-700 border-red-200' :
              'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
              {formData.approval_status || 'Draft'}
            </div>
          </div>
        )}

        {/* Approval Status (Visible to all, editable based on role) */}
        <div className="col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
          <label className="block text-sm font-bold text-blue-800 mb-2">Workflow Status</label>
          <div className="flex items-center space-x-4">
            <select
              name="approval_status"
              value={formData.approval_status || ApprovalStatus.Draft}
              onChange={handleChange}
              className="flex-1 border-blue-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2.5"
            >
              <option value={ApprovalStatus.Draft}>{ApprovalStatus.Draft}</option>
              <option value={ApprovalStatus.Pending}>{ApprovalStatus.Pending}</option>
              {isAdmin && (
                <>
                  <option value={ApprovalStatus.Approved}>{ApprovalStatus.Approved}</option>
                  <option value={ApprovalStatus.Rejected}>{ApprovalStatus.Rejected}</option>
                  <option value={ApprovalStatus.RequestChange}>{ApprovalStatus.RequestChange}</option>
                </>
              )}
              {!isAdmin && formData.approval_status === ApprovalStatus.Approved && (
                <option value={ApprovalStatus.Approved} disabled>{ApprovalStatus.Approved}</option>
              )}
               {!isAdmin && formData.approval_status === ApprovalStatus.Rejected && (
                <option value={ApprovalStatus.Rejected} disabled>{ApprovalStatus.Rejected}</option>
              )}
               {!isAdmin && formData.approval_status === ApprovalStatus.RequestChange && (
                <option value={ApprovalStatus.RequestChange} disabled>{ApprovalStatus.RequestChange}</option>
              )}
            </select>
            <div className="text-xs text-blue-600">
              {isAdmin ? 'Admin: You can change status to any value.' : 'User: Submit for review when ready.'}
            </div>
          </div>
        </div>

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

        {/* Reporting Period */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportingPeriod') || 'Reporting Period'}</label>
          <select 
            name="reporting_period" 
            value={formData.reporting_period || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5 transition-all hover:border-tnsu-green-300"
            required
          >
            <option value="">{t('selectReportingPeriod') || 'Select Period'}</option>
            <option value={ReportingPeriod.Round6Months}>{ReportingPeriod.Round6Months}</option>
            <option value={ReportingPeriod.Round12Months}>{ReportingPeriod.Round12Months}</option>
          </select>
        </div>

        {/* Campus/Organization */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('campusOrg')}</label>
          <input 
            type="text"
            list="org-list"
            name="owner_organization" 
            value={formData.owner_organization || formData.campus_id || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5 transition-all hover:border-tnsu-green-300"
            required
            placeholder={t('selectOrg')}
          />
          <datalist id="org-list">
            {ALL_ORGANIZATIONS.map(org => (
              <option key={org.id} value={language === 'th' ? org.nameTh : org.nameEn} />
            ))}
          </datalist>
        </div>

        {/* Project Name (Thai) */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('projectNameTh')}</label>
          <input 
            type="text" 
            name="project_name" 
            value={formData.project_name || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5 transition-all hover:border-tnsu-green-300"
            required
            placeholder="ระบุชื่อโครงการภาษาไทย"
          />
        </div>

        {/* Project Name (English) */}
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('projectNameEn')}</label>
          <input 
            type="text" 
            name="project_name_en" 
            value={formData.project_name_en || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5 transition-all hover:border-tnsu-green-300"
            placeholder="Enter Project Name in English"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('budget')}</label>
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
            {FUNDING_SOURCES.map(s => <option key={s} value={s}>{t(s)}</option>)}
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('category')}</label>
          <select name="research_category" value={formData.research_category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500">
            {RESEARCH_CATEGORIES.map(c => <option key={c} value={c}>{t(c)}</option>)}
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
