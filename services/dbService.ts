
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, addDoc, query, where, updateDoc, limit, deleteDoc, orderBy, startAfter, QueryDocumentSnapshot, DocumentData, setDoc, doc } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, createUserWithEmailAndPassword, updateEmail } from "firebase/auth";
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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Wrapper functions
export async function safeGetDocs(q: any, path: string) {
  try {
    return await getDocs(q);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    throw error; // Unreachable
  }
}

export async function safeAddDoc(col: any, data: any, path: string) {
  try {
    return await addDoc(col, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error; // Unreachable
  }
}

export async function safeUpdateDoc(docRef: any, data: any, path: string) {
  try {
    return await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error; // Unreachable
  }
}

export async function safeDeleteDoc(docRef: any, path: string) {
  try {
    return await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error; // Unreachable
  }
}

// --- LOGGING UTILITY (PAGINATED) ---

export const logUserActivity = async (
  actor: User, 
  action: SystemLog['action_type'], 
  target: SystemLog['target_module'], 
  details: string
): Promise<void> => {
  // CRITICAL FIX: If user is not authenticated in Firebase Auth (e.g. using Mock/Legacy login),
  // writing to Firestore will likely fail due to security rules. We skip logging to prevent app errors.
  if (!auth.currentUser) {
    console.warn("Skipping audit log: User is not authenticated with Firebase Auth.");
    return;
  }

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
    handleFirestoreError(error, OperationType.CREATE, LOGS_COL);
  }
};

// Return type includes the data and the last visible document cursor
export const getSystemLogs = async (
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null,
  pageSize: number = 20
): Promise<{ logs: SystemLog[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> => {
  // FIX: If not authenticated with Firebase, we cannot read Firestore logs protected by security rules.
  if (!auth.currentUser) {
    // console.warn("Skipping log fetch: User is not authenticated with Firebase.");
    return { logs: [], lastDoc: null };
  }

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
    handleFirestoreError(error, OperationType.GET, LOGS_COL);
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
    handleFirestoreError(error, OperationType.GET, PROJECTS_COL);
    return [];
  }
};

export const addProjectToDB = async (project: ProjectMaster): Promise<void> => {
  try {
    await addDoc(collection(db, PROJECTS_COL), project);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, PROJECTS_COL);
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
    handleFirestoreError(error, OperationType.UPDATE, PROJECTS_COL);
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
    handleFirestoreError(error, OperationType.DELETE, PROJECTS_COL);
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
    handleFirestoreError(error, OperationType.GET, PUBLICATIONS_COL);
    return [];
  }
};

export const addPublicationToDB = async (pub: PublicationOutput): Promise<void> => {
  try {
    await addDoc(collection(db, PUBLICATIONS_COL), pub);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, PUBLICATIONS_COL);
    throw error;
  }
};

export const updatePublicationInDB = async (pub: PublicationOutput): Promise<void> => {
  try {
    const q = query(collection(db, PUBLICATIONS_COL), where("output_id", "==", pub.output_id), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, { ...pub });
    } else {
      console.error("Publication not found to update:", pub.output_id);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, PUBLICATIONS_COL);
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
    handleFirestoreError(error, OperationType.GET, UTILIZATIONS_COL);
    return [];
  }
};

export const addUtilizationToDB = async (util: Utilization): Promise<void> => {
  try {
    await addDoc(collection(db, UTILIZATIONS_COL), util);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, UTILIZATIONS_COL);
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
    handleFirestoreError(error, OperationType.UPDATE, UTILIZATIONS_COL);
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
    handleFirestoreError(error, OperationType.GET, PERSONNEL_COL);
    return [];
  }
};

export const addPersonnelToDB = async (personnel: PersonnelDevelopment): Promise<void> => {
  try {
    await addDoc(collection(db, PERSONNEL_COL), personnel);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, PERSONNEL_COL);
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
    handleFirestoreError(error, OperationType.UPDATE, PERSONNEL_COL);
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
    handleFirestoreError(error, OperationType.GET, MOUS_COL);
    return [];
  }
};

export const addMOUToDB = async (mou: MOU): Promise<void> => {
  try {
    await addDoc(collection(db, MOUS_COL), mou);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, MOUS_COL);
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
    handleFirestoreError(error, OperationType.GET, IPS_COL);
    return [];
  }
};

export const addIPToDB = async (ip: IntellectualProperty): Promise<void> => {
  try {
    await addDoc(collection(db, IPS_COL), ip);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, IPS_COL);
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
    handleFirestoreError(error, OperationType.GET, USERS_COL);
    return [];
  }
};

// New Helper for efficient single user lookup
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const q = query(collection(db, USERS_COL), where("email", "==", email), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as User;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, USERS_COL);
    // In strict security mode, this might fail if we can't query by email index without auth. 
    // But this function is usually called AFTER auth state change, so it should be fine.
    return null;
  }
};

