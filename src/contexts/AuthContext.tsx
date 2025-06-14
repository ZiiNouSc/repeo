import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler la vérification du token au démarrage
    const savedUser = localStorage.getItem('samtech_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur sauvegardé:', error);
        localStorage.removeItem('samtech_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulation d'une connexion - à remplacer par un vrai appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock des utilisateurs pour démonstration
      let mockUser: User;
      
      if (email === 'superadmin@samtech.com') {
        mockUser = {
          id: '1',
          email: 'superadmin@samtech.com',
          nom: 'Admin',
          prenom: 'Super',
          role: 'superadmin',
          statut: 'actif'
        };
      } else if (email === 'agence@test.com') {
        mockUser = {
          id: '2',
          email: 'agence@test.com',
          nom: 'Test',
          prenom: 'Agence',
          role: 'agence',
          agenceId: 'agence-1',
          statut: 'actif'
        };
      } else if (email === 'agent@test.com') {
        mockUser = {
          id: '3',
          email: 'agent@test.com',
          nom: 'Test',
          prenom: 'Agent',
          role: 'agent',
          agenceId: 'agence-1',
          statut: 'actif',
          permissions: [
            { module: 'clients', actions: ['lire', 'creer', 'modifier'] },
            { module: 'factures', actions: ['lire', 'creer'] },
            { module: 'reservations', actions: ['lire', 'creer'] },
            { module: 'todos', actions: ['lire', 'creer', 'modifier'] },
            { module: 'documents', actions: ['lire', 'creer'] },
            { module: 'calendrier', actions: ['lire', 'creer'] }
          ]
        };
      } else {
        throw new Error('Identifiants incorrects');
      }

      setUser(mockUser);
      localStorage.setItem('samtech_user', JSON.stringify(mockUser));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('samtech_user');
  };

  const value = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};