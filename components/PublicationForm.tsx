
import React, { useState } from 'react';
import { ProjectMaster, PublicationOutput, FiscalYear, PublicationLevel, PublicationType } from '../types';
import { FISCAL_YEARS, PUBLICATION_LEVELS, PUBLICATION_TYPES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface PublicationFormProps {
  projects: ProjectMaster[];
  onAddPublication: (pub: PublicationOutput) => void;
  onCancel: () => void;
}

const PublicationForm: React.FC<PublicationFormProps> = ({ projects, onAddPublication, onCancel }) => {
  const { t } = useLanguage();
  // Mode toggle for UX
  const [historicalMode, setHistoricalMode] = useState(false);
  
  const [formData, setFormData] = useState<Partial<PublicationOutput>>({
    output_reporting_year: FiscalYear.Y2568,
    is_published: true,
    publication_level: PublicationLevel.National,
    publication_type: PublicationType.TCI1
  });

  const [searchProject, setSearchProject] = useState("");
  const [fileName, setFileName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ref_project_id) {
      alert("Please link a project source.");
      return;
    }
    const newPub: PublicationOutput = {
      output_id: `o_${Math.random().toString(36).substr(2, 6)}`,
      ...formData as PublicationOutput,
      file_url: fileName
    };
    onAddPublication(newPub);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  // Logic to show projects from past years
  const filteredProjects = projects.filter(p => 
    p.project_name.toLowerCase().includes(searchProject.toLowerCase()) || 
    p.head_researcher.toLowerCase().includes(searchProject.toLowerCase()) ||
    p.project_id.includes(searchProject)
  );

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-tnsu-green-800 flex items-center">
            <span className="material-icons mr-2">playlist_add</span>
            {t('addPub')}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Link an output to its original funding source (Cross-Year Mapping)</p>
        </div>
        
        {/* Requirement 2: Historical Data Entry Mode */}
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
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
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

        {/* Project Link - The Core Logic */}
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
                       <span className={`text-[10px] mt-1 font-medium px-1.5 py-0.5 rounded ${p.status === 'Completed' ? 'text-green-700 bg-green-50' : 'text-orange-700 bg-orange-50'}`}>{p.status}</span>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>

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

        {/* File Upload Simulation */}
        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('uploadCert')}</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors">
              <div className="space-y-1 text-center">
                <span className="material-icons text-gray-400 text-3xl">upload_file</span>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-tnsu-green-600 hover:text-tnsu-green-500 focus-within:outline-none">
                    <span>Choose File</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf,.png,.jpg" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  {fileName ? <span className="font-bold text-tnsu-green-700">{fileName}</span> : "Article Front Page (PDF/IMG)"}
                </p>
              </div>
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
