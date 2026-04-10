
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, getDoc, addDoc, query, where, updateDoc, limit, deleteDoc, orderBy, startAfter, QueryDocumentSnapshot, DocumentData, setDoc, doc } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, createUserWithEmailAndPassword, updateEmail, getAuth as getSecondaryAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../firebaseConfig";

const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getSecondaryAuth(secondaryApp);
import { ProjectMaster, PublicationOutput, Utilization, PersonnelDevelopment, MOU, IntellectualProperty, User, SystemLog, FacultyLecturerCount } from "../types";
import { initialUsers } from "./mockData";

// Utility to remove undefined values before saving to Firestore
const sanitizeForFirestore = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item));
  }
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, sanitizeForFirestore(v)])
  );
};

// Collection Names
const PROJECTS_COL = "projects";
const PUBLICATIONS_COL = "publications";
const UTILIZATIONS_COL = "utilizations";
const PERSONNEL_COL = "personnel";
const MOUS_COL = "mous";
const IPS_COL = "ips";
const USERS_COL = "users";
const LOGS_COL = "system_logs";
const FACULTY_STATS_COL = "faculty_stats";

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
    return await addDoc(col, sanitizeForFirestore(data));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error; // Unreachable
  }
}

export async function safeUpdateDoc(docRef: any, data: any, path: string) {
  try {
    return await updateDoc(docRef, sanitizeForFirestore(data));
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
    await addDoc(collection(db, LOGS_COL), sanitizeForFirestore(logEntry));
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

export const getProjectsFromDB = async (user?: User | null): Promise<ProjectMaster[]> => {
  try {
    let q = query(collection(db, PROJECTS_COL));
    if (user && user.role !== 'Admin') {
      // Filter by user's organization nameEn, nameTh, or id
      q = query(collection(db, PROJECTS_COL), where("campus_id", "in", [user.organization.nameEn, user.organization.nameTh, user.organization.id]));
    }
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
    await addDoc(collection(db, PROJECTS_COL), sanitizeForFirestore(project));
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
      await updateDoc(docRef, sanitizeForFirestore({ ...project }));
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

export const getPublicationsFromDB = async (user?: User | null, userProjects?: ProjectMaster[]): Promise<PublicationOutput[]> => {
  try {
    const q = query(collection(db, PUBLICATIONS_COL));
    const querySnapshot = await getDocs(q);
    const allPubs = querySnapshot.docs.map(doc => ({
      ...doc.data() as PublicationOutput
    }));
    
    if (user && user.role !== 'Admin' && userProjects) {
      const projectIds = new Set(userProjects.map(p => p.project_id));
      return allPubs.filter(pub => {
        if (pub.ref_project_id) {
          return projectIds.has(pub.ref_project_id);
        }
        return pub.campus_id === user.organization.nameEn;
      });
    }
    
    return allPubs;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, PUBLICATIONS_COL);
    return [];
  }
};

export const addPublicationToDB = async (pub: PublicationOutput): Promise<void> => {
  try {
    await addDoc(collection(db, PUBLICATIONS_COL), sanitizeForFirestore(pub));
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
      await updateDoc(docRef, sanitizeForFirestore({ ...pub }));
    } else {
      console.error("Publication not found to update:", pub.output_id);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, PUBLICATIONS_COL);
    throw error;
  }
};

export const deletePublicationFromDB = async (outputId: string): Promise<void> => {
  try {
    const q = query(collection(db, PUBLICATIONS_COL), where("output_id", "==", outputId), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await deleteDoc(docRef);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, PUBLICATIONS_COL);
    throw error;
  }
};

// --- Utilizations Operations ---

export const getUtilizationsFromDB = async (user?: User | null, userProjects?: ProjectMaster[]): Promise<Utilization[]> => {
  try {
    const q = query(collection(db, UTILIZATIONS_COL));
    const querySnapshot = await getDocs(q);
    const allUtils = querySnapshot.docs.map(doc => ({
      ...doc.data() as Utilization
    }));
    
    if (user && user.role !== 'Admin' && userProjects) {
      const projectIds = new Set(userProjects.map(p => p.project_id));
      return allUtils.filter(util => projectIds.has(util.ref_project_id));
    }
    
    return allUtils;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, UTILIZATIONS_COL);
    return [];
  }
};

export const addUtilizationToDB = async (util: Utilization): Promise<void> => {
  try {
    await addDoc(collection(db, UTILIZATIONS_COL), sanitizeForFirestore(util));
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
      await updateDoc(docRef, sanitizeForFirestore({ ...util }));
    } else {
      console.error("Utilization not found to update:", util.id);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, UTILIZATIONS_COL);
    throw error;
  }
};

