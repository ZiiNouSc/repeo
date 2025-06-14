import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  User, 
  Users, 
  Building2,
  Save,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Card from '../../components/ui/Card';
import SearchFilter from '../../components/ui/SearchFilter';
import { useAuth } from '../../contexts/AuthContext';

interface Module {
  id: string;
  nom: string;
  description: string;
  permissions: string[];
}

interface UserPermission {
  userId: string;
  userName: string;
  userRole: 'superadmin' | 'agence' | 'agent';
  modules: {
    moduleId: string;
    permissions: string[];
  }[];
}

const PermissionsPage: React.FC = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserPermission | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [editedPermissions, setEditedPermissions] = useState<{
    moduleId: string;
    permissions: string[];
  }[]>([]);

  const filterOptions = [
    {
      id: 'role',
      label: 'Rôle',
      options: [
        { value: 'superadmin', label: 'Super Admin' },
        { value: 'agence', label: 'Agence' },
        { value: 'agent', label: 'Agent' }
      ]
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - à remplacer par de vrais appels API
      setModules([
        {
          id: 'clients',
          nom: 'Clients',
          description: 'Gestion des clients',
          permissions: ['lire', 'creer', 'modifier', 'supprimer']
        },
        {
          id: 'factures',
          nom: 'Factures',
          description: 'Gestion des factures',
          permissions: ['lire', 'creer', 'modifier', 'supprimer']
        },
        {
          id: 'reservations',
          nom: 'Réservations',
          description: 'Gestion des réservations',
          permissions: ['lire', 'creer', 'modifier', 'supprimer']
        },
        {
          id: 'caisse',
          nom: 'Caisse',
          description: 'Gestion de caisse',
          permissions: ['lire', 'creer', 'modifier', 'supprimer']
        },
        {
          id: 'packages',
          nom: 'Packages',
          description: 'Gestion des packages',
          permissions: ['lire', 'creer', 'modifier', 'supprimer']
        },
        {
          id: 'billets',
          nom: 'Billets',
          description: 'Gestion des billets',
          permissions: ['lire', 'creer', 'modifier', 'supprimer']
        },
        {
          id: 'documents',
          nom: 'Documents',
          description: 'Gestion des documents',
          permissions: ['lire', 'creer', 'modifier', 'supprimer']
        },
        {
          id: 'crm',
          nom: 'CRM',
          description: 'Gestion des contacts',
          permissions: ['lire', 'creer', 'modifier', 'supprimer']
        },
        {
          id: 'rapports',
          nom: 'Rapports',
          description: 'Accès aux rapports',
          permissions: ['lire', 'exporter']
        }
      ]);

      setUserPermissions([
        {
          userId: '1',
          userName: 'Admin Système',
          userRole: 'superadmin',
          modules: modules.map(module => ({
            moduleId: module.id,
            permissions: module.permissions
          }))
        },
        {
          userId: '2',
          userName: 'Sophie Martin',
          userRole: 'agence',
          modules: modules.map(module => ({
            moduleId: module.id,
            permissions: module.permissions
          }))
        },
        {
          userId: '3',
          userName: 'Jean Dupont',
          userRole: 'agent',
          modules: [
            { moduleId: 'clients', permissions: ['lire', 'creer'] },
            { moduleId: 'factures', permissions: ['lire'] },
            { moduleId: 'reservations', permissions: ['lire', 'creer'] }
          ]
        },
        {
          userId: '4',
          userName: 'Marie Leroy',
          userRole: 'agent',
          modules: [
            { moduleId: 'clients', permissions: ['lire', 'creer', 'modifier'] },
            { moduleId: 'factures', permissions: ['lire', 'creer'] },
            { moduleId: 'caisse', permissions: ['lire', 'creer'] }
          ]
        }
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterId: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [filterId]: value }));
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  const handleOpenPermissionModal = (userPerm: UserPermission) => {
    setSelectedUser(userPerm);
    setEditedPermissions(userPerm.modules);
    setShowPermissionModal(true);
  };

  const handlePermissionChange = (moduleId: string, permission: string, checked: boolean) => {
    setEditedPermissions(prev => {
      const modulePerm = prev.find(m => m.moduleId === moduleId);
      
      if (modulePerm) {
        if (checked) {
          if (!modulePerm.permissions.includes(permission)) {
            return prev.map(m => 
              m.moduleId === moduleId 
                ? { ...m, permissions: [...m.permissions, permission] }
                : m
            );
          }
        } else {
          return prev.map(m => 
            m.moduleId === moduleId 
              ? { ...m, permissions: m.permissions.filter(p => p !== permission) }
              : m
          );
        }
      } else if (checked) {
        return [...prev, { moduleId, permissions: [permission] }];
      }
      
      return prev;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    
    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour l'état local
      setUserPermissions(prev => 
        prev.map(userPerm => 
          userPerm.userId === selectedUser.userId
            ? { ...userPerm, modules: editedPermissions }
            : userPerm
        )
      );
      
      setShowPermissionModal(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des permissions:', error);
    }
  };

  const hasPermission = (moduleId: string, permission: string) => {
    if (!selectedUser) return false;
    
    const modulePerm = editedPermissions.find(m => m.moduleId === moduleId);
    return modulePerm ? modulePerm.permissions.includes(permission) : false;
  };

  const filteredUsers = userPermissions.filter(userPerm => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = userPerm.userName.toLowerCase().includes(searchLower);
    
    const roleFilter = activeFilters.role;
    const matchesRole = !roleFilter || roleFilter === 'tous' || userPerm.userRole === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return <Shield className="w-5 h-5 text-red-600" />;
      case 'agence': return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'agent': return <User className="w-5 h-5 text-green-600" />;
      default: return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin': return <Badge variant="danger">Super Admin</Badge>;
      case 'agence': return <Badge variant="info">Agence</Badge>;
      case 'agent': return <Badge variant="success">Agent</Badge>;
      default: return <Badge variant="default">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Permissions</h1>
          <p className="text-gray-600">Configurer les accès et permissions des utilisateurs</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filterOptions}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        placeholder="Rechercher un utilisateur..."
      />

      {/* Liste des utilisateurs */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Utilisateur</TableHeaderCell>
              <TableHeaderCell>Rôle</TableHeaderCell>
              <TableHeaderCell>Modules accessibles</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((userPerm) => (
              <TableRow key={userPerm.userId}>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      {getRoleIcon(userPerm.userRole)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{userPerm.userName}</p>
                      <p className="text-sm text-gray-500">ID: {userPerm.userId}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getRoleBadge(userPerm.userRole)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {userPerm.modules.slice(0, 5).map((module) => (
                      <Badge key={module.moduleId} variant="default" size="sm">
                        {modules.find(m => m.id === module.moduleId)?.nom || module.moduleId}
                      </Badge>
                    ))}
                    {userPerm.modules.length > 5 && (
                      <Badge variant="default" size="sm">
                        +{userPerm.modules.length - 5}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleOpenPermissionModal(userPerm)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    title="Gérer les permissions"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal permissions */}
      <Modal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        title={`Permissions - ${selectedUser?.userName}`}
        size="xl"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                {getRoleIcon(selectedUser.userRole)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedUser.userName}</h3>
                {getRoleBadge(selectedUser.userRole)}
              </div>
            </div>

            <div className="space-y-4">
              {modules.map((module) => (
                <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{module.nom}</h4>
                      <p className="text-sm text-gray-500">{module.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          // Activer toutes les permissions pour ce module
                          setEditedPermissions(prev => {
                            const existingModule = prev.find(m => m.moduleId === module.id);
                            if (existingModule) {
                              return prev.map(m => 
                                m.moduleId === module.id 
                                  ? { ...m, permissions: [...module.permissions] }
                                  : m
                              );
                            } else {
                              return [...prev, { moduleId: module.id, permissions: [...module.permissions] }];
                            }
                          });
                        }}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Tout activer"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          // Désactiver toutes les permissions pour ce module
                          setEditedPermissions(prev => 
                            prev.filter(m => m.moduleId !== module.id)
                          );
                        }}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Tout désactiver"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {module.permissions.map((permission) => (
                      <div key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${module.id}-${permission}`}
                          checked={hasPermission(module.id, permission)}
                          onChange={(e) => handlePermissionChange(module.id, permission, e.target.checked)}
                          className="mr-2"
                        />
                        <label 
                          htmlFor={`${module.id}-${permission}`}
                          className="text-sm text-gray-700 capitalize cursor-pointer"
                        >
                          {permission}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleSavePermissions}
                className="btn-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PermissionsPage;