import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import FilterBar from '../FilterBar';
import { PersonnelDevelopment } from '../../types';
import { CSVType } from '../../services/csvService';
import { ALL_ORGANIZATIONS, FACULTIES } from '../../constants';
import PersonnelForm from '../PersonnelForm';
import FacultyLecturerModal from '../FacultyLecturerModal';

interface PersonnelTabProps {
  personnel: PersonnelDevelopment[];
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
  showPersonnelForm: boolean;
  setShowPersonnelForm: (show: boolean) => void;
  editingPersonnel: PersonnelDevelopment | null;
  setEditingPersonnel: (personnel: PersonnelDevelopment | null) => void;
  handleSavePersonnel: (personnel: PersonnelDevelopment) => void;
  handleDeletePersonnel: (personnel: PersonnelDevelopment) => void;
}

const PersonnelTab: React.FC<PersonnelTabProps> = ({
  personnel,
  filterFiscalYear, setFilterFiscalYear,
  filterRegion, setFilterRegion,
  filterOrgType, setFilterOrgType,
  filterCampus, setFilterCampus,
  setCsvImportType, exportToCSV,
  showPersonnelForm, setShowPersonnelForm,
  editingPersonnel, setEditingPersonnel,
  handleSavePersonnel, handleDeletePersonnel
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [viewingPersonnel, setViewingPersonnel] = useState<PersonnelDevelopment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getOrgName = (id: string) => {
    const org = ALL_ORGANIZATIONS.find(o => o.id === id || o.nameEn === id || o.nameTh === id);
    return org ? org.nameTh : id;
  };

  const getFacultyName = (id: string | undefined) => {
    if (!id) return '-';
    const faculty = FACULTIES.find(f => f.id === id);
    return faculty ? faculty.nameTh : id;
  };

  if (showPersonnelForm) {
    return (
      <PersonnelForm 
        onSave={handleSavePersonnel} 
        onCancel={() => { setShowPersonnelForm(false); setEditingPersonnel(null); }} 
        initialData={editingPersonnel}
      />
    );
  }

  // Filter logic
  const filteredPersonnel = personnel.filter(pd => {
    if (filterFiscalYear && pd.fiscal_year !== filterFiscalYear) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = pd.staff_name.toLowerCase().includes(query);
      const matchCourse = pd.course_name.toLowerCase().includes(query);
      if (!matchName && !matchCourse) return false;
    }

    const org = ALL_ORGANIZATIONS.find(o => o.id === pd.organization_name || o.nameEn === pd.organization_name || o.nameTh === pd.organization_name);
    
    if (filterCampus && org?.nameEn !== filterCampus) return false;
    if (filterRegion && org?.region !== filterRegion) return false;
    if (filterOrgType && org?.type !== filterOrgType) return false;
    
    if (user?.role !== 'Admin' && org?.nameEn !== user?.organization.nameEn) return false;
    
    return true;
  });

  return (
    <div className="space-y-6">
      {showFacultyModal && <FacultyLecturerModal onClose={() => setShowFacultyModal(false)} />}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <h2 className="text-2xl font-bold text-gray-800">{t('personnel')}</h2>
         <div className="flex flex-wrap gap-2 md:gap-3">
           <div className="relative">
             <input 
               type="text" 
               placeholder={t('searchPlaceholder') || 'Search...'}
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all w-full md:w-64"
             />
             <span className="material-icons absolute left-3 top-3 text-gray-400 text-lg">search</span>
           </div>
           <FilterBar 
             filterFiscalYear={filterFiscalYear} setFilterFiscalYear={setFilterFiscalYear}
             filterRegion={filterRegion} setFilterRegion={setFilterRegion}
             filterOrgType={filterOrgType} setFilterOrgType={setFilterOrgType}
             filterCampus={filterCampus} setFilterCampus={setFilterCampus}
           />
           <button 
             onClick={() => setShowFacultyModal(true)}
             className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg flex items-center shadow-sm transition-colors"
           >
             <span className="material-icons mr-2 text-gray-500">groups</span>
             {t('totalLecturers') || 'Total Lecturers'}
           </button>
           <button 
             onClick={() => exportToCSV(filteredPersonnel, 'personnel', `personnel_${new Date().toISOString().split('T')[0]}`)}
             className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg flex items-center shadow-sm transition-colors"
           >
             <span className="material-icons mr-2 text-gray-500">download</span>
             {t('exportCsv') || 'Export CSV'}
           </button>
           <button 
             onClick={() => setCsvImportType('personnel')}
             className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg flex items-center shadow-sm transition-colors"
           >
             <span className="material-icons mr-2 text-gray-500">upload_file</span>
             {t('importCsv') || 'Import CSV'}
           </button>
           <button 
            onClick={() => { setEditingPersonnel(null); setShowPersonnelForm(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-colors"
           >
             <span className="material-icons mr-2">add</span>
             {t('addPersonnel')}
           </button>
         </div>
      </div>

      <div className="bg-white shadow-md rounded-xl overflow-x-auto border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('fiscalYear')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('staffName')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('faculty') || 'Faculty (คณะ)'}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('campusOrg')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('courseName')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('devType')}</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPersonnel.map((pd, index) => (
              <tr 
                key={`${pd.id}_${index}`} 
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setViewingPersonnel(pd)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-700">
                  <span className="bg-indigo-50 px-2 py-1 rounded border border-indigo-100">{pd.fiscal_year}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pd.staff_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getFacultyName(pd.faculty)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getOrgName(pd.organization_name)}</td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={pd.course_name}>{pd.course_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">
                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 text-xs font-medium w-fit mb-1">{pd.development_type}</span>
                    <span className="text-xs text-gray-400">{pd.duration_hours} Hrs • {pd.activity_date}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setViewingPersonnel(pd); }}
                      className="text-gray-400 hover:text-blue-600 transition-colors bg-white hover:bg-blue-50 rounded-full p-2"
                      title={t('viewDetails') || 'View Details'}
                    >
                      <span className="material-icons text-lg">visibility</span>
                    </button>
                    {pd.certificate_url && (
                      <button 
                        className="text-gray-400 hover:text-red-600 transition-colors bg-white hover:bg-red-50 rounded-full p-2"
                        title="View PDF"
                        onClick={(e) => { e.stopPropagation(); window.open(pd.certificate_url, '_blank'); }}
                      >
                        <span className="material-icons text-lg">picture_as_pdf</span>
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPersonnel(pd);
                        setShowPersonnelForm(true);
                      }}
                      className="text-gray-400 hover:text-indigo-600 transition-colors bg-white hover:bg-indigo-50 rounded-full p-2"
                      title={t('edit')}
                    >
                      <span className="material-icons text-lg">edit</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeletePersonnel(pd); }}
                      className="text-gray-400 hover:text-red-600 transition-colors bg-white hover:bg-red-50 rounded-full p-2"
                      title={t('delete')}
                    >
                      <span className="material-icons text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Personnel Details Modal */}
      {viewingPersonnel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="material-icons mr-2 text-indigo-600">person</span>
                {t('personnelDetails') || 'Personnel Details'}
              </h3>
              <button 
                onClick={() => setViewingPersonnel(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('staffName')}</p>
                  <p className="font-medium text-gray-900">{viewingPersonnel.staff_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('fiscalYear')}</p>
                  <p className="font-medium text-gray-900">{viewingPersonnel.fiscal_year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('campusOrg')}</p>
                  <p className="font-medium text-gray-900">{getOrgName(viewingPersonnel.organization_name)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('faculty') || 'Faculty (คณะ)'}</p>
                  <p className="font-medium text-gray-900">{getFacultyName(viewingPersonnel.faculty)}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">{t('courseName')}</p>
                  <p className="font-medium text-gray-900">{viewingPersonnel.course_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('devType')}</p>
                  <p className="font-medium text-gray-900">{viewingPersonnel.development_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Activity Date & Duration</p>
                  <p className="font-medium text-gray-900">{viewingPersonnel.activity_date} ({viewingPersonnel.duration_hours} Hrs)</p>
                </div>
                {viewingPersonnel.certificate_url && (
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Certificate</p>
                    <a 
                      href={viewingPersonnel.certificate_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      <span className="material-icons text-sm mr-1">link</span>
                      View Certificate Document
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setViewingPersonnel(null)}
                className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                {t('close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelTab;
