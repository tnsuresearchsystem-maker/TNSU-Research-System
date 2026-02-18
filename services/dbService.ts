
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc, query, where, updateDoc, limit, deleteDoc, orderBy } from "firebase/firestore";
import { ProjectMaster, PublicationOutput, Utilization, PersonnelDevelopment, MOU, IntellectualProperty, User, SystemLog } from "../types";

// Collection Names
const PROJECTS_COL = "projects";
const PUBLICATIONS_COL = "publications";
const UTILIZATIONS_COL = "utilizations";
const PERSONNEL_COL = "personnel";
const MOUS_COL = "mous";
const IPS_COL = "ips";
const USERS_COL = "users";
const LOGS_COL = "system_logs";

// --- LOGGING UTILITY ---

export const logUserActivity = async (
  actor: User, 
  action: SystemLog['action_type'], 
  target: SystemLog['target_module'], 
  details: string
): Promise<void> => {
  try {
    const logEntry: SystemLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor_id: actor.id,
      actor_username: actor.username,
      action_type: action,
      target_module: target,
      details: details
    };
    await addDoc(collection(db, LOGS_COL), logEntry);
  } catch (error) {
    console.error("Failed to write system log:", error);
    // Don't throw error to prevent blocking main action
  }
};

export const getSystemLogs = async (): Promise<SystemLog[]> => {
  try {
    const q = query(collection(db, LOGS_COL), orderBy("timestamp", "desc"), limit(100));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as SystemLog }));
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
};

// --- Projects Operations ---

export const getProjectsFromDB = async (): Promise<ProjectMaster[]> => {
  try {
    const q = query(collection(db, PROJECTS_COL));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data() as ProjectMaster
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

export const addProjectToDB = async (project: ProjectMaster): Promise<void> => {
  try {
    await addDoc(collection(db, PROJECTS_COL), project);
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
};

export const updateProjectInDB = async (project: ProjectMaster): Promise<void> => {
  try {
    // Find the document with the matching project_id
    const q = query(collection(db, PROJECTS_COL), where("project_id", "==", project.project_id), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      // Update the document
      await updateDoc(docRef, { ...project });
    } else {
      console.error("Project not found to update:", project.project_id);
    }
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

// --- Publications Operations ---

export const getPublicationsFromDB = async (): Promise<PublicationOutput[]> => {
  try {
    const q = query(collection(db, PUBLICATIONS_COL));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data() as PublicationOutput
    }));
  } catch (error) {
    console.error("Error fetching publications:", error);
    return [];
  }
};

export const addPublicationToDB = async (pub: PublicationOutput): Promise<void> => {
  try {
    await addDoc(collection(db, PUBLICATIONS_COL), pub);
  } catch (error) {
    console.error("Error adding publication:", error);
    throw error;
  }
};

// --- Utilizations Operations ---

export const getUtilizationsFromDB = async (): Promise<Utilization[]> => {
  try {
    const q = query(collection(db, UTILIZATIONS_COL));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data() as Utilization
    }));
  } catch (error) {
    console.error("Error fetching utilizations:", error);
    return [];
  }
};

export const addUtilizationToDB = async (util: Utilization): Promise<void> => {
  try {
    await addDoc(collection(db, UTILIZATIONS_COL), util);
  } catch (error) {
    console.error("Error adding utilization:", error);
    throw error;
  }
};

export const updateUtilizationInDB = async (util: Utilization): Promise<void> => {
  try {
    const q = query(collection(db, UTILIZATIONS_COL), where("id", "==", util.id), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, { ...util });
    } else {
      console.error("Utilization not found to update:", util.id);
    }
  } catch (error) {
    console.error("Error updating utilization:", error);
    throw error;
  }
};

// --- Personnel Operations ---

export const getPersonnelFromDB = async (): Promise<PersonnelDevelopment[]> => {
  try {
    const q = query(collection(db, PERSONNEL_COL));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data() as PersonnelDevelopment
    }));
  } catch (error) {
    console.error("Error fetching personnel data:", error);
    return [];
  }
};

export const addPersonnelToDB = async (personnel: PersonnelDevelopment): Promise<void> => {
  try {
    await addDoc(collection(db, PERSONNEL_COL), personnel);
  } catch (error) {
    console.error("Error adding personnel data:", error);
    throw error;
  }
};

export const updatePersonnelInDB = async (personnel: PersonnelDevelopment): Promise<void> => {
  try {
    const q = query(collection(db, PERSONNEL_COL), where("id", "==", personnel.id), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, { ...personnel });
    } else {
      console.error("Personnel record not found to update:", personnel.id);
    }
  } catch (error) {
    console.error("Error updating personnel:", error);
    throw error;
  }
};

// --- MOU Operations ---

