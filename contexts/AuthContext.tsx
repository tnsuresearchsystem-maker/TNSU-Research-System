
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Organization } from '../types';
import { loginWithFirebase, logoutUser, getUserByEmail } from '../services/dbService';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, organization: Organization) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Persistent Session Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        // User is signed in, fetch their profile from Firestore
        // Use optimized query that targets specific email to avoid "missing permissions" on full list
        try {
           const userProfile = await getUserByEmail(firebaseUser.email);
           if (userProfile) {
             setUser(userProfile);
           } else {
             // Auth valid, but no profile found (rare edge case)
             setUser(null);
           }
        } catch (error) {
           console.error("Error restoring session:", error);
           setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (identifier: string, password: string, organization: Organization): Promise<boolean> => {
    // Use the new Firebase Auth Service
    const authUser = await loginWithFirebase(identifier, password);
    
    if (authUser) {
      // Security: Ensure the user belongs to the selected organization
      if (authUser.organization.id !== organization.id) {
         console.warn(`Login mismatch: User ${authUser.username} belongs to ${authUser.organization.id} but tried to login to ${organization.id}`);
         // If mismatch, logout immediately
         await logoutUser();
         return false;
      }
      
      setUser(authUser);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
