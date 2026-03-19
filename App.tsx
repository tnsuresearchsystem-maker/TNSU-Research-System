
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProjectForm from './components/ProjectForm';
import PublicationForm from './components/PublicationForm';
import UtilizationForm from './components/UtilizationForm';
import PersonnelForm from './components/PersonnelForm';
import AssetForm from './components/AssetForm';
import UserForm from './components/UserForm';
import UserManagement from './components/UserManagement';
import ProjectDetails from './components/ProjectDetails';
import Chatbot from './components/Chatbot';
import Login from './components/Login';
import CSVImportModal from './components/CSVImportModal';
import { ProjectMaster, PublicationOutput, Utilization, PersonnelDevelopment, MOU, IntellectualProperty, User, ReportingPeriod } from './types';
import { FISCAL_YEARS, ALL_ORGANIZATIONS, REGIONS } from './constants';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getProjectsFromDB, getPublicationsFromDB, getUtilizationsFromDB, getPersonnelFromDB, getMOUsFromDB, getIPsFromDB, getUsersFromDB, addProjectToDB, updateProjectInDB, deleteProjectFromDB, addPublicationToDB, updatePublicationInDB, addUtilizationToDB, updateUtilizationInDB, addPersonnelToDB, updatePersonnelInDB, addMOUToDB, addIPToDB, addUserToDB, updateUserInDB, deleteUserFromDB, seedDatabase, logUserActivity } from './services/dbService';
import { initialProjects, initialPublications, initialUtilizations, initialPersonnel, initialMOUs, initialIPs, initialUsers } from './services/mockData';
import { CSVType, exportToCSV } from './services/csvService';