export const getMOUsFromDB = async (): Promise<MOU[]> => {
  try {
    const q = query(collection(db, MOUS_COL));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as MOU }));
  } catch (error) {
    console.error("Error fetching MOUs:", error);
    return [];
  }
};

export const addMOUToDB = async (mou: MOU): Promise<void> => {
  try {
    await addDoc(collection(db, MOUS_COL), mou);
  } catch (error) {
    console.error("Error adding MOU:", error);
    throw error;
  }
};

// --- IP Operations ---

export const getIPsFromDB = async (): Promise<IntellectualProperty[]> => {
  try {
    const q = query(collection(db, IPS_COL));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as IntellectualProperty }));
  } catch (error) {
    console.error("Error fetching IPs:", error);
    return [];
  }
};

export const addIPToDB = async (ip: IntellectualProperty): Promise<void> => {
  try {
    await addDoc(collection(db, IPS_COL), ip);
  } catch (error) {
    console.error("Error adding IP:", error);
    throw error;
  }
};

// --- User Operations ---

export const getUsersFromDB = async (): Promise<User[]> => {
  try {
    const q = query(collection(db, USERS_COL));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as User }));
  } catch (error) {
    console.error("Error fetching Users:", error);
    return [];
  }
};

export const addUserToDB = async (user: User, actor?: User): Promise<void> => {
  try {
    // Basic check for existing username
    const q = query(collection(db, USERS_COL), where("username", "==", user.username));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
       throw new Error("Username already exists");
    }
    await addDoc(collection(db, USERS_COL), user);
    
    // Log the creation
    if (actor) {
      await logUserActivity(actor, 'CREATE', 'User', `Created user: ${user.username} (${user.role})`);
    }
  } catch (error) {
    console.error("Error adding User:", error);
    throw error;
  }
};

export const updateUserInDB = async (user: User, actor?: User): Promise<void> => {
  try {
    const q = query(collection(db, USERS_COL), where("id", "==", user.id), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, { ...user });

      // Log the update
      if (actor) {
        await logUserActivity(actor, 'UPDATE', 'User', `Updated user: ${user.username}`);
      }
    } else {
      console.error("User not found to update:", user.id);
    }
  } catch (error) {
    console.error("Error updating User:", error);
    throw error;
  }
};

export const deleteUserFromDB = async (id: string, actor?: User): Promise<void> => {
    try {
        const q = query(collection(db, USERS_COL), where("id", "==", id), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userToDelete = querySnapshot.docs[0].data() as User;
            const docRef = querySnapshot.docs[0].ref;
            await deleteDoc(docRef);

            // Log the deletion
            if (actor) {
              await logUserActivity(actor, 'DELETE', 'User', `Deleted user: ${userToDelete.username}`);
            }
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
}

// Mock Authentication (Check against DB)
export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const q = query(collection(db, USERS_COL), where("username", "==", username), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const user = snapshot.docs[0].data() as User;
    // Simple password check (In production, use hashed passwords or Firebase Auth)
    if (user.password === password) {
      // LOG SUCCESSFUL LOGIN
      await logUserActivity(user, 'LOGIN', 'System', 'User logged in successfully');
      return user;
    }
    return null;
  } catch (error) {
    console.error("Auth Error:", error);
    return null;
  }
};

// --- Seeding Data ---

export const seedDatabase = async (
  projects: ProjectMaster[], 
  publications: PublicationOutput[], 
  utilizations: Utilization[] = [],
  personnel: PersonnelDevelopment[] = [],
  mous: MOU[] = [],
  ips: IntellectualProperty[] = [],
  users: User[] = []
): Promise<void> => {
  try {
    const promises = [];
    
    // Add Projects
    for (const p of projects) {
      promises.push(addDoc(collection(db, PROJECTS_COL), p));
    }
    
    // Add Publications
    for (const pub of publications) {
      promises.push(addDoc(collection(db, PUBLICATIONS_COL), pub));
    }

    // Add Utilizations
    for (const ut of utilizations) {
      promises.push(addDoc(collection(db, UTILIZATIONS_COL), ut));
    }
    
    // Add Personnel
    for (const pd of personnel) {
      promises.push(addDoc(collection(db, PERSONNEL_COL), pd));
    }

    // Add MOUs
    for (const m of mous) {
      promises.push(addDoc(collection(db, MOUS_COL), m));
    }

    // Add IPs
    for (const ip of ips) {
      promises.push(addDoc(collection(db, IPS_COL), ip));
    }

    // Add Users (Check existence first to avoid duplicates during seed)
    for (const u of users) {
       const q = query(collection(db, USERS_COL), where("username", "==", u.username));
       const snapshot = await getDocs(q);
       if (snapshot.empty) {
         promises.push(addDoc(collection(db, USERS_COL), u));
       }
    }

    await Promise.all(promises);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};
