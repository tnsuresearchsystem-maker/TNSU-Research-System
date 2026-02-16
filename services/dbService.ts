import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc, query } from "firebase/firestore";
import { ProjectMaster, PublicationOutput } from "../types";

// Collection Names
const PROJECTS_COL = "projects";
const PUBLICATIONS_COL = "publications";

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

// --- Seeding Data ---

export const seedDatabase = async (projects: ProjectMaster[], publications: PublicationOutput[]): Promise<void> => {
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

    await Promise.all(promises);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};