
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
import { ProjectMaster, PublicationOutput, Utilization, PersonnelDevelopment, MOU, IntellectualProperty, User } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getProjectsFromDB, getPublicationsFromDB, getUtilizationsFromDB, getPersonnelFromDB, getMOUsFromDB, getIPsFromDB, getUsersFromDB, addProjectToDB, updateProjectInDB, addPublicationToDB, addUtilizationToDB, updateUtilizationInDB, addPersonnelToDB, updatePersonnelInDB, addMOUToDB, addIPToDB, addUserToDB, updateUserInDB, deleteUserFromDB, seedDatabase } from './services/dbService';
import { initialProjects, initialPublications, initialUtilizations, initialPersonnel, initialMOUs, initialIPs, initialUsers } from './services/mockData';

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
  
  // Selected / Editing States
  const [selectedProject, setSelectedProject] = useState<ProjectMaster | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectMaster | null>(null);
  const [editingUtilization, setEditingUtilization] = useState<Utilization | null>(null);
  const [editingPersonnel, setEditingPersonnel] = useState<PersonnelDevelopment | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Search States
  const [utilSearchQuery, setUtilSearchQuery] = useState('');

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

  const handleAddPublication = async (newPub: PublicationOutput) => {
    try {
      setPublications(prev => [...prev, newPub]);
      setShowPubForm(false);
      await addPublicationToDB(newPub);
    } catch (error) {
      alert("Error saving publication to database.");
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
           await updateUserInDB(u);
        } catch (error) {
           alert("Error updating user.");
        }
     } else {
        try {
           setUsers(prev => [...prev, u]);
           setShowUserForm(false);
           await addUserToDB(u);
        } catch (error: any) {
           alert(error.message || "Error adding user.");
        }
     }
  };

  const handleBulkAddUsers = async (newUsers: User[]) => {
    // Filter out users that already exist locally to prevent duplicates in state
    // (Database will also throw error, but better to filter first)
    const uniqueNewUsers = newUsers.filter(nu => !users.some(u => u.username === nu.username));
    
    if (uniqueNewUsers.length === 0) {
      alert("All users in CSV already exist.");
      return;
    }

    try {
      // Optimistic update
      setUsers(prev => [...prev, ...uniqueNewUsers]);
      
      // Save to DB in parallel
      await Promise.all(uniqueNewUsers.map(u => addUserToDB(u)));
    } catch (error) {
      console.error("Bulk add error:", error);
      // In a real app, we might rollback state here
      alert("Some users might not have been saved due to errors.");
      fetchData(); // Reload to be safe
    }
  };

  const handleDeleteUser = async (id: string) => {
      if (confirm(t('confirmDeleteUser'))) {
          try {
              setUsers(prev => prev.filter(u => u.id !== id));
              await deleteUserFromDB(id);
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
        await fetchData(); // Reload data
      } catch (e) {
        alert("Error seeding data");
      } finally {
        setIsSeeding(false);
      }
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

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-800">{t('projects')}</h2>
             <button 
              onClick={() => { setEditingProject(null); setShowProjectForm(true); }}
              className="bg-tnsu-green-600 hover:bg-tnsu-green-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-colors"
             >
               <span className="material-icons mr-2">add</span>
               {t('addProject')}
             </button>
          </div>
          
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('fiscalYear')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('projectName')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('campusOrg')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('researcher')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('status')}</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map(p => (
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
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{p.project_name}</td>
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
        return <PublicationForm projects={projects} onAddPublication={handleAddPublication} onCancel={() => setShowPubForm(false)} />;
      }
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-800">{t('publications')}</h2>
             <button 
              onClick={() => setShowPubForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-colors"
             >
               <span className="material-icons mr-2">add</span>
               {t('addPub')}
             </button>
          </div>

          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('reportYear')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('linkProject')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('title')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('type')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {publications.map(pub => {
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

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-800">{t('personnel')}</h2>
             <button 
              onClick={() => { setEditingPersonnel(null); setShowPersonnelForm(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-colors"
             >
               <span className="material-icons mr-2">add</span>
               {t('addPersonnel')}
             </button>
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
                {personnel.map(pd => (
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
        return (
          ut.description.toLowerCase().includes(term) ||
          ut.utilization_type.toLowerCase().includes(term) ||
          (project && project.project_name.toLowerCase().includes(term))
        );
      });

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-800">{t('utilization')}</h2>
             <button 
              onClick={() => { setEditingUtilization(null); setShowUtilForm(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-colors"
             >
               <span className="material-icons mr-2">add</span>
               {t('addUtil')}
             </button>
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

       return (
         <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{t('ip_mou')}</h2>
              <div className="flex space-x-3">
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
                    {mous.map(m => (
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
                     {ips.map(ip => (
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
