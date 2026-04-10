
import React, { useState, useEffect } from 'react';
import { ProjectMaster, PublicationOutput, FiscalYear, PublicationLevel, PublicationType, ApprovalStatus } from '../types';
import { FISCAL_YEARS, PUBLICATION_LEVELS, PUBLICATION_TYPES, FACULTIES, ALL_ORGANIZATIONS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface PublicationFormProps {
  projects: ProjectMaster[];
  onSave: (pub: PublicationOutput) => void;
  onCancel: () => void;
  initialData?: PublicationOutput | null;
  isIndependentDefault?: boolean;
}

const PublicationForm: React.FC<PublicationFormProps> = ({ projects, onSave, onCancel, initialData, isIndependentDefault = false }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [historicalMode, setHistoricalMode] = useState(false);
  const [isIndependent, setIsIndependent] = useState(isIndependentDefault);
  
  const [formData, setFormData] = useState<Partial<PublicationOutput>>({
    output_reporting_year: FiscalYear.Y2568,
    is_published: true,
    publication_level: PublicationLevel.National,
    publication_type: PublicationType.TCI1,
    file_url: '',
    approval_status: ApprovalStatus.Draft
  });

  const [searchProject, setSearchProject] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setIsIndependent(!initialData.ref_project_id);
    } else {
      setIsIndependent(isIndependentDefault);
      if (user?.role !== 'Admin') {
        setFormData(prev => ({ ...prev, campus_id: user?.organization.nameEn }));
      }
    }
  }, [initialData, user, isIndependentDefault]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIndependent && !formData.ref_project_id) {
      alert(t('linkProjectSourceAlert'));
      return;
    }
    if (isIndependent && !formData.campus_id) {
      alert(t('selectOrg'));
      return;
    }
    const newPub: any = {
      ...formData,
      output_id: initialData?.output_id || `o_${Math.random().toString(36).substr(2, 6)}`,
      approval_status: formData.approval_status || ApprovalStatus.Draft
    };
    if (isIndependent) {
      newPub.ref_project_id = null;
    }
    onSave(newPub as PublicationOutput);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredProjects = projects.filter(p => 
    p.project_name.toLowerCase().includes(searchProject.toLowerCase()) || 
    (p.project_name_en && p.project_name_en.toLowerCase().includes(searchProject.toLowerCase())) ||
    p.head_researcher.toLowerCase().includes(searchProject.toLowerCase()) ||
    p.project_id.includes(searchProject)
  );

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-tnsu-green-800 flex items-center">
            <span className="material-icons mr-2">{initialData ? 'edit' : 'playlist_add'}</span>
            {initialData ? t('editPub') : t('addPub')}
          </h2>
          <p className="text-gray-500 text-sm mt-1">{t('linkProjectDesc')}</p>
        </div>
        
        {!initialData && (
          <div className="flex items-center bg-tnsu-yellow-50 px-4 py-2 rounded-lg border border-tnsu-yellow-100">
            <input 
              type="checkbox" 
              id="historyMode" 
              checked={historicalMode} 
              onChange={(e) => {
                setHistoricalMode(e.target.checked);
                if (e.target.checked) {
                  setFormData(prev => ({ ...prev, output_reporting_year: FiscalYear.Y2566 }));
                } else {
                  setFormData(prev => ({ ...prev, output_reporting_year: FiscalYear.Y2568 }));
                }
              }}
              className="h-5 w-5 text-tnsu-green-600 focus:ring-tnsu-green-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="historyMode" className="ml-2 block text-sm text-tnsu-green-900 font-medium cursor-pointer">
              {t('histMode')}
            </label>
          </div>
        )}
      </div>

      {!historicalMode && !initialData && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="material-icons text-red-500">info</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-bold">
                {t('currentYearNote')}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Approval Status */}
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

        {/* Reporting Year */}
        <div className="col-span-1 p-5 bg-gray-50 rounded-xl border border-gray-200">
          <label className="block text-sm font-bold text-tnsu-green-800 mb-2">
            <span className="material-icons text-sm align-middle mr-1">today</span>
            {t('reportYear')}
          </label>
          <select 
            name="output_reporting_year" 
            value={formData.output_reporting_year} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5 bg-white"
            required
          >
            {FISCAL_YEARS.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>

        {/* Independent Publication Toggle */}
        <div className="col-span-1 p-5 bg-purple-50 rounded-xl border border-purple-100 flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isIndependent}
              onChange={(e) => {
                setIsIndependent(e.target.checked);
                if (e.target.checked) {
                  setFormData(prev => ({ ...prev, ref_project_id: undefined }));
                }
              }}
              className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
            />
            <span className="ml-3 block text-sm font-bold text-purple-900">
              ผลงานตีพิมพ์อิสระ (ไม่ได้เชื่อมโยงกับโครงการวิจัย)
            </span>
          </label>
        </div>

        {/* Project Link (Conditional) */}
        {!isIndependent && (
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
                 <div className="p-6 text-center text-gray-500 text-sm">{t('noProjectsFound')}</div>
               ) : (
                 filteredProjects.map((p, index) => (
                   <div 
                    key={`${p.project_id}_${index}`}
                    onClick={() => setFormData({...formData, ref_project_id: p.project_id})}
                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors flex justify-between items-center ${formData.ref_project_id === p.project_id ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''}`}
                   >
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">{p.project_name}</div>
                        {p.project_name_en && <div className="text-xs text-gray-500 font-light">{p.project_name_en}</div>}
                        <div className="text-xs text-gray-500 mt-0.5">
                          <span className="material-icons text-[10px] align-middle mr-0.5">person</span>
                          {p.head_researcher} <span className="mx-1">•</span> ID: {p.project_id}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{t('fundedLabel')}{p.funding_fiscal_year}</span>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>
        )}

        {/* Independent Publication Fields */}
        {isIndependent && (
          <>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('campusOrg')}</label>
              <select 
                name="campus_id" 
                value={formData.campus_id || ''} 
                onChange={handleChange}
                className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5 ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                required
                disabled={!isAdmin}
              >
                 <option value="">{t('selectOrg')}</option>
                {ALL_ORGANIZATIONS.map(org => (
                  <option key={org.id} value={org.nameEn}>
                     {language === 'th' ? org.nameTh : org.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('faculty') || 'Faculty (คณะ)'}</label>
              <select 
                name="faculty" 
                value={formData.faculty || ''} 
                onChange={handleChange}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-tnsu-green-500 focus:border-tnsu-green-500 border p-2.5 bg-white"
                required
              >
                 <option value="">{t('selectFaculty') || 'Select Faculty'}</option>
                {FACULTIES.map(fac => (
                  <option key={fac.id} value={fac.id}>
                     {language === 'th' ? fac.nameTh : fac.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ผู้แต่ง (Authors)</label>
              <input 
                type="text" 
                name="authors" 
                value={formData.authors || ''} 
                onChange={handleChange}
                className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500"
                placeholder="ชื่อผู้แต่ง..."
                required
              />
            </div>
          </>
        )}

        {/* Publication Details */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('title')}</label>
          <input 
            type="text" 
            name="article_title" 
            value={formData.article_title || ''} 
            onChange={handleChange}
            className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500"
            required
          />
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('type')}</label>
          <select name="publication_type" value={formData.publication_type} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-tnsu-green-500 focus:border-tnsu-green-500">
            {PUBLICATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('level')}</label>
          <select name="publication_level" value={formData.publication_level} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-tnsu-green-500 focus:border-tnsu-green-500">
            {PUBLICATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* URL Link Input (Google Drive) */}
        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('fileUrlLabel')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-gray-400">link</span>
              </div>
              <input 
                type="url" 
                name="file_url"
                value={formData.file_url || ''}
                onChange={handleChange}
                className="w-full pl-10 border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-tnsu-green-500 focus:border-tnsu-green-500"
                placeholder={t('urlPlaceholder')}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('pasteLinkHint')}</p>
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
            disabled={!isIndependent && !formData.ref_project_id}
            className="px-8 py-2.5 bg-tnsu-green-600 text-white rounded-lg hover:bg-tnsu-green-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
          >
            {t('save')}
          </button>
        </div>

      </form>
    </div>
  );
};

export default PublicationForm;