export const deleteUtilizationFromDB = async (utilId: string): Promise<void> => {
  try {
    const q = query(collection(db, UTILIZATIONS_COL), where("id", "==", utilId), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await deleteDoc(docRef);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, UTILIZATIONS_COL);
    throw error;
  }
};

// --- Personnel Operations ---

export const getPersonnelFromDB = async (user?: User | null): Promise<PersonnelDevelopment[]> => {
  try {
    let q = query(collection(db, PERSONNEL_COL));
    if (user && user.role !== 'Admin') {
      q = query(collection(db, PERSONNEL_COL), where("organization_name", "in", [user.organization.nameEn, user.organization.nameTh, user.organization.id]));
    }
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
    await addDoc(collection(db, PERSONNEL_COL), sanitizeForFirestore(personnel));
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
      await updateDoc(docRef, sanitizeForFirestore({ ...personnel }));
    } else {
      console.error("Personnel record not found to update:", personnel.id);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, PERSONNEL_COL);
    throw error;
  }
};

export const deletePersonnelFromDB = async (personnelId: string): Promise<void> => {
  try {
    const q = query(collection(db, PERSONNEL_COL), where("id", "==", personnelId), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await deleteDoc(docRef);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, PERSONNEL_COL);
    throw error;
  }
};

// --- MOU Operations ---

export const getMOUsFromDB = async (user?: User | null): Promise<MOU[]> => {
  try {
    let q = query(collection(db, MOUS_COL));
    if (user && user.role !== 'Admin') {
      q = query(collection(db, MOUS_COL), where("campus_id", "in", [user.organization.nameEn, user.organization.nameTh, user.organization.id]));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as MOU }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, MOUS_COL);
    return [];
  }
};

export const addMOUToDB = async (mou: MOU): Promise<void> => {
  try {
    await addDoc(collection(db, MOUS_COL), sanitizeForFirestore(mou));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, MOUS_COL);
    throw error;
  }
};

export const updateMOUInDB = async (mou: MOU): Promise<void> => {
  try {
    const q = query(collection(db, MOUS_COL), where("id", "==", mou.id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = doc(db, MOUS_COL, querySnapshot.docs[0].id);
      await updateDoc(docRef, sanitizeForFirestore({ ...mou }));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, MOUS_COL);
    throw error;
  }
};

export const deleteMOUFromDB = async (mouId: string): Promise<void> => {
  try {
    const q = query(collection(db, MOUS_COL), where("id", "==", mouId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = doc(db, MOUS_COL, querySnapshot.docs[0].id);
      await deleteDoc(docRef);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, MOUS_COL);
    throw error;
  }
};

// --- IP Operations ---

export const getIPsFromDB = async (user?: User | null): Promise<IntellectualProperty[]> => {
  try {
    let q = query(collection(db, IPS_COL));
    if (user && user.role !== 'Admin') {
      q = query(collection(db, IPS_COL), where("campus_id", "in", [user.organization.nameEn, user.organization.nameTh, user.organization.id]));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data() as IntellectualProperty }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, IPS_COL);
    return [];
  }
};

export const addIPToDB = async (ip: IntellectualProperty): Promise<void> => {
  try {
    await addDoc(collection(db, IPS_COL), sanitizeForFirestore(ip));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, IPS_COL);
    throw error;
  }
};

