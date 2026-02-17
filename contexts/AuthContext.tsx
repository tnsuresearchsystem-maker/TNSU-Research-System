
import React, { createContext, useState, useContext } from 'react';
import { User, Organization } from '../types';
import { authenticateUser } from '../services/dbService';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, organization: Organization) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string, organization: Organization): Promise<boolean> => {
    // Check against DB
    const authUser = await authenticateUser(username, password);
    
    if (authUser) {
      // Security: Ensure the user belongs to the selected organization (optional, but good for structure)
      // For this demo, we can either overwrite the DB org with selected, or enforce strict matching.
      // Let's assume strict matching is better, or allow flexibility if org structure changed.
      // Here, I will allow login if username/pass correct, but update the session with DB user info.
      
      setUser(authUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
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
