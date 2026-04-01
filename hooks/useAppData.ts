import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { 
  ProjectMaster, 
  PublicationOutput, 
  Utilization, 
  PersonnelDevelopment, 
  MOU, 
  IntellectualProperty, 
  User, 
  FacultyLecturerCount 
} from '../types';
import { handleFirestoreError, OperationType } from '../services/dbService';

export const useAppData = (user: User | null) => {
  const [projects, setProjects] = useState<ProjectMaster[]>([]);
  const [publications, setPublications] = useState<PublicationOutput[]>([]);
  const [utilizations, setUtilizations] = useState<Utilization[]>([]);
  const [personnel, setPersonnel] = useState<PersonnelDevelopment[]>([]);
  const [mous, setMOUs] = useState<MOU[]>([]);
  const [ips, setIPs] = useState<IntellectualProperty[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [facultyStats, setFacultyStats] = useState<FacultyLecturerCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appError, setAppError] = useState<Error | null>(null);
  
  // Pagination state
  const [dataLimit, setDataLimit] = useState(100);

  const loadMoreData = () => {
    setDataLimit(prev => prev + 100);
  };

  useEffect(() => {
    if (!user || user.mustChangePassword) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setAppError(null);

    const unsubscribes: (() => void)[] = [];

    try {
      // 1. Projects
      let projectsQuery = query(collection(db, 'projects'), limit(dataLimit));
      if (user.role !== 'Admin') {
        projectsQuery = query(
          collection(db, 'projects'), 
          where("campus_id", "in", [user.organization.nameEn, user.organization.nameTh, user.organization.id]),
          limit(dataLimit)
        );
      }
      
      const unsubProjects = onSnapshot(projectsQuery, (snapshot) => {
        const fetchedProjects = snapshot.docs.map(doc => ({ ...doc.data() as ProjectMaster }));
        setProjects(fetchedProjects);
        
        // Once projects are loaded, we can filter publications and utilizations (client-side filter for non-admins)
        // Note: For a truly scalable app, we should query publications/utilizations directly by campus_id or ref_project_id.
        // But to keep it simple and match existing logic:
        
        // 2. Publications
        const pubQuery = query(collection(db, 'publications'), limit(dataLimit));
        const unsubPubs = onSnapshot(pubQuery, (pubSnapshot) => {
          let allPubs = pubSnapshot.docs.map(doc => ({ ...doc.data() as PublicationOutput }));
          if (user.role !== 'Admin') {
            const projectIds = new Set(fetchedProjects.map(p => p.project_id));
            allPubs = allPubs.filter(pub => pub.ref_project_id ? projectIds.has(pub.ref_project_id) : pub.campus_id === user.organization.nameEn);
          }
          setPublications(allPubs);
        }, (error) => handleFirestoreError(error, OperationType.GET, 'publications'));
        unsubscribes.push(unsubPubs);

        // 3. Utilizations
        const utilQuery = query(collection(db, 'utilizations'), limit(dataLimit));
        const unsubUtils = onSnapshot(utilQuery, (utilSnapshot) => {
          let allUtils = utilSnapshot.docs.map(doc => ({ ...doc.data() as Utilization }));
          if (user.role !== 'Admin') {
            const projectIds = new Set(fetchedProjects.map(p => p.project_id));
            allUtils = allUtils.filter(util => projectIds.has(util.ref_project_id));
          }
          setUtilizations(allUtils);
        }, (error) => handleFirestoreError(error, OperationType.GET, 'utilizations'));
        unsubscribes.push(unsubUtils);

      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'projects');
        setAppError(error instanceof Error ? error : new Error(String(error)));
      });
      unsubscribes.push(unsubProjects);

      // 4. Personnel
      let personnelQuery = query(collection(db, 'personnel'), limit(dataLimit));
      if (user.role !== 'Admin') {
        personnelQuery = query(
          collection(db, 'personnel'), 
          where("organization_name", "in", [user.organization.nameEn, user.organization.nameTh, user.organization.id]),
          limit(dataLimit)
        );
      }
      const unsubPersonnel = onSnapshot(personnelQuery, (snapshot) => {
        setPersonnel(snapshot.docs.map(doc => ({ ...doc.data() as PersonnelDevelopment })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'personnel'));
      unsubscribes.push(unsubPersonnel);

      // 5. MOUs
      let mousQuery = query(collection(db, 'mous'), limit(dataLimit));
      if (user.role !== 'Admin') {
        mousQuery = query(
          collection(db, 'mous'), 
          where("campus_id", "in", [user.organization.nameEn, user.organization.nameTh, user.organization.id]),
          limit(dataLimit)
        );
      }
      const unsubMOUs = onSnapshot(mousQuery, (snapshot) => {
        setMOUs(snapshot.docs.map(doc => ({ ...doc.data() as MOU })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'mous'));
      unsubscribes.push(unsubMOUs);

      // 6. IPs
      let ipsQuery = query(collection(db, 'ips'), limit(dataLimit));
      if (user.role !== 'Admin') {
        ipsQuery = query(
          collection(db, 'ips'), 
          where("campus_id", "in", [user.organization.nameEn, user.organization.nameTh, user.organization.id]),
          limit(dataLimit)
        );
      }
      const unsubIPs = onSnapshot(ipsQuery, (snapshot) => {
        setIPs(snapshot.docs.map(doc => ({ ...doc.data() as IntellectualProperty })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'ips'));
      unsubscribes.push(unsubIPs);

      // 7. Faculty Stats
      const statsQuery = query(collection(db, 'faculty_stats'), limit(dataLimit));
      const unsubStats = onSnapshot(statsQuery, (snapshot) => {
        setFacultyStats(snapshot.docs.map(doc => ({ ...doc.data() as FacultyLecturerCount })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'faculty_stats'));
      unsubscribes.push(unsubStats);

      // 8. Users (Admin only)
      if (user.role === 'Admin') {
        const usersQuery = query(collection(db, 'users'), limit(dataLimit));
        const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
          setUsers(snapshot.docs.map(doc => ({ ...doc.data() as User })));
        }, (error) => handleFirestoreError(error, OperationType.GET, 'users'));
        unsubscribes.push(unsubUsers);
      }

      setIsLoading(false);

    } catch (error) {
      console.error("Error setting up Firestore listeners:", error);
      setAppError(error instanceof Error ? error : new Error(String(error)));
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [user, dataLimit]);

  return {
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
    clearError: () => setAppError(null),
    loadMoreData,
    dataLimit
  };
};
