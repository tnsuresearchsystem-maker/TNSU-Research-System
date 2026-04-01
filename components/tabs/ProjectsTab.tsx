import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import FilterBar from '../FilterBar';
import { ProjectMaster, PublicationOutput, Utilization } from '../../types';
import { CSVType } from '../../services/csvService';
import { ALL_ORGANIZATIONS } from '../../constants';
import ProjectForm from '../ProjectForm';
import ProjectDetails from '../ProjectDetails';

interface ProjectsTabProps {
  projects: ProjectMaster[];
  publications: PublicationOutput[];
  utilizations: Utilization[];
  filterRegion: string;
  setFilterRegion: (val: string) => void;
  filterOrgType: string;
  setFilterOrgType: (val: string) => void;
  filterCampus: string;
  setFilterCampus: (val: string) => void;
  filterReportingPeriod: string;
  setFilterReportingPeriod: (val: string) => void;
  filterFiscalYear: string;
  setFilterFiscalYear: (val: string) => void;
  filterResearchCategory: string;
  setFilterResearchCategory: (val: string) => void;
  filterProjectStatus: string;
  setFilterProjectStatus: (val: string) => void;
  setCsvImportType: (type: CSVType) => void;
  exportToCSV: (data: any[], type: CSVType, filename: string) => void;
  showProjectForm: boolean;
  setShowProjectForm: (show: boolean) => void;
  selectedProject: ProjectMaster | null;
  setSelectedProject: (project: ProjectMaster | null) => void;
  editingProject: ProjectMaster | null;
  setEditingProject: (project: ProjectMaster | null) => void;
  handleSaveProject: (project: ProjectMaster) => void;
  handleDeleteProject: (project: ProjectMaster) => void;
  previousTab: string | null;
  setActiveTab: (tab: string) => void;
  setPreviousTab: (tab: string | null) => void;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({
  projects, publications, utilizations,
  filterRegion, setFilterRegion,
  filterOrgType, setFilterOrgType,
  filterCampus, setFilterCampus,
  filterReportingPeriod, setFilterReportingPeriod,
  filterFiscalYear, setFilterFiscalYear,
  filterResearchCategory, setFilterResearchCategory,
  filterProjectStatus, setFilterProjectStatus,
  setCsvImportType, exportToCSV,
  showProjectForm, setShowProjectForm,
  selectedProject, setSelectedProject,
  editingProject, setEditingProject,
  handleSaveProject, handleDeleteProject,
  previousTab, setActiveTab, setPreviousTab
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  if (showProjectForm) {
    return (
      <ProjectForm 
        onSave={handleSaveProject} 
        onCancel={() => { setShowProjectForm(false); setEditingProject(null); }} 
        initialData={editingProject}
      />
    );
  }
  
  if (selectedProject) {
    return (
      <ProjectDetails 
        project={selectedProject} 
        publications={publications}
        utilizations={utilizations}
        onBack={() => {
          setSelectedProject(null);
          if (previousTab) {
            setActiveTab(previousTab);
            setPreviousTab(null);
          }
        }}
        onEdit={(p) => {
           setEditingProject(p);
           setShowProjectForm(true);
        }} 
      />
    );
  }

  // Filter logic
  const filteredProjects = projects.filter(p => {
    if (filterFiscalYear && p.funding_fiscal_year !== filterFiscalYear) return false;
    if (filterReportingPeriod && p.reporting_period !== filterReportingPeriod) return false;
    if (filterResearchCategory && p.research_category !== filterResearchCategory) return false;
    if (filterProjectStatus && p.status !== filterProjectStatus) return false;
    
    const org = ALL_ORGANIZATIONS.find(o => o.id === p.campus_id || o.nameEn === p.campus_id || o.nameTh === p.campus_id);
    
    if (filterCampus && org?.nameEn !== filterCampus) return false;
    if (filterRegion && org?.region !== filterRegion) return false;
    if (filterOrgType && org?.type !== filterOrgType) return false;

    // If not admin, only show projects from their own campus
    if (user?.role !== 'Admin' && org?.nameEn !== user?.organization.nameEn) return false;
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <h2 className="text-2xl font-bold text-gray-800">{t('projects')}</h2>
         <div className="flex flex-wrap gap-2 md:gap-3">
           <FilterBar 
             filterRegion={filterRegion} setFilterRegion={setFilterRegion}
             filterOrgType={filterOrgType} setFilterOrgType={setFilterOrgType}
             filterCampus={filterCampus} setFilterCampus={setFilterCampus}
             filterReportingPeriod={filterReportingPeriod} setFilterReportingPeriod={setFilterReportingPeriod}
             filterFiscalYear={filterFiscalYear} setFilterFiscalYear={setFilterFiscalYear}
             filterResearchCategory={filterResearchCategory} setFilterResearchCategory={setFilterResearchCategory}
             filterProjectStatus={filterProjectStatus} setFilterProjectStatus={setFilterProjectStatus}
           />
           <button 
             onClick={() => setCsvImportType('project')}
             className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg flex items-center shadow-sm transition-colors"
           >
             <span className="material-icons mr-2 text-gray-500">upload_file</span>
             {t('importCsv') || 'Import CSV'}
           </button>
           <button 
             onClick={() => exportToCSV(filteredProjects, 'project', `projects_export_${new Date().toISOString().split('T')[0]}.csv`)}
             className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg flex items-center shadow-sm transition-colors"
           >
             <span className="material-icons mr-2 text-gray-500">download</span>
             {t('exportCsv') || 'Export CSV'}
           </button>
           <button 
            onClick={() => { setEditingProject(null); setShowProjectForm(true); }}
            className="bg-tnsu-green-600 hover:bg-tnsu-green-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-colors"
           >
             <span className="material-icons mr-2">add</span>
             {t('addProject')}
           </button>
         </div>
      </div>
      
      <div className="bg-white shadow-md rounded-xl overflow-x-auto border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('fiscalYear')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('reportingPeriod') || 'Reporting Period'}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('projectName')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('campusOrg')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('researcher')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('status')}</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.map((p, index) => (
              <tr 
                key={`${p.project_id}_${index}`} 
                onClick={() => setSelectedProject(p)}
                className="hover:bg-blue-50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group-hover:text-blue-600 font-medium transition-colors">
                  {p.project_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-tnsu-green-800">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{p.funding_fiscal_year}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {p.reporting_period || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  <div>{p.project_name}</div>
                  {p.project_name_en && <div className="text-xs text-gray-500 font-light">{p.project_name_en}</div>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.owner_organization || p.campus_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.head_researcher}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${p.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProject(p);
                      setShowProjectForm(true);
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-tnsu-green-200 shadow-sm text-xs font-medium rounded-md text-tnsu-green-700 bg-white hover:bg-tnsu-green-50 focus:outline-none transition-all z-10 relative"
                    title={t('edit')}
                  >
                    <span className="material-icons text-sm mr-1.5 text-tnsu-green-600">edit</span>
                    {t('edit')}
                  </button>
                  
                  {/* Delete Button (Only if no linked data) */}
                  {!(publications.some(pub => pub.ref_project_id === p.project_id) || utilizations.some(u => u.ref_project_id === p.project_id)) && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(p);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-red-200 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none transition-all z-10 relative ml-2"
                      title={t('delete')}
                    >
                      <span className="material-icons text-sm mr-1.5 text-red-600">delete</span>
                      {t('delete')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectsTab;
