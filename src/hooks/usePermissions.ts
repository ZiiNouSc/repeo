import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (module: string, action: string): boolean => {
    if (!user) return false;
    
    // Superadmin a toutes les permissions
    if (user.role === 'superadmin') return true;
    
    // Agence a toutes les permissions sur ses modules
    if (user.role === 'agence') return true;
    
    // Agent : vérifier les permissions spécifiques
    if (user.role === 'agent' && user.permissions) {
      const modulePermission = user.permissions.find(p => p.module === module);
      return modulePermission ? modulePermission.actions.includes(action) : false;
    }
    
    return false;
  };

  const getAccessibleModules = (): string[] => {
    if (!user) return [];
    
    if (user.role === 'superadmin') {
      return [
        'agences', 'tickets', 'parametres', 'permissions', 'audit',
        'rapports', 'notifications', 'calendrier'
      ];
    }
    
    if (user.role === 'agence') {
      return [
        'dashboard', 'clients', 'fournisseurs', 'bons-commande', 
        'factures', 'creances', 'caisse', 'situation', 'billets', 
        'packages', 'vitrine', 'agents', 'parametres', 'crm',
        'reservations', 'documents', 'todos', 'calendrier',
        'notifications', 'rapports', 'logs'
      ];
    }
    
    if (user.role === 'agent' && user.permissions) {
      return user.permissions.map(p => p.module);
    }
    
    return [];
  };

  const canAccessModule = (moduleId: string): boolean => {
    if (!user) return false;
    
    // Modules accessibles à tous les utilisateurs
    if (moduleId === 'dashboard') return true;
    if (moduleId === 'profile' && user.role === 'agence') return true;
    
    // Vérifier les modules accessibles selon le rôle
    const accessibleModules = getAccessibleModules();
    return accessibleModules.includes(moduleId);
  };

  const getModulePermissions = (moduleId: string): string[] => {
    if (!user) return [];
    
    // Superadmin et agence ont toutes les permissions
    if (user.role === 'superadmin' || user.role === 'agence') {
      return ['lire', 'creer', 'modifier', 'supprimer', 'exporter'];
    }
    
    // Agent : retourner les permissions spécifiques
    if (user.role === 'agent' && user.permissions) {
      const modulePermission = user.permissions.find(p => p.module === moduleId);
      return modulePermission ? modulePermission.actions : [];
    }
    
    return [];
  };

  return {
    hasPermission,
    getAccessibleModules,
    canAccessModule,
    getModulePermissions,
    userRole: user?.role
  };
};