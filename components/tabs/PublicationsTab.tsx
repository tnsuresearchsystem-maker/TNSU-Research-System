import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import FilterBar from '../FilterBar';
import { ProjectMaster, PublicationOutput } from '../../types';
import { CSVType } from '../../services/csvService';
import { ALL_ORGANIZATIONS } from '../../constants';
import PublicationForm from '../PublicationForm';

interface PublicationsTabProps {
  projects: ProjectMaster[];
  publications: PublicationOutput[];
  filterFiscalYear: string;
  setFilterFiscalYear: (val: string) => void;
  filterRegion: string;
  setFilterRegion: (val: string) => void;
  filterOrgType: string;
  setFilterOrgType: (val: string) => void;
  filterCampus: string;
  setFilterCampus: (val: string) => void;
  setCsvImportType: (type: CSVType) => void;
  exportToCSV: (data: any[], type: CSVType, filename: string) => void;
  showPubForm: boolean;
  setShowPubForm: (show: boolean) => void;
  editingPublication: PublicationOutput | null;
  setEditingPublication: (pub: PublicationOutput | null) => void;
  isAddingIndependent: boolean;
  setIsAddingIndependent: (val: boolean) => void;
  handleSavePublication: (pub: PublicationOutput) => void;
  handleDeletePublication: (pub: PublicationOutput) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setPreviousTab: (tab: string | null) => void;
  setSelectedProject: (project: ProjectMaster | null) => void;
}

const PublicationsTab: React.FC<PublicationsTabProps> = ({
  projects, publications,
  filterFiscalYear, setFilterFiscalYear,
  filterRegion, setFilterRegion,
  filterOrgType, setFilterOrgType,
  filterCampus, setFilterCampus,
  setCsvImportType, exportToCSV,
  showPubForm, setShowPubForm,
  editingPublication, setEditingPublication,
  isAddingIndependent, setIsAddingIndependent,
  handleSavePublication, handleDeletePublication,
  activeTab, setActiveTab, setPreviousTab, setSelectedProject
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  if (showPubForm) {
    return (
      <PublicationForm 
        projects={projects} 
        onSave={handleSavePublication} 
        onCancel={() => { setShowPubForm(false); setEditingPublication(null); setIsAddingIndependent(false); }} 
        initialData={editingPublication}
        isIndependentDefault={isAddingIndependent}
      />
    );
  }
  
  // Filter logic
  const filteredPublications = publications.filter(pub => {
    if (filterFiscalYear && pub.output_reporting_year !== filterFiscalYear) return false;
    
    // Determine the organization based on project OR independent campus_id
    let targetCampusId = pub.campus_id;
    if (pub.ref_project_id) {
      const proj = projects.find(p => p.project_id === pub.ref_project_id);
      targetCampusId = proj?.campus_id;
    }
    
    const org = ALL_ORGANIZATIONS.find(o => o.id === targetCampusId || o.nameEn === targetCampusId || o.nameTh === targetCampusId);
    
    if (filterCampus && org?.nameEn !== filterCampus) return false;
    if (filterRegion && org?.region !== filterRegion) return false;
    if (filterOrgType && org?.type !== filterOrgType) return false;
    
    if (user?.role !== 'Admin' && org?.nameEn !== user?.organization.nameEn) return false;
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <h2 className="text-2xl font-bold text-gray-800">{t('publications')}</h2>
         <div className="flex flex-wrap gap-2 md:gap-3">
           <FilterBar 
             filterFiscalYear={filterFiscalYear} setFilterFiscalYear={setFilterFiscalYear}
             filterRegion={filterRegion} setFilterRegion={setFilterRegion}
             filterOrgType={filterOrgType} setFilterOrgType={setFilterOrgType}
             filterCampus={filterCampus} setFilterCampus={setFilterCampus}
           />
           <button 
             onClick={() => setCsvImportType('publication')}
             className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg flex items-center shadow-sm transition-colors"
           >
             <span className="material-icons mr-2 text-gray-500">upload_file</span>
             {t('importCsv') || 'Import CSV'}
           </button>
           <button 
             onClick={() => {
               const exportData = filteredPublications.map(pub => {
                 let campusId = pub.campus_id;
                 let projectName = t('independentPublication');
                 if (pub.ref_project_id) {
                   const proj = projects.find(p => p.project_id === pub.ref_project_id);
                   campusId = proj?.campus_id;
                   projectName = proj?.project_name || '';
                 }
                 return {
                   ...pub,
                   campus_id: campusId || '',
                   project_name: projectName
                 };
               });
               exportToCSV(exportData, 'publication', `publications_export_${new Date().toISOString().split('T')[0]}.csv`);
             }}
             className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg flex items-center shadow-sm transition-colors"
           >
             <span className="material-icons mr-2 text-gray-500">download</span>
             {t('exportCsv') || 'Export CSV'}
           </button>
           <button 
             onClick={() => { setEditingPublication(null); setIsAddingIndependent(false); setShowPubForm(true); }}
             className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-colors"
           >
             <span className="material-icons mr-2">add</span>
             {t('addPub')}
           </button>
           <button 
             onClick={() => { setEditingPublication(null); setIsAddingIndependent(true); setShowPubForm(true); }}
             className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-colors"
           >
             <span className="material-icons mr-2">add_circle_outline</span>
             {language === 'th' ? 'เพิ่มผลงานตีพิมพ์อิสระ' : 'Add Independent Pub'}
           </button>
         </div>
      </div>

      <div className="bg-white shadow-md rounded-xl overflow-x-auto border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('reportYear')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('linkProject')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('title')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('type')}</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPublications.map((pub, index) => {
              const project = pub.ref_project_id ? projects.find(p => p.project_id === pub.ref_project_id) : null;
              return (
                <tr key={`${pub.output_id}_${index}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">
                    <span className="bg-green-50 px-2 py-1 rounded border border-green-100">{pub.output_reporting_year}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {project ? (
                      <div className="flex flex-col">
                        <span 
                          className="text-gray-900 font-medium hover:text-tnsu-green-700 cursor-pointer"
                          onClick={() => {
                            setPreviousTab(activeTab);
                            setActiveTab('projects');
                            setSelectedProject(project);
                          }}
                        >
                          {project.project_name}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">Funded: {project.funding_fiscal_year}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-purple-700 font-medium">{t('independentPublication')}</span>
                        <span className="text-xs text-gray-400 mt-1">
                          {language === 'th' ? ALL_ORGANIZATIONS.find(o => o.nameEn === pub.campus_id)?.nameTh || pub.campus_id : pub.campus_id}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{pub.article_title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 text-xs font-medium">{pub.publication_type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => {
                        setEditingPublication(pub);
                        setShowPubForm(true);
                      }}
                      className="text-gray-400 hover:text-indigo-600 transition-colors bg-white hover:bg-indigo-50 rounded-full p-2"
                      title={t('edit')}
                    >
                      <span className="material-icons text-lg">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeletePublication(pub)}
                      className="text-gray-400 hover:text-red-600 transition-colors bg-white hover:bg-red-50 rounded-full p-2"
                      title={t('delete')}
                    >
                      <span className="material-icons text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PublicationsTab;
