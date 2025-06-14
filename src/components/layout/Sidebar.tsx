import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Building2, 
  FileText, 
  Receipt, 
  CreditCard, 
  Wallet, 
  BarChart3, 
  Plane, 
  Package, 
  Store, 
  UserCheck, 
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  User,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MessageSquare,
  FolderOpen,
  BookOpen,
  Bell,
  Shield,
  FileBarChart2,
  Layers
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import clsx from 'clsx';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { user } = useAuth();
  const { getAccessibleModules } = usePermissions();
  const location = useLocation();
  const accessibleModules = getAccessibleModules();

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home, path: '/dashboard' },
    { id: 'profile', label: 'Profil', icon: User, path: '/profile', roles: ['agence'] },
    
    // Modules Superadmin
    { id: 'agences', label: 'Agences', icon: Building2, path: '/agences', roles: ['superadmin'] },
    { id: 'tickets', label: 'Support', icon: HelpCircle, path: '/tickets', roles: ['superadmin'] },
    { id: 'permissions', label: 'Permissions', icon: Shield, path: '/permissions', roles: ['superadmin'] },
    { id: 'audit', label: 'Audit & Sécurité', icon: AlertTriangle, path: '/audit', roles: ['superadmin'] },
    
    // Modules Agence/Agent
    { id: 'clients', label: 'Clients', icon: Users, path: '/clients' },
    { id: 'crm', label: 'CRM', icon: MessageSquare, path: '/crm' },
    { id: 'reservations', label: 'Réservations', icon: Calendar, path: '/reservations' },
    { id: 'fournisseurs', label: 'Fournisseurs', icon: Building2, path: '/fournisseurs' },
    { id: 'bons-commande', label: 'Bons de commande', icon: FileText, path: '/bons-commande' },
    { id: 'factures', label: 'Factures', icon: Receipt, path: '/factures' },
    { id: 'creances', label: 'Créances', icon: CreditCard, path: '/creances' },
    { id: 'caisse', label: 'Caisse', icon: Wallet, path: '/caisse' },
    { id: 'situation', label: 'Situation', icon: BarChart3, path: '/situation' },
    { id: 'billets', label: 'Billets d\'avion', icon: Plane, path: '/billets' },
    { id: 'packages', label: 'Packages', icon: Package, path: '/packages' },
    { id: 'vitrine', label: 'Vitrine', icon: Store, path: '/vitrine' },
    { id: 'documents', label: 'Documents', icon: FolderOpen, path: '/documents' },
    { id: 'todos', label: 'Tâches & Rappels', icon: CheckSquare, path: '/todos' },
    { id: 'calendrier', label: 'Calendrier', icon: Calendar, path: '/calendrier' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
    { id: 'rapports', label: 'Rapports', icon: FileBarChart2, path: '/rapports' },
    { id: 'agents', label: 'Agents', icon: UserCheck, path: '/agents', roles: ['agence'] },
    { id: 'logs', label: 'Logs', icon: Layers, path: '/logs' },
    { id: 'parametres', label: 'Paramètres', icon: Settings, path: '/parametres' },
  ];

  const visibleItems = menuItems.filter(item => {
    // Vérifier les rôles spécifiques
    if (item.roles && !item.roles.includes(user?.role || '')) {
      return false;
    }
    
    // Pour les autres items, vérifier les modules accessibles
    if (item.id === 'dashboard') return true;
    if (item.id === 'profile') return user?.role === 'agence';
    if (item.roles?.includes('superadmin')) return user?.role === 'superadmin';
    
    return accessibleModules.includes(item.id);
  });

  const getModuleStatus = (moduleId: string) => {
    if (moduleId === 'dashboard' || moduleId === 'profile') return 'active';
    if (user?.role === 'superadmin') return 'active';
    if (user?.role === 'agence') return 'active';
    
    return accessibleModules.includes(moduleId) ? 'active' : 'pending';
  };

  // Grouper les éléments du menu par catégorie
  const groupedItems = {
    principal: visibleItems.filter(item => 
      ['dashboard', 'profile'].includes(item.id)
    ),
    admin: visibleItems.filter(item => 
      ['agences', 'tickets', 'permissions', 'audit'].includes(item.id)
    ),
    clients: visibleItems.filter(item => 
      ['clients', 'crm'].includes(item.id)
    ),
    ventes: visibleItems.filter(item => 
      ['reservations', 'bons-commande', 'factures', 'creances', 'billets', 'packages'].includes(item.id)
    ),
    finance: visibleItems.filter(item => 
      ['caisse', 'situation', 'rapports'].includes(item.id)
    ),
    outils: visibleItems.filter(item => 
      ['documents', 'todos', 'calendrier', 'notifications', 'vitrine'].includes(item.id)
    ),
    parametres: visibleItems.filter(item => 
      ['agents', 'logs', 'parametres'].includes(item.id)
    )
  };

  return (
    <div className={clsx(
      'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm h-full',
      isCollapsed ? 'w-16' : 'w-72'
    )}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">ST</span>
            </div>
            <div>
              <span className="font-bold text-xl text-gradient">SamTech</span>
              <p className="text-xs text-gray-500 mt-0.5">Plateforme SaaS</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Principal */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
              Principal
            </p>
          )}
          {groupedItems.principal.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            const status = getModuleStatus(item.id);
            const isPending = status === 'pending';
            
            return (
              <div key={item.id} className="relative group">
                <NavLink
                  to={item.path}
                  className={clsx(
                    'sidebar-link',
                    isActive && 'active',
                    isPending && 'opacity-60 cursor-not-allowed'
                  )}
                  title={isCollapsed ? item.label : undefined}
                  onClick={(e) => {
                    if (isPending) {
                      e.preventDefault();
                    }
                  }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 font-medium flex-1">{item.label}</span>
                      {isPending && (
                        <span className="ml-auto">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
                
                {/* Tooltip pour les modules en attente */}
                {isPending && isCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                      {item.label} - En attente d'approbation
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Admin (Superadmin uniquement) */}
        {groupedItems.admin.length > 0 && (
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Administration
              </p>
            )}
            {groupedItems.admin.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const status = getModuleStatus(item.id);
              const isPending = status === 'pending';
              
              return (
                <div key={item.id} className="relative group">
                  <NavLink
                    to={item.path}
                    className={clsx(
                      'sidebar-link',
                      isActive && 'active',
                      isPending && 'opacity-60 cursor-not-allowed'
                    )}
                    title={isCollapsed ? item.label : undefined}
                    onClick={(e) => {
                      if (isPending) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 font-medium flex-1">{item.label}</span>
                        {isPending && (
                          <span className="ml-auto">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </div>
              );
            })}
          </div>
        )}

        {/* Clients */}
        {groupedItems.clients.length > 0 && (
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Clients
              </p>
            )}
            {groupedItems.clients.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const status = getModuleStatus(item.id);
              const isPending = status === 'pending';
              
              return (
                <div key={item.id} className="relative group">
                  <NavLink
                    to={item.path}
                    className={clsx(
                      'sidebar-link',
                      isActive && 'active',
                      isPending && 'opacity-60 cursor-not-allowed'
                    )}
                    title={isCollapsed ? item.label : undefined}
                    onClick={(e) => {
                      if (isPending) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 font-medium flex-1">{item.label}</span>
                        {isPending && (
                          <span className="ml-auto">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </div>
              );
            })}
          </div>
        )}

        {/* Ventes */}
        {groupedItems.ventes.length > 0 && (
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Ventes
              </p>
            )}
            {groupedItems.ventes.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const status = getModuleStatus(item.id);
              const isPending = status === 'pending';
              
              return (
                <div key={item.id} className="relative group">
                  <NavLink
                    to={item.path}
                    className={clsx(
                      'sidebar-link',
                      isActive && 'active',
                      isPending && 'opacity-60 cursor-not-allowed'
                    )}
                    title={isCollapsed ? item.label : undefined}
                    onClick={(e) => {
                      if (isPending) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 font-medium flex-1">{item.label}</span>
                        {isPending && (
                          <span className="ml-auto">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </div>
              );
            })}
          </div>
        )}

        {/* Finance */}
        {groupedItems.finance.length > 0 && (
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Finance
              </p>
            )}
            {groupedItems.finance.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const status = getModuleStatus(item.id);
              const isPending = status === 'pending';
              
              return (
                <div key={item.id} className="relative group">
                  <NavLink
                    to={item.path}
                    className={clsx(
                      'sidebar-link',
                      isActive && 'active',
                      isPending && 'opacity-60 cursor-not-allowed'
                    )}
                    title={isCollapsed ? item.label : undefined}
                    onClick={(e) => {
                      if (isPending) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 font-medium flex-1">{item.label}</span>
                        {isPending && (
                          <span className="ml-auto">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </div>
              );
            })}
          </div>
        )}

        {/* Outils */}
        {groupedItems.outils.length > 0 && (
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Outils
              </p>
            )}
            {groupedItems.outils.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const status = getModuleStatus(item.id);
              const isPending = status === 'pending';
              
              return (
                <div key={item.id} className="relative group">
                  <NavLink
                    to={item.path}
                    className={clsx(
                      'sidebar-link',
                      isActive && 'active',
                      isPending && 'opacity-60 cursor-not-allowed'
                    )}
                    title={isCollapsed ? item.label : undefined}
                    onClick={(e) => {
                      if (isPending) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 font-medium flex-1">{item.label}</span>
                        {isPending && (
                          <span className="ml-auto">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </div>
              );
            })}
          </div>
        )}

        {/* Paramètres */}
        {groupedItems.parametres.length > 0 && (
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Paramètres
              </p>
            )}
            {groupedItems.parametres.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const status = getModuleStatus(item.id);
              const isPending = status === 'pending';
              
              return (
                <div key={item.id} className="relative group">
                  <NavLink
                    to={item.path}
                    className={clsx(
                      'sidebar-link',
                      isActive && 'active',
                      isPending && 'opacity-60 cursor-not-allowed'
                    )}
                    title={isCollapsed ? item.label : undefined}
                    onClick={(e) => {
                      if (isPending) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 font-medium flex-1">{item.label}</span>
                        {isPending && (
                          <span className="ml-auto">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-medium">
              {user.prenom?.[0]}{user.nom?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.prenom} {user.nom}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                {user.statut === 'actif' && (
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;