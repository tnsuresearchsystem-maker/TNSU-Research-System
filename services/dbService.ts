
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, addDoc, query, where, updateDoc, limit, deleteDoc, orderBy, startAfter, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { ProjectMaster, PublicationOutput, Utilization, PersonnelDevelopment, MOU, IntellectualProperty, User, SystemLog } from "../types";
import { initialUsers } from "./mockData";

// Collection Names
const PROJECTS_COL = "projects";
const PUBLICATIONS_COL = "publications";
const UTILIZATIONS_COL = "utilizations";
const PERSONNEL_COL = "personnel";
const MOUS_COL = "mous";
const IPS_COL = "ips";
const USERS_COL = "users";
const LOGS_COL = "system_logs";

// --- LOGGING UTILITY (PAGINATED) ---

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
  }
};

// Return type includes the data and the last visible document cursor
export const getSystemLogs = async (
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null,
  pageSize: number = 20
): Promise<{ logs: SystemLog[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> => {
  try {
    let q;
    
    if (lastVisible) {
      // Load Next Page
      q = query(
        collection(db, LOGS_COL), 
        orderBy("timestamp", "desc"), 
        startAfter(lastVisible),
        limit(pageSize)
      );
    } else {
      // Load First Page
      q = query(
        collection(db, LOGS_COL), 
        orderBy("timestamp", "desc"), 
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(q);
    const logs = querySnapshot.docs.map(doc => ({ ...doc.data() as SystemLog }));
    
    // Get the last document to use as cursor for next call
    const lastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;

    return { logs, lastDoc };
  } catch (error) {
    console.error("Error fetching logs:", error);
    return { logs: [], lastDoc: null };
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
    const q = query(collection(db, PROJECTS_COL), where("project_id", "==", project.project_id), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, { ...project });
    } else {
      console.error("Project not found to update:", project.project_id);
    }
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

export const deleteProjectFromDB = async (projectId: string): Promise<void> => {
  try {
    const q = query(collection(db, PROJECTS_COL), where("project_id", "==", projectId), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.error("Error deleting project:", error);
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
    // Check for existing username in Firestore
    const q = query(collection(db, USERS_COL), where("username", "==", user.username));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
       throw new Error("Username already exists");
    }

    // We store the user info in Firestore for the Admin Panel list
    // WARNING: Storing password in Firestore is not recommended for production.
    // We do it here only to allow fallback login if Auth isn't set up.
    await addDoc(collection(db, USERS_COL), user);
    
    // Log the creation
    if (actor) {
      await logUserActivity(actor, 'CREATE', 'User', `Created user: ${user.username} (${user.role}). Note: Auth account must be created separately.`);
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

// --- AUTHENTICATION SERVICE ---

export const loginWithFirebase = async (email: string, pass: string): Promise<User | null> => {
  try {
    // 1. Attempt Firebase Auth Login
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;

    // 2. Fetch User Profile from Firestore based on Email
    // (Since we can't add custom claims easily in frontend-only, we map email to Firestore doc)
    const q = query(collection(db, USERS_COL), where("email", "==", firebaseUser.email), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
       const userProfile = snapshot.docs[0].data() as User;
       await logUserActivity(userProfile, 'LOGIN', 'System', 'User logged in via Firebase Auth');
       return userProfile;
    } else {
       console.error("Login successful but no user profile found in Firestore.");
       // Security: Log them out if they don't have a profile
       await signOut(auth); 
       return null;
    }
  } catch (error: any) {
    console.error("Firebase Auth Error:", error.code, error.message);
    
    // FALLBACK: Try Legacy/Mock Login if Firebase Auth fails (e.g. user not created in Console yet)
    // This ensures the initial demo users still work.
    return await authenticateUserLegacy(email, pass);
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

// Legacy/Fallback Authentication (for initial seeding or if Auth not set up)
// Accepts username OR email
export const authenticateUserLegacy = async (identifier: string, password: string): Promise<User | null> => {
  try {
    // Check against DB (Username OR Email)
    // Note: Firestore OR queries are tricky, doing two checks for simplicity in fallback
    let q = query(collection(db, USERS_COL), where("username", "==", identifier), limit(1));
    let snapshot = await getDocs(q);
    
    if (snapshot.empty) {
       q = query(collection(db, USERS_COL), where("email", "==", identifier), limit(1));
       snapshot = await getDocs(q);
    }
    
    if (!snapshot.empty) {
       const user = snapshot.docs[0].data() as User;
       if (user.password === password) {
         await logUserActivity(user, 'LOGIN', 'System', 'User logged in (Legacy/Fallback Mode)');
         return user;
       }
    } else {
       // Fallback to Mock Data
       const mockUser = initialUsers.find(u => (u.username === identifier || u.email === identifier) && u.password === password);
       if (mockUser) {
           console.log("Logged in via Mock Data");
           return mockUser;
       }
    }

    return null;
  } catch (error) {
    console.error("Legacy Auth Error:", error);
    return null;
  }
};

// --- PASSWORD MANAGEMENT ---

// 1. Reset Password (Admin triggered or forgot password)
export const sendUserPasswordResetEmail = async (email: string): Promise<{ success: boolean; message?: string }> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending reset email:", error);
    if (error.code === 'auth/user-not-found') {
      return { success: false, message: "User not found in Firebase Auth (Legacy User). Please edit manually." };
    }
    return { success: false, message: error.message };
  }
};

// 2. Change Password (Logged in User)
export const changeMyPassword = async (user: User, oldPass: string, newPass: string): Promise<{ success: boolean; message?: string }> => {
  const currentUser = auth.currentUser;
  
  // A: Firebase Auth User
  if (currentUser && currentUser.email === user.email) {
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(currentUser, oldPass);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update Password
      await updatePassword(currentUser, newPass);
      
      // Sync with Firestore (Optional, but keeps legacy field updated)
      await updateUserInDB({ ...user, password: newPass }, user);
      await logUserActivity(user, 'UPDATE', 'User', 'User changed their own password');
      
      return { success: true };
    } catch (error: any) {
      console.error("Change password error:", error);
      return { success: false, message: error.message || "Failed to update password. Check your old password." };
    }
  } 
  
  // B: Legacy User (Fallback)
  else {
    if (user.password === oldPass) {
       await updateUserInDB({ ...user, password: newPass }, user);
       await logUserActivity(user, 'UPDATE', 'User', 'User changed their own password (Legacy)');
       return { success: true };
    }
    return { success: false, message: "Incorrect current password." };
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