export const addUserToDB = async (user: User, actor?: User): Promise<void> => {
  // Check if we are in Legacy Mode (Unauthenticated)
  if (!auth.currentUser) {
      throw new Error("Write Access Denied: You are logged in via Legacy Mode. Please contact support to sync your account with Firebase Auth.");
  }

  // Check for existing username in Firestore
  const q = query(collection(db, USERS_COL), where("username", "==", user.username));
  let snapshot;
  try {
    snapshot = await getDocs(q);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, USERS_COL);
    return;
  }
  
  if (!snapshot.empty) {
     throw new Error("Username already exists");
  }

  try {
    await addDoc(collection(db, USERS_COL), user);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, USERS_COL);
    return;
  }
  
  // Log the creation
  if (actor) {
    await logUserActivity(actor, 'CREATE', 'User', `Created user: ${user.username} (${user.role}). Note: Auth account must be created separately.`);
  }
};

export const updateUserInDB = async (user: User, actor?: User): Promise<void> => {
  let querySnapshot;
  try {
    const q = query(collection(db, USERS_COL), where("id", "==", user.id), limit(1));
    querySnapshot = await getDocs(q);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, USERS_COL);
    return;
  }

  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0].ref;
    try {
      await updateDoc(docRef, { ...user });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, USERS_COL);
      return;
    }

    // Log the update
    if (actor) {
      await logUserActivity(actor, 'UPDATE', 'User', `Updated user: ${user.username}`);
    }
  } else {
    console.error("User not found to update:", user.id);
  }
};

export const deleteUserFromDB = async (id: string, actor?: User): Promise<void> => {
    let querySnapshot;
    try {
        const q = query(collection(db, USERS_COL), where("id", "==", id), limit(1));
        querySnapshot = await getDocs(q);
    } catch (error) {
        handleFirestoreError(error, OperationType.GET, USERS_COL);
        return;
    }

    if (!querySnapshot.empty) {
        const userToDelete = querySnapshot.docs[0].data() as User;
        const docRef = querySnapshot.docs[0].ref;
        try {
            await deleteDoc(docRef);
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, USERS_COL);
            return;
        }

        // Log the deletion
        if (actor) {
          await logUserActivity(actor, 'DELETE', 'User', `Deleted user: ${userToDelete.username}`);
        }
    }
}

// --- AUTHENTICATION SERVICE (HYBRID) ---

