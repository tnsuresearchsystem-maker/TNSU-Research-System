import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProjectForm from './components/ProjectForm';
import PublicationForm from './components/PublicationForm';
import Chatbot from './components/Chatbot';
import Login from './components/Login';
import { ProjectMaster, PublicationOutput } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getProjectsFromDB, getPublicationsFromDB, addProjectToDB, addPublicationToDB, seedDatabase } from './services/dbService';
import { initialProjects, initialPublications } from './services/mockData';

function AppContent() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState<ProjectMaster[]>([]);
  const [publications, setPublications] = useState<PublicationOutput[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Views control
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showPubForm, setShowPubForm] = useState(false);

  // Fetch Data function
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedProjects, fetchedPubs] = await Promise.all([
        getProjectsFromDB(),
        getPublicationsFromDB()
      ]);
      setProjects(fetchedProjects);
      setPublications(fetchedPubs);
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

  const handleAddProject = async (newProject: ProjectMaster) => {
    try {
      // Optimistic Update
      setProjects(prev => [...prev, newProject]);
      setShowProjectForm(false);
      
      // Save to DB
      await addProjectToDB(newProject);
    } catch (error) {
      alert("Error saving project to database. Please check console.");
      // Rollback if needed (simplified here)
    }
  };

  const handleAddPublication = async (newPub: PublicationOutput) => {
    try {
      // Optimistic Update
      setPublications(prev => [...prev, newPub]);
      setShowPubForm(false);
      
      // Save to DB
      await addPublicationToDB(newPub);
    } catch (error) {
      alert("Error saving publication to database.");
    }
  };

  const handleSeedData = async () => {
    if (confirm("This will add sample data to your Firestore database. Continue?")) {
      setIsSeeding(true);
      try {
        await seedDatabase(initialProjects, initialPublications);
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
        return <ProjectForm onAddProject={handleAddProject} onCancel={() => setShowProjectForm(false)} />;
      }
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-800">{t('projects')}</h2>
             <button 
              onClick={() => setShowProjectForm(true)}
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map(p => (
                  <tr key={p.project_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.project_id}</td>
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
                            <span className="text-gray-900 font-medium hover:text-tnsu-green-700 cursor-pointer">{project.project_name}</span>
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
    return <div>Select a tab</div>;
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
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