function AppContent() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState<ProjectMaster[]>([]);
  const [publications, setPublications] = useState<PublicationOutput[]>([]);
  const [utilizations, setUtilizations] = useState<Utilization[]>([]);
  const [personnel, setPersonnel] = useState<PersonnelDevelopment[]>([]);
  const [mous, setMOUs] = useState<MOU[]>([]);
  const [ips, setIPs] = useState<IntellectualProperty[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Views control
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showPubForm, setShowPubForm] = useState(false);
  const [showUtilForm, setShowUtilForm] = useState(false);
  const [showPersonnelForm, setShowPersonnelForm] = useState(false);
  const [showAssetFormType, setShowAssetFormType] = useState<'mou' | 'ip' | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [csvImportType, setCsvImportType] = useState<CSVType | null>(null);
  
  // Selected / Editing States
  const [selectedProject, setSelectedProject] = useState<ProjectMaster | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectMaster | null>(null);
  const [editingUtilization, setEditingUtilization] = useState<Utilization | null>(null);
  const [editingPersonnel, setEditingPersonnel] = useState<PersonnelDevelopment | null>(null);
  const [editingPublication, setEditingPublication] = useState<PublicationOutput | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Search States
  const [utilSearchQuery, setUtilSearchQuery] = useState('');
  const [filterFiscalYear, setFilterFiscalYear] = useState<string>('');
  const [filterCampus, setFilterCampus] = useState<string>('');
  const [filterReportingPeriod, setFilterReportingPeriod] = useState<string>('');
  const [filterRegion, setFilterRegion] = useState<string>('');

  // Fetch Data function
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // If admin, fetch users too
      // Note: Passing the array literal directly to Promise.all ensures proper tuple type inference
      const [fetchedProjects, fetchedPubs, fetchedUtils, fetchedPersonnel, fetchedMOUs, fetchedIPs] = await Promise.all([
        getProjectsFromDB(),
        getPublicationsFromDB(),
        getUtilizationsFromDB(),
        getPersonnelFromDB(),
        getMOUsFromDB(),
        getIPsFromDB()
      ]);
      
      setProjects(fetchedProjects);
      setPublications(fetchedPubs);
      setUtilizations(fetchedUtils);
      setPersonnel(fetchedPersonnel);
      setMOUs(fetchedMOUs);
      setIPs(fetchedIPs);

      // Fetch users separately
      if (user?.role === 'Admin') {
         const fetchedUsers = await getUsersFromDB();
         setUsers(fetchedUsers);
      }

    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Data from Firebase on Load
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // If no user is logged in, show Login
  if (!user) {
    return <Login />;
  }

  const handleSaveProject = async (project: ProjectMaster) => {
    if (editingProject) {
      try {
        setProjects(prev => prev.map(p => p.project_id === project.project_id ? project : p));
        setShowProjectForm(false);
        setEditingProject(null);
        await updateProjectInDB(project);
        if (selectedProject?.project_id === project.project_id) {
           setSelectedProject(project);
        }
      } catch (error) {
        alert("Error updating project in database.");
        fetchData();
      }
    } else {
      try {
        setProjects(prev => [...prev, project]);
        setShowProjectForm(false);
        await addProjectToDB(project);
      } catch (error) {
        alert("Error saving project to database.");
      }
    }
  };

  const handleSavePublication = async (pub: PublicationOutput) => {
    if (editingPublication) {
      try {
        setPublications(prev => prev.map(p => p.output_id === pub.output_id ? pub : p));
        setShowPubForm(false);
        setEditingPublication(null);
        await updatePublicationInDB(pub);
      } catch (error) {
        alert("Error updating publication in database.");
        fetchData();
      }
    } else {
      try {
        setPublications(prev => [...prev, pub]);
        setShowPubForm(false);
        await addPublicationToDB(pub);
      } catch (error) {
        alert("Error saving publication to database.");
      }
    }
  };

  const handleSaveUtilization = async (util: Utilization) => {
    if (editingUtilization) {
      try {
        setUtilizations(prev => prev.map(u => u.id === util.id ? util : u));
        setShowUtilForm(false);
        setEditingUtilization(null);
        await updateUtilizationInDB(util);
      } catch (error) {
         alert("Error updating utilization in database.");
         fetchData();
      }
    } else {
      try {
         setUtilizations(prev => [...prev, util]);
         setShowUtilForm(false);
         await addUtilizationToDB(util);
      } catch (error) {
        alert("Error saving utilization to database.");
      }
    }
  };

  const handleSavePersonnel = async (pd: PersonnelDevelopment) => {
    if (editingPersonnel) {
      try {
        setPersonnel(prev => prev.map(p => p.id === pd.id ? pd : p));
        setShowPersonnelForm(false);
        setEditingPersonnel(null);
        await updatePersonnelInDB(pd);
      } catch (error) {
        alert("Error updating personnel record.");
        fetchData();
      }
    } else {
      try {
        setPersonnel(prev => [...prev, pd]);
        setShowPersonnelForm(false);
        await addPersonnelToDB(pd);
      } catch (error) {
        alert("Error saving personnel record.");
      }
    }
  };

  const handleSaveMOU = async (mou: MOU) => {
    try {
      setMOUs(prev => [...prev, mou]);
      setShowAssetFormType(null);
      await addMOUToDB(mou);
    } catch (error) {
      alert("Error saving MOU.");
    }
  };

  const handleSaveIP = async (ip: IntellectualProperty) => {
    try {
      setIPs(prev => [...prev, ip]);
      setShowAssetFormType(null);
      await addIPToDB(ip);
    } catch (error) {
      alert("Error saving IP.");
    }
  };

  const handleSaveUser = async (u: User) => {
     if (editingUser) {
        try {
           setUsers(prev => prev.map(usr => usr.id === u.id ? u : usr));
           setShowUserForm(false);
           setEditingUser(null);
           await updateUserInDB(u, user); // Pass 'user' for logging
        } catch (error) {
           alert("Error updating user.");
        }
     } else {
        try {
           setUsers(prev => [...prev, u]);
           setShowUserForm(false);
           await addUserToDB(u, user); // Pass 'user' for logging
        } catch (error: any) {
           alert(error.message || "Error adding user.");
        }
     }
  };

  const handleBulkAddUsers = async (newUsers: User[]) => {
    const uniqueNewUsers = newUsers.filter(nu => !users.some(u => u.username === nu.username));
    
    if (uniqueNewUsers.length === 0) {
      alert("All users in CSV already exist.");
      return;
    }

    try {
      setUsers(prev => [...prev, ...uniqueNewUsers]);
      // Save to DB in parallel
      await Promise.all(uniqueNewUsers.map(u => addUserToDB(u)));
      // Log the bulk action
      if (user) {
        await logUserActivity(user, 'IMPORT', 'User', `Bulk imported ${uniqueNewUsers.length} users via CSV`);
      }
    } catch (error) {
      console.error("Bulk add error:", error);
      alert("Some users might not have been saved due to errors.");
      fetchData(); 
    }
  };

  const handleDeleteUser = async (id: string) => {
      if (confirm(t('confirmDeleteUser'))) {
          try {
              setUsers(prev => prev.filter(u => u.id !== id));
              await deleteUserFromDB(id, user || undefined); // Pass 'user' for logging
          } catch (error) {
              alert("Error deleting user");
          }
      }
  };

  const handleSeedData = async () => {
    if (confirm("This will add sample data to your Firestore database. Continue?")) {
      setIsSeeding(true);
      try {
        await seedDatabase(initialProjects, initialPublications, initialUtilizations, initialPersonnel, initialMOUs, initialIPs, initialUsers);
        if (user) {
           await logUserActivity(user, 'CREATE', 'System', 'Seeded initial database data');
        }
        await fetchData(); // Reload data
      } catch (e) {
        alert("Error seeding data");
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const handleDeleteProject = async (project: ProjectMaster) => {
    if (window.confirm(t('confirmDeleteProject'))) {
      try {
        await deleteProjectFromDB(project.project_id);
        setProjects(prev => prev.filter(p => p.project_id !== project.project_id));
        // Log activity
        if (user) {
          await logUserActivity(user, 'DELETE', 'Project', `Deleted project: ${project.project_name}`);
        }
      } catch (error) {
        console.error("Failed to delete project:", error);
        alert(t('deleteError'));
      }
    }
  };

  const handleCSVImport = async (data: any[]) => {
    try {
      if (csvImportType === 'project') {
        await Promise.all(data.map(item => addProjectToDB(item as ProjectMaster)));
      } else if (csvImportType === 'publication') {
        await Promise.all(data.map(item => addPublicationToDB(item as PublicationOutput)));
      } else if (csvImportType === 'utilization') {
        await Promise.all(data.map(item => addUtilizationToDB(item as Utilization)));
      } else if (csvImportType === 'personnel') {
        await Promise.all(data.map(item => addPersonnelToDB(item as PersonnelDevelopment)));
      } else if (csvImportType === 'mou') {
        await Promise.all(data.map(item => addMOUToDB(item as MOU)));
      } else if (csvImportType === 'ip') {
        await Promise.all(data.map(item => addIPToDB(item as IntellectualProperty)));
      } else if (csvImportType === 'user') {
        // Users are handled specially in handleBulkAddUsers, but we can reuse logic or call it here
        // For simplicity, let's just use the existing logic if possible, or reimplement
        // Since handleBulkAddUsers does extra checks, let's just call it if we can, or copy logic.
        // But handleBulkAddUsers expects User[], data is any[].
        const newUsers = data as User[];
        const uniqueNewUsers = newUsers.filter(nu => !users.some(u => u.username === nu.username));
        if (uniqueNewUsers.length > 0) {
           await Promise.all(uniqueNewUsers.map(u => addUserToDB(u, user)));
        }
      }

      if (user) {
        await logUserActivity(user, 'IMPORT', 'System', `Bulk imported ${data.length} records for ${csvImportType}`);
      }
      
      alert(`Successfully imported ${data.length} records.`);
      setCsvImportType(null);
      fetchData();
    } catch (error) {
      console.error("Import error:", error);
      alert("Error importing data. Please check the console and your CSV format.");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tnsu-green-600"></div>
        </div>
      );
    }

    if (activeTab === 'dashboard') {
      return (
        <Dashboard 
          projects={projects} 
          publications={publications} 
          personnel={personnel}
          mous={mous}
          ips={ips}
          onSeedData={handleSeedData}
          isSeeding={isSeeding}
        />
      );
    }

    if (activeTab === 'projects') {
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
            onBack={() => setSelectedProject(null)}
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
        if (filterCampus && p.campus_id !== filterCampus) return false;
        if (filterReportingPeriod && p.reporting_period !== filterReportingPeriod) return false;
        
        if (filterRegion) {
          const org = ALL_ORGANIZATIONS.find(o => o.nameEn === p.campus_id);
          if (!org || org.region !== filterRegion) return false;
        }

        // If not admin, only show projects from their own campus
        if (user?.role !== 'Admin' && p.campus_id !== user?.organization.nameEn) return false;
        
        return true;
      });

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-800">{t('projects')}</h2>
             <div className="flex space-x-3">
               {/* Region Filter (Admin only) */}
               {user?.role === 'Admin' && (
                 <select
                   value={filterRegion}
                   onChange={(e) => { setFilterRegion(e.target.value); setFilterCampus(''); }}
                   className="bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tnsu-green-500 max-w-[200px] truncate"
                 >
                   <option value="">{t('allRegions') || 'All Regions'}</option>
                   {REGIONS.map(region => (
                     <option key={region} value={region}>
                       {language === 'th' ? 
                         (region === 'Northern Region' ? 'ภาคเหนือ' : 
                          region === 'Northeastern Region' ? 'ภาคตะวันออกเฉียงเหนือ' : 
                          region === 'Central Region' ? 'ภาคกลาง' : 
                          region === 'Southern Region' ? 'ภาคใต้' : region) 
                         : region}
                     </option>
                   ))}
                 </select>
               )}
               {/* Campus Filter (Admin only) */}
               {user?.role === 'Admin' && (
                 <select
                   value={filterCampus}
                   onChange={(e) => setFilterCampus(e.target.value)}
                   className="bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tnsu-green-500 max-w-[200px] truncate"
                 >
                   <option value="">{t('allOrgs') || 'All Organizations'}</option>
                   {ALL_ORGANIZATIONS
                     .filter(org => !filterRegion || org.region === filterRegion)
                     .map(org => (
                     <option key={org.id} value={org.nameEn}>
                       {language === 'th' ? org.nameTh : org.nameEn}
                     </option>
                   ))}
                 </select>
               )}
               {/* Reporting Period Filter */}
               <select
                 value={filterReportingPeriod}
                 onChange={(e) => setFilterReportingPeriod(e.target.value)}
                 className="bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tnsu-green-500"
               >
                 <option value="">{t('allPeriods') || 'All Periods'}</option>
                 <option value={ReportingPeriod.Round6Months}>{ReportingPeriod.Round6Months}</option>
                 <option value={ReportingPeriod.Round12Months}>{ReportingPeriod.Round12Months}</option>
               </select>
               {/* Fiscal Year Filter */}
               <select
                 value={filterFiscalYear}
                 onChange={(e) => setFilterFiscalYear(e.target.value)}
                 className="bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tnsu-green-500"
               >
                 <option value="">{t('allYears')}</option>
                 {FISCAL_YEARS.map(year => (
                   <option key={year} value={year}>{year}</option>
                 ))}
               </select>
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
          
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
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
                {filteredProjects.map(p => (
                  <tr 
                    key={p.project_id} 
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
                    <td className="px-6 py-4 text-sm text-gray-600">{p.campus_id}</td>
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
    }

    if (activeTab === 'publications') {
      if (showPubForm) {
        return (
          <PublicationForm 
            projects={projects} 
            onSave={handleSavePublication} 
            onCancel={() => { setShowPubForm(false); setEditingPublication(null); }} 
            initialData={editingPublication}
          />
        );
      }
      
      // Filter logic
      const filteredPublications = publications.filter(pub => {
        if (filterFiscalYear && pub.output_reporting_year !== filterFiscalYear) return false;
        return true;
      });

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-800">{t('publications')}</h2>
             <div className="flex space-x-3">
               {/* Fiscal Year Filter */}
               <select
                 value={filterFiscalYear}
                 onChange={(e) => setFilterFiscalYear(e.target.value)}
                 className="bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tnsu-green-500"
               >
                 <option value="">{t('allYears')}</option>
                 {FISCAL_YEARS.map(year => (
                   <option key={year} value={year}>{year}</option>
                 ))}
               </select>
               <button 
                 onClick={() => setCsvImportType('publication')}
                 className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg flex items-center shadow-sm transition-colors"
               >
                 <span className="material-icons mr-2 text-gray-500">upload_file</span>
                 {t('importCsv') || 'Import CSV'}
               </button>
               <button 
                 onClick={() => exportToCSV(filteredPublications, 'publication', `publications_export_${new Date().toISOString().split('T')[0]}.csv`)}
                 className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg flex items-center shadow-sm transition-colors"
               >
                 <span className="material-icons mr-2 text-gray-500">download</span>
                 {t('exportCsv') || 'Export CSV'}
               </button>
               <button 
                 onClick={() => { setEditingPublication(null); setShowPubForm(true); }}
                 className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-colors"
               >
                 <span className="material-icons mr-2">add</span>
                 {t('addPub')}
               </button>
             </div>
          </div>

          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
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
                {filteredPublications.map(pub => {
                  const project = projects.find(p => p.project_id === pub.ref_project_id);
                  return (
                    <tr key={pub.output_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">
                        <span className="bg-green-50 px-2 py-1 rounded border border-green-100">{pub.output_reporting_year}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {project ? (
                          <div className="flex flex-col">
                            <span 
                              className="text-gray-900 font-medium hover:text-tnsu-green-700 cursor-pointer"
                              onClick={() => {
                                setActiveTab('projects');
                                setSelectedProject(project);
                              }}
                            >
                              {project.project_name}
                            </span>
                            <span className="text-xs text-gray-400 mt-1">Funded: {project.funding_fiscal_year}</span>
                          </div>
                        ) : 'Unknown Project'}
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    
    if (activeTab === 'personnel') {
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
        return true;
      });

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-800">{t('personnel')}</h2>
             <div className="flex space-x-3">
               {/* Fiscal Year Filter */}
               <select
                 value={filterFiscalYear}
                 onChange={(e) => setFilterFiscalYear(e.target.value)}
                 className="bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tnsu-green-500"
               >
                 <option value="">{t('allYears')}</option>
                 {FISCAL_YEARS.map(year => (
                   <option key={year} value={year}>{year}</option>
                 ))}
               </select>
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

          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('fiscalYear')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('staffName')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('campusOrg')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('courseName')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('devType')}</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPersonnel.map(pd => (
                  <tr key={pd.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-700">
                      <span className="bg-indigo-50 px-2 py-1 rounded border border-indigo-100">{pd.fiscal_year}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pd.staff_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pd.organization_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={pd.course_name}>{pd.course_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 text-xs font-medium w-fit mb-1">{pd.development_type}</span>
                        <span className="text-xs text-gray-400">{pd.duration_hours} Hrs • {pd.activity_date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {pd.certificate_url && (
                          <button 
                            className="text-gray-400 hover:text-red-600 transition-colors bg-white hover:bg-red-50 rounded-full p-2"
                            title="View PDF"
                          >
                            <span className="material-icons text-lg">picture_as_pdf</span>
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setEditingPersonnel(pd);
                            setShowPersonnelForm(true);
                          }}
                          className="text-gray-400 hover:text-indigo-600 transition-colors bg-white hover:bg-indigo-50 rounded-full p-2"
                          title={t('edit')}
                        >
                          <span className="material-icons text-lg">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'utilization') {
      if (showUtilForm) {
        return (
          <UtilizationForm 
            projects={projects} 
            onSave={handleSaveUtilization} 
            onCancel={() => { setShowUtilForm(false); setEditingUtilization(null); }} 
            initialData={editingUtilization}
          />
        );
      }

      // Filter logic
      const filteredUtilizations = utilizations.filter(ut => {
        const project = projects.find(p => p.project_id === ut.ref_project_id);
        const term = utilSearchQuery.toLowerCase();
        const matchesSearch = (
          ut.description.toLowerCase().includes(term) ||
          ut.utilization_type.toLowerCase().includes(term) ||
          (project && project.project_name.toLowerCase().includes(term))
        );
        const matchesYear = filterFiscalYear ? ut.utilization_reporting_year === filterFiscalYear : true;
        return matchesSearch && matchesYear;
      });

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-800">{t('utilization')}</h2>
             <div className="flex space-x-3">
               {/* Fiscal Year Filter */}
               <select
                 value={filterFiscalYear}
                 onChange={(e) => setFilterFiscalYear(e.target.value)}
                 className="bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tnsu-green-500"
               >
                 <option value="">{t('allYears')}</option>
                 {FISCAL_YEARS.map(year => (
                   <option key={year} value={year}>{year}</option>
                 ))}
               </select>
               <button 
                 onClick={() => exportToCSV(filteredUtilizations, 'utilization', `utilization_${new Date().toISOString().split('T')[0]}`)}
                 className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg flex items-center shadow-sm transition-colors"
               >
                 <span className="material-icons mr-2 text-gray-500">download</span>
                 {t('exportCsv') || 'Export CSV'}
               </button>
               <button 
                 onClick={() => setCsvImportType('utilization')}
                 className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg flex items-center shadow-sm transition-colors"
               >
                 <span className="material-icons mr-2 text-gray-500">upload_file</span>
                 {t('importCsv') || 'Import CSV'}
               </button>
               <button 
                onClick={() => { setEditingUtilization(null); setShowUtilForm(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-colors"
               >
                 <span className="material-icons mr-2">add</span>
                 {t('addUtil')}
               </button>
             </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="relative">
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')}
                value={utilSearchQuery}
                onChange={(e) => setUtilSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
              />
              <span className="material-icons absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('reportYear')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('linkProject')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('description')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('type')}</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUtilizations.length > 0 ? (
                  filteredUtilizations.map(ut => {
                    const project = projects.find(p => p.project_id === ut.ref_project_id);
                    return (
                      <tr key={ut.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-700">
                          <span className="bg-blue-50 px-2 py-1 rounded border border-blue-100">{ut.utilization_reporting_year}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {project ? (
                            <div className="flex flex-col">
                              <span 
                                className="text-gray-900 font-medium hover:text-blue-600 cursor-pointer"
                                onClick={() => {
                                  setActiveTab('projects');
                                  setSelectedProject(project);
                                }}
                              >
                                {project.project_name}
                              </span>
                              <span className="text-xs text-gray-400 mt-1">Funded: {project.funding_fiscal_year}</span>
                            </div>
                          ) : 'Unknown Project'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={ut.description}>
                          {ut.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 text-xs font-medium">{ut.utilization_type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                             {ut.evidence_url && (
                                <button className="text-gray-400 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-full p-2">
                                  <span className="material-icons text-lg">attachment</span>
                                </button>
                             )}
                              <button 
                                onClick={() => {
                                  setEditingUtilization(ut);
                                  setShowUtilForm(true);
                                }}
                                className="text-gray-400 hover:text-blue-600 transition-colors bg-white hover:bg-blue-50 rounded-full p-2"
                                title={t('edit')}
                              >
                                <span className="material-icons text-lg">edit</span>
                              </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                      No utilization records found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    
    // Module 5 View
    if (activeTab === 'ip_mou') {
       if (showAssetFormType) {
         return (
           <AssetForm 
             type={showAssetFormType} 
             onCancel={() => setShowAssetFormType(null)}
             onSaveMOU={handleSaveMOU}
             onSaveIP={handleSaveIP}
           />
         );
       }

       // Filter logic
       const filteredMOUs = mous.filter(m => {
         if (filterFiscalYear && m.fiscal_year !== filterFiscalYear) return false;
         return true;
       });
       
       const filteredIPs = ips.filter(i => {
         if (filterFiscalYear && i.fiscal_year !== filterFiscalYear) return false;
         return true;
       });

       return (
         <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{t('ip_mou')}</h2>
              <div className="flex space-x-3">
                 {/* Fiscal Year Filter */}
                 <select
                   value={filterFiscalYear}
                   onChange={(e) => setFilterFiscalYear(e.target.value)}
                   className="bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tnsu-green-500"
                 >
                   <option value="">{t('allYears')}</option>
                   {FISCAL_YEARS.map(year => (
                     <option key={year} value={year}>{year}</option>
                   ))}
                 </select>
                 <div className="flex space-x-2 border-r border-gray-300 pr-3 mr-1">
                    <button 
                      onClick={() => exportToCSV(filteredMOUs, 'mou', `mou_${new Date().toISOString().split('T')[0]}`)}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-purple-700 px-3 py-2 rounded-lg flex items-center shadow-sm transition-colors text-sm"
                      title="Export MOU CSV"
                    >
                      <span className="material-icons mr-1.5 text-base">download</span>
                      MOU
                    </button>
                    <button 
                      onClick={() => setCsvImportType('mou')}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-purple-700 px-3 py-2 rounded-lg flex items-center shadow-sm transition-colors text-sm"
                      title="Import MOU CSV"
                    >
                      <span className="material-icons mr-1.5 text-base">upload_file</span>
                      MOU
                    </button>
                    <button 
                      onClick={() => exportToCSV(filteredIPs, 'ip', `ip_${new Date().toISOString().split('T')[0]}`)}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-pink-700 px-3 py-2 rounded-lg flex items-center shadow-sm transition-colors text-sm"
                      title="Export IP CSV"
                    >
                      <span className="material-icons mr-1.5 text-base">download</span>
                      IP
                    </button>
                    <button 
                      onClick={() => setCsvImportType('ip')}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-pink-700 px-3 py-2 rounded-lg flex items-center shadow-sm transition-colors text-sm"
                      title="Import IP CSV"
                    >
                      <span className="material-icons mr-1.5 text-base">upload_file</span>
                      IP
                    </button>
                 </div>
                 <button 
                  onClick={() => setShowAssetFormType('mou')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center shadow-md transition-colors text-sm"
                 >
                   <span className="material-icons mr-1.5 text-base">handshake</span>
                   {t('addMOU')}
                 </button>
                 <button 
                  onClick={() => setShowAssetFormType('ip')}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center shadow-md transition-colors text-sm"
                 >
                   <span className="material-icons mr-1.5 text-base">lightbulb</span>
                   {t('addIP')}
                 </button>
              </div>
            </div>

            {/* MOU Section */}
            <div>
               <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center border-b border-purple-100 pb-2">
                 <span className="material-icons mr-2">handshake</span>
                 {t('mou')}
               </h3>
               <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">{t('fiscalYear')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">{t('externalOrg')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">{t('signDate')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">{t('scope')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMOUs.map(m => (
                      <tr key={m.id} className="hover:bg-purple-50/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-700">{m.fiscal_year}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.external_org_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.sign_date}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{m.scope}</td>
                      </tr>
                    ))}
                    {mous.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-sm text-gray-400">No MOU records found.</td></tr>}
                  </tbody>
                </table>
               </div>
            </div>

            {/* IP Section */}
            <div>
               <h3 className="text-lg font-bold text-pink-800 mb-4 flex items-center border-b border-pink-100 pb-2">
                 <span className="material-icons mr-2">lightbulb</span>
                 {t('ip')}
               </h3>
               <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-pink-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-pink-800 uppercase tracking-wider">{t('fiscalYear')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-pink-800 uppercase tracking-wider">{t('workName')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-pink-800 uppercase tracking-wider">{t('ipType')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-pink-800 uppercase tracking-wider">{t('regNo')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-pink-800 uppercase tracking-wider">{t('regDate')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {filteredIPs.map(ip => (
                      <tr key={ip.id} className="hover:bg-pink-50/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-pink-700">{ip.fiscal_year}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{ip.work_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs font-medium">{ip.ip_type}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{ip.request_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{ip.registration_date}</td>
                      </tr>
                    ))}
                    {ips.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-sm text-gray-400">No Intellectual Property records found.</td></tr>}
                  </tbody>
                </table>
               </div>
            </div>
         </div>
       )
    }

    if (activeTab === 'users' && user.role === 'Admin') {
       if (showUserForm) {
         return (
            <UserForm 
              onSave={handleSaveUser}
              onCancel={() => { setShowUserForm(false); setEditingUser(null); }}
              initialData={editingUser}
            />
         )
       }
       return (
         <UserManagement 
            users={users}
            onAdd={() => setShowUserForm(true)}
            onEdit={(u) => { setEditingUser(u); setShowUserForm(true); }}
            onDelete={handleDeleteUser}
            onBulkAdd={handleBulkAddUsers}
         />
       )
    }

    // Fallback if trying to access admin tab
    if (activeTab === 'users' && user.role !== 'Admin') {
       setActiveTab('dashboard');
       return null;
    }

    return <div>Select a tab</div>;
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSelectedProject(null); setShowAssetFormType(null); setShowUserForm(false); }}>
      {renderContent()}
      <Chatbot projects={projects} publications={publications} />
      {csvImportType && (
        <CSVImportModal 
          type={csvImportType} 
          onImport={handleCSVImport} 
          onClose={() => setCsvImportType(null)} 
        />
      )}
    </Layout>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
