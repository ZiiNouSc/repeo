import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User, Agence } from '../types';

interface AuthContextType {
  user: User | null;
  currentAgence: Agence | null;
  userAgences: Agence[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchAgence: (agenceId: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentAgence, setCurrentAgence] = useState<Agence | null>(null);
  const [userAgences, setUserAgences] = useState<Agence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check token on startup
    const savedUser = localStorage.getItem('samtech_user');
    const savedAgenceId = localStorage.getItem('samtech_current_agence');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // If user is an agency admin or agent, fetch their agencies
        if (userData.role === 'agence' || userData.role === 'agent') {
          fetchUserAgences(userData).then(agences => {
            setUserAgences(agences);
            
            // Set current agency
            if (savedAgenceId && agences.some(a => a.id === savedAgenceId)) {
              const currentAgence = agences.find(a => a.id === savedAgenceId) || null;
              setCurrentAgence(currentAgence);
            } else if (agences.length > 0) {
              setCurrentAgence(agences[0]);
              localStorage.setItem('samtech_current_agence', agences[0].id);
            }
          });
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('samtech_user');
        localStorage.removeItem('samtech_current_agence');
      }
    }
    setIsLoading(false);
  }, []);

  const fetchUserAgences = async (userData: User): Promise<Agence[]> => {
    try {
      // Fetch user's agencies from API
      const response = await axios.get('/api/auth/agences');
      
      if (response.data.success) {
        return response.data.data || [];
      } else {
        throw new Error(response.data.message || 'Failed to fetch user agencies');
      }
    } catch (error) {
      console.error('Error fetching user agencies:', error);
      
      // Fallback to user.agences if API call fails
      if (userData.agences && Array.isArray(userData.agences)) {
        return userData.agences;
      }
      
      return [];
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Call backend API
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('samtech_user', JSON.stringify(userData));
        
        // Set user agencies
        if (userData.agences && Array.isArray(userData.agences)) {
          setUserAgences(userData.agences);
          
          if (userData.agences.length > 0) {
            setCurrentAgence(userData.agences[0]);
            localStorage.setItem('samtech_current_agence', userData.agences[0].id);
          }
        }
      } else {
        throw new Error(response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Call backend API (optional for logout)
    axios.post('/api/auth/logout').catch(err => console.error('Error during logout:', err));
    
    setUser(null);
    setCurrentAgence(null);
    setUserAgences([]);
    localStorage.removeItem('samtech_user');
    localStorage.removeItem('samtech_current_agence');
  };

  const switchAgence = (agenceId: string) => {
    const agence = userAgences.find(a => a.id === agenceId);
    if (agence) {
      setCurrentAgence(agence);
      localStorage.setItem('samtech_current_agence', agenceId);
    }
  };

  const value = {
    user,
    currentAgence,
    userAgences,
    login,
    logout,
    switchAgence,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};