export const updateIPInDB = async (ip: IntellectualProperty): Promise<void> => {
  try {
    const q = query(collection(db, IPS_COL), where("id", "==", ip.id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = doc(db, IPS_COL, querySnapshot.docs[0].id);
      await updateDoc(docRef, sanitizeForFirestore({ ...ip }));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, IPS_COL);
    throw error;
  }
};

export const deleteIPFromDB = async (ipId: string): Promise<void> => {
  try {
    const q = query(collection(db, IPS_COL), where("id", "==", ipId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = doc(db, IPS_COL, querySnapshot.docs[0].id);
      await deleteDoc(docRef);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, IPS_COL);
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
export const getUserById = async (uid: string): Promise<User | null> => {
  try {
    const docRef = doc(db, USERS_COL, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, USERS_COL);
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    let q = query(collection(db, USERS_COL), where("email", "==", email), limit(1));
    let snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as User;
    }
    
    // Check authEmail if email not found
    q = query(collection(db, USERS_COL), where("authEmail", "==", email), limit(1));
    snapshot = await getDocs(q);
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

  if (!user.password) {
    throw new Error("Password is required to create a user");
  }

  try {
    // Create user in Firebase Auth using secondary app to avoid logging out current user
    const email = `${user.username}@tnsu.local`;
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, user.password);
    await signOut(secondaryAuth);

    const newUser = {
      ...user,
      id: userCredential.user.uid,
      authEmail: email
    };

    // Use setDoc instead of addDoc so the document ID matches the Auth UID
    await setDoc(doc(db, USERS_COL, newUser.id), sanitizeForFirestore(newUser));
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("Email already in use");
    }
    handleFirestoreError(error, OperationType.CREATE, USERS_COL);
    return;
  }
  
  // Log the creation
  if (actor) {
    await logUserActivity(actor, 'CREATE', 'User', `Created user: ${user.username} (${user.role})`);
  }
};

export const updateUserInDB = async (user: User, actor?: User): Promise<void> => {
  try {
    let docRef = doc(db, USERS_COL, user.id);
    let docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // Fallback for legacy users where document ID != user.id
      const q = query(collection(db, USERS_COL), where("id", "==", user.id), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        docRef = querySnapshot.docs[0].ref;
        docSnap = await getDoc(docRef);
      }
    }

    if (docSnap && docSnap.exists()) {
      await updateDoc(docRef, sanitizeForFirestore(user));
      if (actor) {
        await logUserActivity(actor, 'UPDATE', 'User', `Updated user: ${user.username}`);
      }
    } else {
      console.error("User not found to update:", user.id);
      throw new Error(`User not found to update: ${user.id}`);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, USERS_COL);
  }
};

export const clearAllUsersExceptCurrent = async (currentUserId: string, actor?: User): Promise<{deleted: number, kept: number}> => {
  try {
    const snapshot = await getDocs(collection(db, USERS_COL));
    let deletedCount = 0;
    let keptCount = 0;

    for (const document of snapshot.docs) {
      const data = document.data() as User;
      if (data.id === currentUserId || document.id === currentUserId) {
        keptCount++;
      } else {
        await deleteDoc(doc(db, USERS_COL, document.id));
        deletedCount++;
      }
    }

    if (actor) {
      await logUserActivity(actor, 'DELETE', 'User', `Cleared ${deletedCount} users from the system.`);
    }

    return { deleted: deletedCount, kept: keptCount };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, USERS_COL);
    return { deleted: 0, kept: 0 };
  }
};

export const deleteUserFromDB = async (id: string, actor?: User): Promise<void> => {
    try {
        let docRef = doc(db, USERS_COL, id);
        let docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            const q = query(collection(db, USERS_COL), where("id", "==", id), limit(1));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                docRef = querySnapshot.docs[0].ref;
                docSnap = await getDoc(docRef);
            }
        }

        if (docSnap && docSnap.exists()) {
            const userToDelete = docSnap.data() as User;
            await deleteDoc(docRef);
            
            // Log the deletion
            if (actor) {
              await logUserActivity(actor, 'DELETE', 'User', `Deleted user: ${userToDelete.username}`);
            }
        } else {
            console.error("User not found to delete:", id);
            throw new Error(`User not found to delete: ${id}`);
        }
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, USERS_COL);
    }
}

// --- AUTHENTICATION SERVICE (HYBRID) ---

