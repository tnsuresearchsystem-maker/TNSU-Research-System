
import React from 'react';
import { ProjectMaster, PublicationOutput, Utilization } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { deleteProjectFromDB } from '../services/dbService';

interface ProjectDetailsProps {
  project: ProjectMaster;
  publications: PublicationOutput[];
  utilizations: Utilization[];
  onBack: () => void;
  onEdit: (project: ProjectMaster) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, publications, utilizations, onBack, onEdit }) => {
  const { t, language } = useLanguage();

  const linkedPubs = publications.filter(pub => pub.ref_project_id === project.project_id);
  const linkedUtils = utilizations.filter(ut => ut.ref_project_id === project.project_id);

  const handleDelete = async () => {
    // Safety Lock: Prevent delete if related data exists
    if (linkedPubs.length > 0 || linkedUtils.length > 0) {
      alert("Cannot delete project! It has linked Publications or Utilization records. Please remove them first.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      try {
        await deleteProjectFromDB(project.project_id);
        onBack(); // Go back to list, list should refresh or be updated by parent state
        window.location.reload(); // Simple refresh to show updated state for now
      } catch (error) {
        alert("Error deleting project.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 p-2 rounded-full shadow-sm transition-colors"
          >
            <span className="material-icons">arrow_back</span>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t('projectDetails')}</h2>
            <p className="text-gray-500 text-sm">ID: {project.project_id}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all shadow-sm"
          >
            <span className="material-icons text-sm">delete</span>
            <span className="font-medium text-sm">{t('delete')}</span>
          </button>

          <button
            onClick={() => onEdit(project)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-tnsu-green-600 hover:border-tnsu-green-200 transition-all shadow-sm"
          >
            <span className="material-icons text-sm">edit</span>
            <span className="font-medium text-sm">{t('edit')}</span>
          </button>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-tnsu-green-700 to-tnsu-green-600 px-6 py-4">
            <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white leading-tight pr-4">{project.project_name}</h3>
                  {project.project_name_en && (
                    <p className="text-white/80 text-sm mt-1 font-light">{project.project_name_en}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-white/20 ${
                    project.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                    {project.status}
                </span>
            </div>
            <p className="text-green-100 text-sm mt-2 flex items-center">
              <span className="material-icons text-[14px] mr-1">domain</span>
              {project.campus_id}
            </p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t('researcher')}</p>
                <p className="text-gray-800 font-medium flex items-center">
                    <span className="material-icons text-gray-400 text-sm mr-2">person</span>
                    {project.head_researcher}
                </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t('fundingYear')}</p>
                <p className="text-gray-800 font-medium flex items-center">
                    <span className="material-icons text-gray-400 text-sm mr-2">calendar_today</span>
                    {project.funding_fiscal_year}
                </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t('budget')}</p>
                <p className="text-gray-800 font-medium flex items-center">
                    <span className="material-icons text-gray-400 text-sm mr-2">payments</span>
                    {project.budget_amount.toLocaleString()} THB
                </p>
            </div>
             <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t('fundingSource')}</p>
                <p className="text-gray-800 font-medium">{t(project.funding_source)}</p>
            </div>
             <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t('category')}</p>
                <p className="text-gray-800 font-medium">{t(project.research_category)}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Linked Publications */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-tnsu-yellow-100 p-2 rounded-lg mr-3 text-tnsu-yellow-600">
                      <span className="material-icons text-xl">article</span>
                  </span>
                  {t('publications')}
                  <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{linkedPubs.length}</span>
              </h3>
              
              <div className="space-y-3">
                  {linkedPubs.length > 0 ? linkedPubs.map(pub => (
                      <div key={pub.output_id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                              <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded border border-green-100">
                                  {pub.output_reporting_year}
                              </span>
                              <span className="text-xs text-gray-400">{pub.publication_level}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-800 leading-snug">{pub.article_title}</p>
                          <p className="text-xs text-gray-500 mt-1">{pub.publication_type}</p>
                          {pub.file_url && (
                            <a href={pub.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-flex items-center">
                              <span className="material-icons text-[12px] mr-1">link</span>
                              View Linked Document
                            </a>
                          )}
                      </div>
                  )) : (
                      <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          {t('noPubs')}
                      </div>
                  )}
              </div>
          </div>

          {/* Utilization Data */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-lg mr-3 text-blue-600">
                      <span className="material-icons text-xl">handshake</span>
                  </span>
                  {t('utilization')}
                  <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{linkedUtils.length}</span>
              </h3>

               <div className="space-y-3">
                  {linkedUtils.length > 0 ? linkedUtils.map(ut => (
                      <div key={ut.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                          <div className="flex justify-between items-start mb-2 pl-2">
                               <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                                  {ut.utilization_type}
                               </span>
                               <span className="text-xs text-gray-400">{ut.utilization_reporting_year}</span>
                          </div>
                          <p className="text-sm text-gray-700 pl-2">{ut.description}</p>
                          {ut.evidence_url && (
                            <a href={ut.evidence_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-flex items-center pl-2">
                              <span className="material-icons text-[12px] mr-1">link</span>
                              View Evidence
                            </a>
                          )}
                      </div>
                  )) : (
                      <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          {t('noUtils')}
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
