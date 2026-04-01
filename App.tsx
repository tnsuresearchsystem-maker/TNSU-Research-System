
import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProjectsTab from './components/tabs/ProjectsTab';
import PublicationsTab from './components/tabs/PublicationsTab';
import PersonnelTab from './components/tabs/PersonnelTab';
import ProjectForm from './components/ProjectForm';
import PublicationForm from './components/PublicationForm';
import UtilizationForm from './components/UtilizationForm';
import PersonnelForm from './components/PersonnelForm';
import AssetForm from './components/AssetForm';
import UserForm from './components/UserForm';
import UserManagement from './components/UserManagement';
import ProjectDetails from './components/ProjectDetails';
import Login from './components/Login';
import CSVImportModal from './components/CSVImportModal';
import FacultyLecturerModal from './components/FacultyLecturerModal';
import FilterBar from './components/FilterBar';
import { ProjectMaster, PublicationOutput, Utilization, PersonnelDevelopment, MOU, IntellectualProperty, User, ReportingPeriod, ResearchCategory, ProjectStatus, FacultyLecturerCount, OrganizationType } from './types';
import { FISCAL_YEARS, ALL_ORGANIZATIONS, REGIONS, FACULTIES } from './constants';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useAppData } from './hooks/useAppData';
import { addProjectToDB, updateProjectInDB, deleteProjectFromDB, addPublicationToDB, updatePublicationInDB, deletePublicationFromDB, addUtilizationToDB, updateUtilizationInDB, deleteUtilizationFromDB, addPersonnelToDB, updatePersonnelInDB, deletePersonnelFromDB, addMOUToDB, updateMOUInDB, deleteMOUFromDB, addIPToDB, updateIPInDB, deleteIPFromDB, addUserToDB, updateUserInDB, deleteUserFromDB, seedDatabase, logUserActivity } from './services/dbService';
import { initialProjects, initialPublications, initialUtilizations, initialPersonnel, initialMOUs, initialIPs, initialUsers } from './services/mockData';
import { CSVType, exportToCSV } from './services/csvService';
import { ChangePasswordForm } from './components/ChangePasswordForm';

