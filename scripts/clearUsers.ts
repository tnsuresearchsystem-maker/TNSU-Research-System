import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDtGRy3viI5kCWhlrjT1I2_rJaZpmlzj2k",
  authDomain: "tnsu-research-system.firebaseapp.com",
  projectId: "tnsu-research-system",
  storageBucket: "tnsu-research-system.firebasestorage.app",
  messagingSenderId: "888497754868",
  appId: "1:888497754868:web:5cca4206350ae27d73c4a1",
  measurementId: "G-MTPXWC52GY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  let deletedCount = 0;
  let keptCount = 0;
  
  for (const document of snapshot.docs) {
    const data = document.data();
    // Keep the main admin account
    if (data.email === 'tnsu.research.system@gmail.com') {
      console.log(`Keeping main admin: ${document.id} (${data.email})`);
      keptCount++;
    } else {
      console.log(`Deleting user: ${document.id} (${data.username})`);
      await deleteDoc(doc(db, 'users', document.id));
      deletedCount++;
    }
  }
  
  console.log(`\nDone! Deleted ${deletedCount} users. Kept ${keptCount} users.`);
  process.exit(0);
}

clearUsers().catch(console.error);