export const loginWithFirebase = async (identifier: string, pass: string): Promise<User | null> => {
  const isEmail = identifier.includes("@");
  const email = isEmail ? identifier : `${identifier}@tnsu.local`;

  try {
    // Attempt Firebase Auth Login
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;

    // Fetch User Profile from Firestore
    let userProfile = await getUserById(firebaseUser.uid);

    if (userProfile) {
       await logUserActivity(userProfile, 'LOGIN', 'System', 'User logged in via Firebase Auth');
       return userProfile;
    } else {
       console.error("Login successful but no user profile found in Firestore.");
       await signOut(auth); 
       return null;
    }
  } catch (error: any) {
    if (error.code === 'auth/too-many-requests') {
      throw new Error("Too many failed login attempts. Please try again later.");
    }
    if (error.code === 'auth/user-disabled') {
      throw new Error("This account has been disabled. Please contact support.");
    }
    if (error.code !== 'auth/invalid-credential' && error.code !== 'auth/user-not-found' && error.code !== 'auth/invalid-login-credentials') {
      console.error("Firebase Auth failed:", error);
    }
    throw new Error("Invalid username or password");
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

// --- PASSWORD MANAGEMENT ---

// 1. Reset Password (Admin triggered or forgot password)
export const sendUserPasswordResetEmail = async (email: string): Promise<{ success: boolean; message?: string }> => {
  try {
    let targetEmail = email;
    // Try to find the user to get their actual auth email
    const user = await getUserByEmail(email);
    if (user && user.authEmail) {
        targetEmail = user.authEmail;
    }
    
    await sendPasswordResetEmail(auth, targetEmail);
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
export const changeMyPassword = async (user: User, oldPass: string, newPass: string, newEmail?: string): Promise<{ success: boolean; message?: string; authEmail?: string }> => {
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
      let authEmailUpdated = false;
      let emailErrorMessage = "";
      if (newEmail && newEmail !== currentUser.email) {
          try {
              await updateEmail(currentUser, newEmail);
              authEmailUpdated = true;
          } catch (emailError: any) {
              console.warn("Could not update Firebase Auth email:", emailError);
              emailErrorMessage = emailError.message;
              // We will just update the Firestore email and keep authEmail as the old one
          }
      }
      
      // Sync with Firestore
      const updatedData: Partial<User> = { password: newPass, email: newEmail || user.email, mustChangePassword: false };
      let finalAuthEmail = user.authEmail;
      if (newEmail && newEmail !== currentUser.email && !authEmailUpdated) {
          updatedData.authEmail = currentUser.email; // Keep track of the actual auth email
          finalAuthEmail = currentUser.email;
      } else if (authEmailUpdated) {
          updatedData.authEmail = newEmail;
          finalAuthEmail = newEmail;
      }
      
      await updateUserInDB({ ...user, ...updatedData } as User, user);
      await logUserActivity(user, 'UPDATE', 'User', 'User changed their own password and/or email');
      
      if (newEmail && newEmail !== currentUser.email && !authEmailUpdated) {
          return { success: true, message: `Password updated, but email could not be fully changed in Auth: ${emailErrorMessage}. You will still log in with your old email/username.`, authEmail: finalAuthEmail };
      }
      
      return { success: true, authEmail: finalAuthEmail };
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

// --- Faculty Stats Operations ---

export const getFacultyStatsFromDB = async (user?: User | null): Promise<FacultyLecturerCount[]> => {
  try {
    let q = query(collection(db, FACULTY_STATS_COL));
    if (user && user.role !== 'Admin') {
      q = query(collection(db, FACULTY_STATS_COL), where("campus_id", "in", [user.organization.nameEn, user.organization.nameTh, user.organization.id]));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data() as FacultyLecturerCount
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, FACULTY_STATS_COL);
    return [];
  }
};

export const saveFacultyStatsToDB = async (stats: FacultyLecturerCount): Promise<void> => {
  try {
    const q = query(collection(db, FACULTY_STATS_COL), where("id", "==", stats.id), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, sanitizeForFirestore({ ...stats }));
    } else {
      await addDoc(collection(db, FACULTY_STATS_COL), sanitizeForFirestore(stats));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, FACULTY_STATS_COL);
    throw error;
  }
};

// --- Seeding Data ---

export const seedDatabase = async (
  projects: ProjectMaster[], 
  publications: PublicationOutput[], 
  utilizations: Utilization[] = [],
  personnel: PersonnelDevelopment[] = [],
  mous: MOU[] = [],
  ips: IntellectualProperty[] = []
): Promise<void> => {
  try {
    const promises = [];
    
    // Add Projects
    for (const p of projects) {
      promises.push(addDoc(collection(db, PROJECTS_COL), sanitizeForFirestore(p)));
    }
    
    // Add Publications
    for (const pub of publications) {
      promises.push(addDoc(collection(db, PUBLICATIONS_COL), sanitizeForFirestore(pub)));
    }

    // Add Utilizations
    for (const ut of utilizations) {
      promises.push(addDoc(collection(db, UTILIZATIONS_COL), sanitizeForFirestore(ut)));
    }
    
    // Add Personnel
    for (const pd of personnel) {
      promises.push(addDoc(collection(db, PERSONNEL_COL), sanitizeForFirestore(pd)));
    }

    // Add MOUs
    for (const m of mous) {
      promises.push(addDoc(collection(db, MOUS_COL), sanitizeForFirestore(m)));
    }

    // Add IPs
    for (const ip of ips) {
      promises.push(addDoc(collection(db, IPS_COL), sanitizeForFirestore(ip)));
    }

    await Promise.all(promises);
    console.log("Database seeded successfully");
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "Multiple Collections");
    throw error;
  }
};