function AppContent() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [previousTab, setPreviousTab] = useState<string | null>(null);
  
  const {
    projects,
    publications,
    utilizations,
    personnel,
    mous,
    ips,
    users,
    facultyStats,
    isLoading,
    appError,
    clearError,
    loadMoreData,
    dataLimit
  } = useAppData(user);

  const [isSeeding, setIsSeeding] = useState(false);
  
  // Views control
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showPubForm, setShowPubForm] = useState(false);
  const [isAddingIndependent, setIsAddingIndependent] = useState(false);
  const [showUtilForm, setShowUtilForm] = useState(false);
  const [showPersonnelForm, setShowPersonnelForm] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showAssetFormType, setShowAssetFormType] = useState<'mou' | 'ip' | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [csvImportType, setCsvImportType] = useState<CSVType | null>(null);
  
  // Selected / Editing States
  const [selectedProject, setSelectedProject] = useState<ProjectMaster | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectMaster | null>(null);
  const [editingUtilization, setEditingUtilization] = useState<Utilization | null>(null);
  const [editingPersonnel, setEditingPersonnel] = useState<PersonnelDevelopment | null>(null);
  const [viewingPersonnel, setViewingPersonnel] = useState<PersonnelDevelopment | null>(null);
  const [editingPublication, setEditingPublication] = useState<PublicationOutput | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingMOU, setEditingMOU] = useState<MOU | null>(null);
  const [editingIP, setEditingIP] = useState<IntellectualProperty | null>(null);
  
  // Search States
  const [utilSearchQuery, setUtilSearchQuery] = useState('');
  const [filterFiscalYear, setFilterFiscalYear] = useState<string>('');
  const [filterCampus, setFilterCampus] = useState<string>('');
  const [filterOrgType, setFilterOrgType] = useState<string>('');
  const [filterReportingPeriod, setFilterReportingPeriod] = useState<string>('');
  const [filterRegion, setFilterRegion] = useState<string>('');
  const [filterResearchCategory, setFilterResearchCategory] = useState<string>('');
  const [filterProjectStatus, setFilterProjectStatus] = useState<string>('');

  // If no user is logged in, show Login
  if (!user) {
    return <Login />;
  }

  // If user must change password, show ChangePasswordForm
  if (user.mustChangePassword) {
    return <ChangePasswordForm />;
  }

  const handleSaveProject = async (project: ProjectMaster) => {
    if (editingProject) {
      try {
        setShowProjectForm(false);
        setEditingProject(null);
        await updateProjectInDB(project);
        if (selectedProject?.project_id === project.project_id) {
           setSelectedProject(project);
        }
        toast.success(t('saveSuccess') || "Project updated successfully");
      } catch (error) {
        toast.error("Error updating project in database.");
      }
    } else {
      try {
        setShowProjectForm(false);
        await addProjectToDB(project);
        toast.success(t('saveSuccess') || "Project added successfully");
      } catch (error) {
        toast.error("Error saving project to database.");
      }
    }
  };

  const handleSavePublication = async (pub: PublicationOutput) => {
    if (editingPublication) {
      try {
        setShowPubForm(false);
        setEditingPublication(null);
        await updatePublicationInDB(pub);
        toast.success(t('saveSuccess') || "Publication updated successfully");
      } catch (error) {
        toast.error("Error updating publication in database.");
      }
    } else {
      try {
        setShowPubForm(false);
        await addPublicationToDB(pub);
        toast.success(t('saveSuccess') || "Publication added successfully");
      } catch (error) {
        toast.error("Error saving publication to database.");
      }
    }
  };

  const handleSaveUtilization = async (util: Utilization) => {
    if (editingUtilization) {
      try {
        setShowUtilForm(false);
        setEditingUtilization(null);
        await updateUtilizationInDB(util);
        toast.success(t('saveSuccess') || "Utilization updated successfully");
      } catch (error) {
         toast.error("Error updating utilization in database.");
      }
    } else {
      try {
         setShowUtilForm(false);
         await addUtilizationToDB(util);
         toast.success(t('saveSuccess') || "Utilization added successfully");
      } catch (error) {
        toast.error("Error saving utilization to database.");
      }
    }
  };

  const handleSavePersonnel = async (pd: PersonnelDevelopment) => {
    if (editingPersonnel) {
      try {
        setShowPersonnelForm(false);
        setEditingPersonnel(null);
        await updatePersonnelInDB(pd);
        toast.success(t('saveSuccess') || "Personnel record updated successfully");
      } catch (error) {
        toast.error("Error updating personnel record.");
      }
    } else {
      try {
        setShowPersonnelForm(false);
        await addPersonnelToDB(pd);
        toast.success(t('saveSuccess') || "Personnel record added successfully");
      } catch (error) {
        toast.error("Error saving personnel record.");
      }
    }
  };

  const handleSaveMOU = async (mou: MOU) => {
    if (editingMOU) {
      try {
        setShowAssetFormType(null);
        setEditingMOU(null);
        await updateMOUInDB(mou);
        toast.success(t('saveSuccess') || "MOU updated successfully");
      } catch (error) {
        toast.error("Error updating MOU.");
      }
    } else {
      try {
        setShowAssetFormType(null);
        await addMOUToDB(mou);
        toast.success(t('saveSuccess') || "MOU added successfully");
      } catch (error) {
        toast.error("Error saving MOU.");
      }
    }
  };

  const handleSaveIP = async (ip: IntellectualProperty) => {
    if (editingIP) {
      try {
        setShowAssetFormType(null);
        setEditingIP(null);
        await updateIPInDB(ip);
        toast.success(t('saveSuccess') || "IP updated successfully");
      } catch (error) {
        toast.error("Error updating IP.");
      }
    } else {
      try {
        setShowAssetFormType(null);
        await addIPToDB(ip);
        toast.success(t('saveSuccess') || "IP added successfully");
      } catch (error) {
        toast.error("Error saving IP.");
      }
    }
  };

  const handleSaveUser = async (u: User) => {
     if (editingUser) {
        try {
           setShowUserForm(false);
           setEditingUser(null);
           await updateUserInDB(u, user);
           toast.success(t('saveSuccess') || "User updated successfully");
        } catch (error) {
           toast.error("Error updating user.");
        }
     } else {
        try {
           setShowUserForm(false);
           await addUserToDB(u, user);
           toast.success(t('saveSuccess') || "User added successfully");
        } catch (error: any) {
           toast.error(error.message || "Error adding user.");
        }
     }
  };

  const handleBulkAddUsers = async (newUsers: User[]) => {
    const uniqueNewUsers = newUsers.filter(nu => !users.some(u => u.username === nu.username));
    
    if (uniqueNewUsers.length === 0) {
      toast.info("All users in CSV already exist.");
      return;
    }

    try {
      await Promise.all(uniqueNewUsers.map(u => addUserToDB(u)));
      if (user) {
        await logUserActivity(user, 'IMPORT', 'User', `Bulk imported ${uniqueNewUsers.length} users via CSV`);
      }
      toast.success(`Successfully imported ${uniqueNewUsers.length} users.`);
    } catch (error) {
      console.error("Bulk add error:", error);
      toast.error("Some users might not have been saved due to errors.");
    }
  };

  const handleDeleteUser = async (id: string) => {
      if (confirm(t('confirmDeleteUser'))) {
          try {
              await deleteUserFromDB(id, user || undefined);
              toast.success("User deleted successfully");
          } catch (error) {
              toast.error("Error deleting user");
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
        toast.success("Data seeded successfully");
      } catch (e) {
        toast.error("Error seeding data");
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const handleDeleteProject = async (project: ProjectMaster) => {
    if (window.confirm(t('confirmDeleteProject'))) {
      try {
        await deleteProjectFromDB(project.project_id);
        if (user) {
          await logUserActivity(user, 'DELETE', 'Project', `Deleted project: ${project.project_name}`);
        }
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error("Failed to delete project:", error);
        toast.error(t('deleteError') || "Error deleting project");
      }
    }
  };

  const handleDeletePublication = async (pub: PublicationOutput) => {
    if (window.confirm("Are you sure you want to delete this publication?")) {
      try {
        await deletePublicationFromDB(pub.output_id);
        if (user) {
          await logUserActivity(user, 'DELETE', 'Publication', `Deleted publication: ${pub.article_title}`);
        }
        toast.success("Publication deleted successfully");
      } catch (error) {
        console.error("Failed to delete publication:", error);
        toast.error("Error deleting publication");
      }
    }
  };

  const handleDeleteUtilization = async (util: Utilization) => {
    if (window.confirm("Are you sure you want to delete this utilization?")) {
      try {
        await deleteUtilizationFromDB(util.id);
        if (user) {
          await logUserActivity(user, 'DELETE', 'Publication', `Deleted utilization: ${util.description}`);
        }
        toast.success("Utilization deleted successfully");
      } catch (error) {
        console.error("Failed to delete utilization:", error);
        toast.error("Error deleting utilization");
      }
    }
  };

  const handleDeletePersonnel = async (personnel: PersonnelDevelopment) => {
    if (window.confirm("Are you sure you want to delete this personnel record?")) {
      try {
        await deletePersonnelFromDB(personnel.id);
        if (user) {
          await logUserActivity(user, 'DELETE', 'System', `Deleted personnel: ${personnel.staff_name}`);
        }
        toast.success("Personnel deleted successfully");
      } catch (error) {
        console.error("Failed to delete personnel:", error);
        toast.error("Error deleting personnel");
      }
    }
  };

  const handleDeleteMOU = async (mou: MOU) => {
    if (window.confirm("Are you sure you want to delete this MOU?")) {
      try {
        await deleteMOUFromDB(mou.id);
        if (user) {
          await logUserActivity(user, 'DELETE', 'Asset', `Deleted MOU: ${mou.external_org_name}`);
        }
        toast.success("MOU deleted successfully");
      } catch (error) {
        console.error("Failed to delete MOU:", error);
        toast.error("Error deleting MOU");
      }
    }
  };

  const handleDeleteIP = async (ip: IntellectualProperty) => {
    if (window.confirm("Are you sure you want to delete this IP?")) {
      try {
        await deleteIPFromDB(ip.id);
        if (user) {
          await logUserActivity(user, 'DELETE', 'Asset', `Deleted IP: ${ip.work_name}`);
        }
        toast.success("IP deleted successfully");
      } catch (error) {
        console.error("Failed to delete IP:", error);
        toast.error("Error deleting IP");
      }
    }
  };

  const handleCSVImport = async (data: any[]) => {
    try {
      const mapCampusId = (input: string) => {
        if (user?.role !== 'Admin') {
          return user?.organization.nameEn || '';
        }
        if (!input) return '';
        const org = ALL_ORGANIZATIONS.find(o => o.nameEn.toLowerCase() === input.toLowerCase() || o.nameTh === input || o.id.toLowerCase() === input.toLowerCase());
        return org ? org.nameEn : input;
      };

      const mapProjectStatus = (input: string) => {
        if (!input) return ProjectStatus.Ongoing;
        const lower = input.toLowerCase();
        if (lower.includes('ongoing') || lower.includes('กำลังดำเนินการ')) return ProjectStatus.Ongoing;
        if (lower.includes('completed') || lower.includes('เสร็จสิ้น')) return ProjectStatus.Completed;
        if (lower.includes('terminated') || lower.includes('ยกเลิก')) return ProjectStatus.Terminated;
        return ProjectStatus.Ongoing;
      };

      const mapApprovalStatus = (input: string) => {
        if (!input) return 'Draft';
        const lower = input.toLowerCase();
        if (lower.includes('approved') || lower.includes('อนุมัติ')) return 'Approved';
        if (lower.includes('pending') || lower.includes('รอตรวจสอบ')) return 'Pending Review';
        if (lower.includes('rejected') || lower.includes('ปฏิเสธ')) return 'Rejected';
        if (lower.includes('request') || lower.includes('แก้ไข')) return 'Request Change';
        return 'Draft';
      };

      if (csvImportType === 'project') {
        const mappedData = data.map(item => {
          let rc = item.research_category;
          if (rc === 'Sports Science') rc = 'ด้านศาสตร์การกีฬา';
          else if (rc === 'Teaching/Education') rc = 'ด้านการเรียนการสอน';
          else if (rc === 'Others (e.g., Tourism, Communication, Language, Society)') rc = 'ด้านอื่นๆ (เช่น การท่องเที่ยว การสื่อสาร ภาษา สังคม เป็นต้น)';
          return { 
            ...item, 
            research_category: rc, 
            campus_id: mapCampusId(item.campus_id),
            status: mapProjectStatus(item.status),
            approval_status: mapApprovalStatus(item.approval_status)
          } as ProjectMaster;
        });
        await Promise.all(mappedData.map(item => addProjectToDB(item)));
      } else if (csvImportType === 'publication') {
        const mappedData = data.map(item => ({ 
          ...item, 
          campus_id: mapCampusId(item.campus_id),
          approval_status: mapApprovalStatus(item.approval_status)
        } as PublicationOutput));
        await Promise.all(mappedData.map(item => addPublicationToDB(item)));
      } else if (csvImportType === 'utilization') {
        const mappedData = data.map(item => {
          let ut = item.utilization_type;
          if (ut === 'Academic') ut = 'เชิงวิชาการ';
          else if (ut === 'Social') ut = 'เชิงสังคม/ชุมชน';
          else if (ut === 'Policy') ut = 'เชิงนโยบาย';
          else if (ut === 'Commercial') ut = 'เชิงพาณิชย์';
          
          return { 
            ...item, 
            utilization_type: ut,
            campus_id: mapCampusId(item.campus_id),
            approval_status: mapApprovalStatus(item.approval_status)
          } as Utilization;
        });
        await Promise.all(mappedData.map(item => addUtilizationToDB(item)));
      } else if (csvImportType === 'personnel') {
        const mappedData = data.map(item => {
          let dt = item.development_type;
          if (dt === 'Training') dt = 'การอบรม';
          else if (dt === 'Seminar') dt = 'การสัมมนา';
          else if (dt === 'Conference' || dt === 'Academic Conference') dt = 'การประชุมวิชาการ';

          return { 
            ...item, 
            development_type: dt,
            organization_name: mapCampusId(item.organization_name),
            approval_status: mapApprovalStatus(item.approval_status)
          } as PersonnelDevelopment;
        });
        await Promise.all(mappedData.map(item => addPersonnelToDB(item)));
      } else if (csvImportType === 'mou') {
        const mappedData = data.map(item => ({ 
          ...item, 
          campus_id: mapCampusId(item.campus_id),
          approval_status: mapApprovalStatus(item.approval_status)
        } as MOU));
        await Promise.all(mappedData.map(item => addMOUToDB(item)));
      } else if (csvImportType === 'ip') {
        const mappedData = data.map(item => ({ 
          ...item, 
          campus_id: mapCampusId(item.campus_id),
          approval_status: mapApprovalStatus(item.approval_status)
        } as IntellectualProperty));
        await Promise.all(mappedData.map(item => addIPToDB(item)));
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
      
      toast.success(`Successfully imported ${data.length} records.`);
      setCsvImportType(null);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Error importing data. Please check the console and your CSV format.");
    }
  };

  const getFacultyName = (facultyId: string | undefined) => {
    if (!facultyId) return '-';
    const fac = FACULTIES.find(f => f.id === facultyId);
    if (!fac) return facultyId; // Fallback to raw value if not found (e.g. old data)
    return language === 'th' ? fac.nameTh : fac.nameEn;
  };

  const getOrgName = (orgId: string | undefined) => {
    if (!orgId) return '-';
    const org = ALL_ORGANIZATIONS.find(o => o.id === orgId || o.nameEn === orgId || o.nameTh === orgId);
    if (!org) return orgId;
    return language === 'th' ? org.nameTh : org.nameEn;
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
          facultyStats={facultyStats}
          onSeedData={handleSeedData}
          isSeeding={isSeeding}
        />
      );
    }

    if (activeTab === 'projects') {
      return (
        <ProjectsTab 
          projects={projects}
          publications={publications}
          utilizations={utilizations}
          filterRegion={filterRegion}
          setFilterRegion={setFilterRegion}
          filterOrgType={filterOrgType}
          setFilterOrgType={setFilterOrgType}
          filterCampus={filterCampus}
          setFilterCampus={setFilterCampus}
          filterReportingPeriod={filterReportingPeriod}
          setFilterReportingPeriod={setFilterReportingPeriod}
          filterFiscalYear={filterFiscalYear}
          setFilterFiscalYear={setFilterFiscalYear}
          filterResearchCategory={filterResearchCategory}
          setFilterResearchCategory={setFilterResearchCategory}
          filterProjectStatus={filterProjectStatus}
          setFilterProjectStatus={setFilterProjectStatus}
          setCsvImportType={setCsvImportType}
          exportToCSV={exportToCSV}
          showProjectForm={showProjectForm}
          setShowProjectForm={setShowProjectForm}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          editingProject={editingProject}
          setEditingProject={setEditingProject}
          handleSaveProject={handleSaveProject}
          handleDeleteProject={handleDeleteProject}
          previousTab={previousTab}
          setActiveTab={setActiveTab}
          setPreviousTab={setPreviousTab}
        />
      );
    }

    if (activeTab === 'publications') {
      return (
        <PublicationsTab 
          projects={projects}
          publications={publications}
          filterFiscalYear={filterFiscalYear}
          setFilterFiscalYear={setFilterFiscalYear}
          filterRegion={filterRegion}
          setFilterRegion={setFilterRegion}
          filterOrgType={filterOrgType}
          setFilterOrgType={setFilterOrgType}
          filterCampus={filterCampus}
          setFilterCampus={setFilterCampus}
          setCsvImportType={setCsvImportType}
          exportToCSV={exportToCSV}
          showPubForm={showPubForm}
          setShowPubForm={setShowPubForm}
          editingPublication={editingPublication}
          setEditingPublication={setEditingPublication}
          isAddingIndependent={isAddingIndependent}
          setIsAddingIndependent={setIsAddingIndependent}
          handleSavePublication={handleSavePublication}
          handleDeletePublication={handleDeletePublication}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setPreviousTab={setPreviousTab}
          setSelectedProject={setSelectedProject}
        />
      );
    }
    
    if (activeTab === 'personnel') {
      return (
        <PersonnelTab 
          personnel={personnel}
          filterFiscalYear={filterFiscalYear}
          setFilterFiscalYear={setFilterFiscalYear}
          filterRegion={filterRegion}
          setFilterRegion={setFilterRegion}
          filterOrgType={filterOrgType}
          setFilterOrgType={setFilterOrgType}
          filterCampus={filterCampus}
          setFilterCampus={setFilterCampus}
          setCsvImportType={setCsvImportType}
          exportToCSV={exportToCSV}
          showPersonnelForm={showPersonnelForm}
          setShowPersonnelForm={setShowPersonnelForm}
          editingPersonnel={editingPersonnel}
          setEditingPersonnel={setEditingPersonnel}
          handleSavePersonnel={handleSavePersonnel}
          handleDeletePersonnel={handleDeletePersonnel}
        />
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
        
        const org = ALL_ORGANIZATIONS.find(o => o.id === project?.campus_id || o.nameEn === project?.campus_id || o.nameTh === project?.campus_id);
        
        const matchesCampus = filterCampus ? org?.nameEn === filterCampus : true;
        const matchesRegion = filterRegion ? org?.region === filterRegion : true;
        const matchesOrgType = filterOrgType ? org?.type === filterOrgType : true;
        const matchesRole = user?.role !== 'Admin' ? org?.nameEn === user?.organization.nameEn : true;
        
        return matchesSearch && matchesYear && matchesCampus && matchesRegion && matchesOrgType && matchesRole;
      });

      return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <h2 className="text-2xl font-bold text-gray-800">{t('utilization')}</h2>
             <div className="flex flex-wrap gap-2 md:gap-3">
               <FilterBar 
                 filterFiscalYear={filterFiscalYear} setFilterFiscalYear={setFilterFiscalYear}
                 filterRegion={filterRegion} setFilterRegion={setFilterRegion}
                 filterOrgType={filterOrgType} setFilterOrgType={setFilterOrgType}
                 filterCampus={filterCampus} setFilterCampus={setFilterCampus}
               />
               <button 
                 onClick={() => {
                   const exportData = filteredUtilizations.map(util => {
                     const proj = projects.find(p => p.project_id === util.ref_project_id);
                     return {
                       ...util,
                       campus_id: proj?.campus_id || '',
                       project_name: proj?.project_name || ''
                     };
                   });
                   exportToCSV(exportData, 'utilization', `utilization_${new Date().toISOString().split('T')[0]}`);
                 }}
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

          <div className="bg-white shadow-md rounded-xl overflow-x-auto border border-gray-100">
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
                  filteredUtilizations.map((ut, index) => {
                    const project = projects.find(p => p.project_id === ut.ref_project_id);
                    return (
                      <tr key={`${ut.id}_${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-700">
                          <span className="bg-blue-50 px-2 py-1 rounded border border-blue-100">{ut.utilization_reporting_year}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {project ? (
                            <div className="flex flex-col">
                              <span 
                                className="text-gray-900 font-medium hover:text-blue-600 cursor-pointer"
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
                              <button 
                                onClick={() => handleDeleteUtilization(ut)}
                                className="text-gray-400 hover:text-red-600 transition-colors bg-white hover:bg-red-50 rounded-full p-2"
                                title={t('delete')}
                              >
                                <span className="material-icons text-lg">delete</span>
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
             onCancel={() => { setShowAssetFormType(null); setEditingMOU(null); setEditingIP(null); }}
             onSaveMOU={handleSaveMOU}
             onSaveIP={handleSaveIP}
             initialMOU={editingMOU}
             initialIP={editingIP}
           />
         );
       }

       // Filter logic
       const filteredMOUs = mous.filter(m => {
         if (filterFiscalYear && m.fiscal_year !== filterFiscalYear) return false;
         
         const org = ALL_ORGANIZATIONS.find(o => o.id === m.campus_id || o.nameEn === m.campus_id || o.nameTh === m.campus_id);
         
         if (filterCampus && org?.nameEn !== filterCampus) return false;
         if (filterRegion && org?.region !== filterRegion) return false;
         if (filterOrgType && org?.type !== filterOrgType) return false;
         
         if (user?.role !== 'Admin' && org?.nameEn !== user?.organization.nameEn) return false;
         
         return true;
       });
       
       const filteredIPs = ips.filter(i => {
         if (filterFiscalYear && i.fiscal_year !== filterFiscalYear) return false;
         
         const org = ALL_ORGANIZATIONS.find(o => o.id === i.campus_id || o.nameEn === i.campus_id || o.nameTh === i.campus_id);
         
         if (filterCampus && org?.nameEn !== filterCampus) return false;
         if (filterRegion && org?.region !== filterRegion) return false;
         if (filterOrgType && org?.type !== filterOrgType) return false;
         
         if (user?.role !== 'Admin' && org?.nameEn !== user?.organization.nameEn) return false;
         
         return true;
       });

       return (
         <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800">{t('ip_mou')}</h2>
              <div className="flex flex-wrap gap-2 md:gap-3">
                 <FilterBar 
                   filterFiscalYear={filterFiscalYear} setFilterFiscalYear={setFilterFiscalYear}
                   filterRegion={filterRegion} setFilterRegion={setFilterRegion}
                   filterOrgType={filterOrgType} setFilterOrgType={setFilterOrgType}
                   filterCampus={filterCampus} setFilterCampus={setFilterCampus}
                 />
                 <div className="flex flex-wrap gap-2 border-r border-gray-300 pr-3 mr-1">
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
               <div className="bg-white shadow-md rounded-xl overflow-x-auto border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">{t('fiscalYear')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">{t('externalOrg')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">{t('campusOrg')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">{t('signDate')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">{t('scope')}</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-purple-800 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMOUs.map((m, index) => (
                      <tr key={`${m.id}_${index}`} className="hover:bg-purple-50/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-700">{m.fiscal_year}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.external_org_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getOrgName(m.campus_id)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.sign_date}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{m.scope}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => {
                              setEditingMOU(m);
                              setShowAssetFormType('mou');
                            }}
                            className="text-gray-400 hover:text-purple-600 transition-colors bg-white hover:bg-purple-50 rounded-full p-2"
                            title={t('edit')}
                          >
                            <span className="material-icons text-lg">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteMOU(m)}
                            className="text-gray-400 hover:text-red-600 transition-colors bg-white hover:bg-red-50 rounded-full p-2"
                            title={t('delete')}
                          >
                            <span className="material-icons text-lg">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {mous.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-sm text-gray-400">No MOU records found.</td></tr>}
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
               <div className="bg-white shadow-md rounded-xl overflow-x-auto border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-pink-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-pink-800 uppercase tracking-wider">{t('fiscalYear')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-pink-800 uppercase tracking-wider">{t('workName')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-pink-800 uppercase tracking-wider">{t('campusOrg')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-pink-800 uppercase tracking-wider">{t('ipType')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-pink-800 uppercase tracking-wider">{t('regNo')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-pink-800 uppercase tracking-wider">{t('regDate')}</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-pink-800 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {filteredIPs.map((ip, index) => (
                      <tr key={`${ip.id}_${index}`} className="hover:bg-pink-50/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-pink-700">{ip.fiscal_year}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{ip.work_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getOrgName(ip.campus_id)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs font-medium">{ip.ip_type}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{ip.request_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{ip.registration_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => {
                              setEditingIP(ip);
                              setShowAssetFormType('ip');
                            }}
                            className="text-gray-400 hover:text-pink-600 transition-colors bg-white hover:bg-pink-50 rounded-full p-2"
                            title={t('edit')}
                          >
                            <span className="material-icons text-lg">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteIP(ip)}
                            className="text-gray-400 hover:text-red-600 transition-colors bg-white hover:bg-red-50 rounded-full p-2"
                            title={t('delete')}
                          >
                            <span className="material-icons text-lg">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {ips.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-sm text-gray-400">No Intellectual Property records found.</td></tr>}
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
    <>
      <Toaster position="top-right" richColors />
      <Layout activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSelectedProject(null); setShowAssetFormType(null); setShowUserForm(false); }}>
      {appError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="material-icons text-red-500">error_outline</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Database Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  {(() => {
                    const msg = appError instanceof Error ? appError.message : String(appError);
                    try {
                      const parsed = JSON.parse(msg);
                      if (parsed.error && parsed.path) {
                        return (
                          <>
                            <strong>Operation:</strong> {parsed.operationType} <br />
                            <strong>Path:</strong> {parsed.path} <br />
                            <strong>Details:</strong> {parsed.error}
                          </>
                        );
                      }
                    } catch (e) {
                      // Not JSON
                    }
                    return msg;
                  })()}
                </p>
                <p className="mt-2 font-semibold">
                  Please update your Firestore Security Rules in the Firebase Console to allow access to this collection.
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      const rules = `rules_version = '2';\n\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    function isAuthenticated() { return request.auth != null; }\n    match /{document=**} { allow read, write: if isAuthenticated(); }\n  }\n}`;
                      navigator.clipboard.writeText(rules);
                      toast.success('Rules copied to clipboard! Paste them in the Firebase Console -> Firestore Database -> Rules tab.');
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Copy Basic Rules to Clipboard
                  </button>
                </div>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={clearError}
                  className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                >
                  <span className="sr-only">Dismiss</span>
                  <span className="material-icons text-sm">close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {renderContent()}
      
      {!isLoading && activeTab !== 'dashboard' && (
        projects.length >= dataLimit || 
        publications.length >= dataLimit || 
        utilizations.length >= dataLimit || 
        personnel.length >= dataLimit || 
        mous.length >= dataLimit || 
        ips.length >= dataLimit || 
        users.length >= dataLimit
      ) && (
        <div className="mt-8 flex justify-center pb-8">
          <button 
            onClick={loadMoreData}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-icons text-sm">expand_more</span>
            {t('loadMore') || 'Load More Data'} ({dataLimit})
          </button>
        </div>
      )}

      {csvImportType && (
        <CSVImportModal 
          type={csvImportType} 
          onImport={handleCSVImport} 
          onClose={() => setCsvImportType(null)} 
        />
      )}
    </Layout>
    </>
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