export const loginWithFirebase = async (identifier: string, pass: string): Promise<User | null> => {
  let email = identifier;
  const isEmail = identifier.includes("@");

  // 1. Resolve Username to Email (if needed)
  if (!isEmail) {
    try {
        // Try Firestore lookup
        const q = query(collection(db, USERS_COL), where("username", "==", identifier), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          email = snapshot.docs[0].data().email;
        } else {
          // If query succeeds but no user found, throw error to trigger fallback
          throw new Error("User not found in DB");
        }
    } catch (err: any) {
        // Handle "Missing or insufficient permissions" or User not found
        // console.warn("DB Username lookup failed (permission or missing). Switching to Mock Data Fallback.");
        
        // Fallback: Check Mock Data
        // This is crucial for initial login if rules block unauthenticated reads
        const mockUser = initialUsers.find(u => u.username === identifier);
        if (mockUser) {
            // console.log("Resolved username via Mock Data");
            email = mockUser.email;
        } else {
            // If we can't resolve the username, and it's not an email, we fail.
            // The user must use Email to login if not in mock data and DB is locked.
            // We can't proceed without an email
            throw new Error("Could not resolve username. Please login with your email address.");
        }
    }
  }

  try {
    // 2. Attempt Firebase Auth Login
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;

    // 3. Fetch User Profile from Firestore
    let userProfile = await getUserByEmail(firebaseUser.email!);

    // FIX START: If Auth succeeds but Firestore profile is missing (e.g. Permission denied, or DB empty),
    // we fallback to Mock Data so the hardcoded Admin can still enter.
    if (!userProfile) {
         // console.warn("Auth successful, but Firestore profile not found (or locked). Checking Mock Data for fallback profile...");
         const mockUser = initialUsers.find(u => u.email === email);
         if (mockUser) {
             // console.log("Found profile in Mock Data. Using Mock Profile.");
             userProfile = mockUser;
             
             // Attempt to SYNC this profile to Firestore so rules work next time
             try {
                 await setDoc(doc(db, USERS_COL, firebaseUser.uid), {
                     ...mockUser,
                     id: firebaseUser.uid // Use Auth UID as Document ID
                 });
                 console.log("Synced mock profile to Firestore for authenticated user.");
             } catch (syncErr) {
                 console.warn("Failed to sync profile to Firestore (likely permission denied):", syncErr);
             }
         }
    }
    // FIX END

    if (userProfile) {
       await logUserActivity(userProfile, 'LOGIN', 'System', 'User logged in via Firebase Auth');
       return userProfile;
    } else {
       console.error("Login successful but no user profile found in Firestore or Mock Data.");
       await signOut(auth); 
       return null;
    }
  } catch (error: any) {
    // 4. MIGRATION / FALLBACK LOGIC:
    const isAuthError = 
        error.code === 'auth/user-not-found' || 
        error.code === 'auth/invalid-credential' || 
        error.code === 'auth/invalid-login-credentials' || 
        error.code === 'auth/wrong-password';

    if (isAuthError) {
        // Suppress error log for expected auth failures that we handle via fallback
        console.warn(`Firebase Auth failed (${error.code}). Attempting legacy fallback...`);
    } else {
        console.error("Firebase Auth failed:", error);
    }

    // If Auth fails, try to validate against our Legacy/Mock system
    if (isAuthError) {
        const userProfile = await authenticateUserLegacy(identifier, pass);
        if (userProfile) {
            try {
                // Try to Auto-Register in Firebase Auth to enable persistence for next time
                console.log("Attempting to migrate legacy user to Firebase Auth...");
                let newCred;
                try {
                    newCred = await createUserWithEmailAndPassword(auth, email, pass);
                } catch (createErr: any) {
                    if (createErr.code === 'auth/email-already-in-use' || createErr.code === 'auth/invalid-email') {
                        console.warn(`Email ${email} failed (${createErr.code}). Generating unique fallback email for migration...`);
                        const fallbackEmail = `${userProfile.username}_${Date.now()}@demo.local`;
                        newCred = await createUserWithEmailAndPassword(auth, fallbackEmail, pass);
                        userProfile.email = fallbackEmail; // Update profile email to match Auth
                    } else {
                        throw createErr;
                    }
                }
                
                const oldId = userProfile.id;
                userProfile.id = newCred.user.uid; // Update ID to match Auth UID
                
                // CRITICAL FIX: Create Firestore Document for the new Auth User
                // This ensures security rules (which check request.auth.uid) can find the user's role
                await setDoc(doc(db, USERS_COL, newCred.user.uid), userProfile);
                
                // Delete the old legacy document if the ID changed
                if (oldId && oldId !== newCred.user.uid) {
                    try {
                        await deleteDoc(doc(db, USERS_COL, oldId));
                    } catch (delErr) {
                        console.warn("Failed to delete old legacy document:", delErr);
                    }
                }
                
                await logUserActivity(userProfile, 'UPDATE', 'System', 'Auto-migrated user to Firebase Auth & Firestore');
            } catch (createErr: any) {
                // If create fails (e.g. email exists but password was wrong previously), 
                // we just ignore it and let them in via Legacy mode.
                console.warn("Auto-migration skipped (User might exist or other error):", createErr.code);
            }
            // Return profile to allow login (Emergency Entry)
            return userProfile; 
        }
    }
    
    return null;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

// Legacy/Fallback Authentication
export const authenticateUserLegacy = async (identifier: string, password: string): Promise<User | null> => {
  try {
    // 1. Try to query DB (might fail due to permissions)
    try {
        let q = query(collection(db, USERS_COL), where("username", "==", identifier), limit(1));
        let snapshot = await getDocs(q);
        
        if (snapshot.empty) {
           q = query(collection(db, USERS_COL), where("email", "==", identifier), limit(1));
           snapshot = await getDocs(q);
        }
        
        if (!snapshot.empty) {
           const user = snapshot.docs[0].data() as User;
           if (user.password === password) {
             return user;
           }
        }
    } catch (dbErr) {
        // Silently swallow permission errors here, as we have a mock fallback
        // console.warn("Legacy DB check failed (permissions):", dbErr);
    }

    // 2. Fallback to Mock Data (Safe fallback for Admin/Staff seed)
    const mockUser = initialUsers.find(u => (u.username === identifier || u.email === identifier) && u.password === password);
    if (mockUser) {
        return mockUser;
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
export const changeMyPassword = async (user: User, oldPass: string, newPass: string, newEmail?: string): Promise<{ success: boolean; message?: string }> => {
  const currentUser = auth.currentUser;
  
  // A: Firebase Auth User
  if (currentUser && currentUser.email) {
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(currentUser.email, oldPass);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update Password
      await updatePassword(currentUser, newPass);
      
      // Update Email if provided and different
      if (newEmail && newEmail !== currentUser.email) {
          await updateEmail(currentUser, newEmail);
      }
      
      // Sync with Firestore (Optional, but keeps legacy field updated)
      await updateUserInDB({ ...user, password: newPass, email: newEmail || user.email, mustChangePassword: false }, user);
      await logUserActivity(user, 'UPDATE', 'User', 'User changed their own password and/or email');
      
      return { success: true };
    } catch (error: any) {
      console.error("Change password/email error:", error);
      return { success: false, message: error.message || "Failed to update password/email. Check your old password." };
    }
  } 
  
  // B: Legacy User (Fallback)
  else {
    if (user.password === oldPass) {
       await updateUserInDB({ ...user, password: newPass, email: newEmail || user.email, mustChangePassword: false }, user);
       // Skip logging if not auth'd to prevent permission error
       // await logUserActivity(user, 'UPDATE', 'User', 'User changed their own password (Legacy)');
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
    handleFirestoreError(error, OperationType.CREATE, "Multiple Collections");
    throw error;
  }
};
