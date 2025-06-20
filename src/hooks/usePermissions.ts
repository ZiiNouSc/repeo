import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types';

export const usePermissions = () => {
  const { user, currentAgence } = useAuth();

  const hasPermission = (module: string, action: string): boolean => {
    if (!user) return false;
    
    // Superadmin has all permissions
    if (user.role === 'superadmin') return true;
    
    // Agency admin has all permissions on active modules
    if (user.role === 'agence' && currentAgence) {
      return currentAgence.modulesActifs.includes(module);
    }
    
    // Agent: check specific permissions
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
        'rapports', 'notifications', 'calendrier', 'clients', 'factures',
        'reservations', 'caisse', 'packages', 'billets', 'documents',
        'todos', 'fournisseurs', 'bons-commande', 'creances', 'crm',
        'vitrine', 'situation'
      ];
    }
    
    if (user.role === 'agence' && currentAgence) {
      // Return active modules plus always-accessible modules
      return [
        'dashboard', 'profile', 'parametres', 'agents',
        ...currentAgence.modulesActifs
      ];
    }
    
    if (user.role === 'agent' && user.permissions) {
      return user.permissions.map(p => p.module);
    }
    
    return [];
  };

  const canAccessModule = (moduleId: string): boolean => {
    if (!user) return false;
    
    // Modules accessible to all users
    if (moduleId === 'dashboard') return true;
    if (moduleId === 'profile' && user.role === 'agence') return true;
    
    // Check if module is in accessible modules
    const accessibleModules = getAccessibleModules();
    return accessibleModules.includes(moduleId);
  };

  const getModulePermissions = (moduleId: string): string[] => {
    if (!user) return [];
    
    // Superadmin has all permissions
    if (user.role === 'superadmin') {
      return ['lire', 'creer', 'modifier', 'supprimer', 'exporter'];
    }
    
    // Agency admin has all permissions on active modules
    if (user.role === 'agence' && currentAgence) {
      if (currentAgence.modulesActifs.includes(moduleId)) {
        return ['lire', 'creer', 'modifier', 'supprimer', 'exporter'];
      }
    }
    
    // Agent: return specific permissions
    if (user.role === 'agent' && user.permissions) {
      const modulePermission = user.permissions.find(p => p.module === moduleId);
      return modulePermission ? modulePermission.actions : [];
    }
    
    return [];
  };

  const getModuleStatus = (moduleId: string): 'active' | 'pending' | 'inactive' => {
    if (!user) return 'inactive';
    
    // Always active modules
    if (moduleId === 'dashboard') return 'active';
    if (moduleId === 'profile' && user.role === 'agence') return 'active';
    if (moduleId === 'module-requests' && user.role === 'agence') return 'active';
    
    // Superadmin has all modules active
    if (user.role === 'superadmin') return 'active';
    
    // For agency admin
    if (user.role === 'agence' && currentAgence) {
      if (currentAgence.modulesActifs.includes(moduleId)) {
        return 'active';
      }
      return 'pending';
    }
    
    // For agents
    if (user.role === 'agent' && user.permissions) {
      return user.permissions.some(p => p.module === moduleId) ? 'active' : 'inactive';
    }
    
    return 'inactive';
  };

  return {
    hasPermission,
    getAccessibleModules,
    canAccessModule,
    getModulePermissions,
    getModuleStatus,
    userRole: user?.role,
    currentAgence
  };
};