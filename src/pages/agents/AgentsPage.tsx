import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Settings,
  Mail,
  Phone,
  Filter,
  Download,
  Upload,
  Building2
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ViewToggle from '../../components/ui/ViewToggle';
import GridView from '../../components/ui/GridView';
import ListView from '../../components/ui/ListView';
import Card from '../../components/ui/Card';
import SearchFilter from '../../components/ui/SearchFilter';
import StatCard from '../../components/ui/StatCard';
import { Agent, Permission } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { agentsAPI } from '../../services/api';

const AgentsPage: React.FC = () => {
  const { currentAgence, userAgences } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'table' | 'grid' | 'list'>('table');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showAgencyAssignModal, setShowAgencyAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    permissions: [] as Permission[],
    agenceId: currentAgence?.id || '',
    password: 'password123'
  });

  const filterOptions = [
    {
      id: 'statut',
      label: 'Statut',
      options: [
        { value: 'actif', label: 'Actif' },
        { value: 'suspendu', label: 'Suspendu' }
      ]
    }
  ];

  const availableModules = [
    { id: 'clients', name: 'Clients', description: 'Gestion des clients' },
    { id: 'fournisseurs', name: 'Fournisseurs', description: 'Gestion des fournisseurs' },
    { id: 'factures', name: 'Factures', description: 'Facturation' },
    { id: 'bons-commande', name: 'Bons de commande', description: 'Gestion des commandes' },
    { id: 'caisse', name: 'Caisse', description: 'Gestion de caisse' },
    { id: 'packages', name: 'Packages', description: 'Création de packages' },
    { id: 'billets', name: 'Billets d\'avion', description: 'Gestion des billets' },
    { id: 'creances', name: 'Créances', description: 'Suivi des créances' },
    { id: 'todos', name: 'Tâches', description: 'Gestion des tâches' },
    { id: 'reservations', name: 'Réservations', description: 'Gestion des réservations' },
    { id: 'documents', name: 'Documents', description: 'Gestion des documents' },
    { id: 'crm', name: 'CRM', description: 'Gestion des contacts' },
    { id: 'calendrier', name: 'Calendrier', description: 'Gestion du calendrier' }
  ];

  const availableActions = ['lire', 'creer', 'modifier', 'supprimer'];

  useEffect(() => {
    fetchAgents();
  }, [currentAgence]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await agentsAPI.getAll();
      setAgents(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement des agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async () => {
    if (!formData.nom || !formData.prenom || !formData.email) return;

    try {
      const response = await agentsAPI.create({
        ...formData,
        agenceId: currentAgence?.id
      });
      setAgents(prev => [response.data.data, ...prev]);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const handleToggleStatus = async (agentId: string) => {
    try {
      const agent = agents.find(a => a.id === agentId);
      if (!agent) return;
      
      const newStatus = agent.statut === 'actif' ? 'suspendu' : 'actif';
      await agentsAPI.update(agentId, { ...agent, statut: newStatus });
      
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, statut: newStatus as 'actif' | 'suspendu' }
          : agent
      ));
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedAgent) return;

    try {
      await agentsAPI.updatePermissions(selectedAgent.id, formData.permissions);
      
      setAgents(prev => prev.map(agent => 
        agent.id === selectedAgent.id 
          ? { ...agent, permissions: formData.permissions }
          : agent
      ));
      setShowPermissionsModal(false);
      setSelectedAgent(null);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des permissions:', error);
    }
  };

  const handleAssignAgency = async () => {
    if (!selectedAgent) return;

    try {
      // In a real implementation, you would update the agent's agency assignment
      // For now, we'll just close the modal
      setShowAgencyAssignModal(false);
      setSelectedAgent(null);
    } catch (error) {
      console.error('Erreur lors de l\'attribution d\'agence:', error);
    }
  };

  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;

    try {
      await agentsAPI.delete(selectedAgent.id);
      setAgents(prev => prev.filter(agent => agent.id !== selectedAgent.id));
      setShowDeleteModal(false);
      setSelectedAgent(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      permissions: [],
      agenceId: currentAgence?.id || '',
      password: 'password123'
    });
  };

  const openPermissionsModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({
      ...formData,
      nom: agent.nom,
      prenom: agent.prenom,
      email: agent.email,
      telephone: agent.telephone,
      permissions: [...agent.permissions],
      agenceId: currentAgence?.id || ''
    });
    setShowPermissionsModal(true);
  };

  const openAgencyAssignModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowAgencyAssignModal(true);
  };

  const handlePermissionChange = (moduleId: string, action: string, checked: boolean) => {
    setFormData(prev => {
      const newPermissions = [...prev.permissions];
      const moduleIndex = newPermissions.findIndex(p => p.module === moduleId);
      
      if (moduleIndex >= 0) {
        if (checked) {
          if (!newPermissions[moduleIndex].actions.includes(action)) {
            newPermissions[moduleIndex].actions.push(action);
          }
        } else {
          newPermissions[moduleIndex].actions = newPermissions[moduleIndex].actions.filter(a => a !== action);
          if (newPermissions[moduleIndex].actions.length === 0) {
            newPermissions.splice(moduleIndex, 1);
          }
        }
      } else if (checked) {
        newPermissions.push({ module: moduleId, actions: [action] });
      }
      
      return { ...prev, permissions: newPermissions };
    });
  };

  const hasPermission = (moduleId: string, action: string) => {
    const modulePermission = formData.permissions.find(p => p.module === moduleId);
    return modulePermission ? modulePermission.actions.includes(action) : false;
  };

  const handleFilterChange = (filterId: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [filterId]: value }));
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  const filteredAgents = agents.filter(agent => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      agent.nom.toLowerCase().includes(searchLower) ||
      agent.prenom.toLowerCase().includes(searchLower) ||
      agent.email.toLowerCase().includes(searchLower)
    );

    const statutFilter = activeFilters.statut;
    const matchesStatut = !statutFilter || statutFilter === 'tous' || agent.statut === statutFilter;

    return matchesSearch && matchesStatut;
  });

  const renderAgentCard = (agent: Agent) => (
    <Card key={agent.id} hover className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 font-medium">
              {agent.prenom[0]}{agent.nom[0]}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {agent.prenom} {agent.nom}
            </h3>
            <Badge 
              variant={agent.statut === 'actif' ? 'success' : 'danger'}
              size="sm"
              className="mt-1"
            >
              {agent.statut === 'actif' ? 'Actif' : 'Suspendu'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          {agent.email}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="w-4 h-4 mr-2" />
          {agent.telephone}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
        <div className="flex flex-wrap gap-1">
          {agent.permissions.slice(0, 3).map((permission) => (
            <Badge key={permission.module} variant="info" size="sm">
              {permission.module}
            </Badge>
          ))}
          {agent.permissions.length > 3 && (
            <Badge variant="default" size="sm">
              +{agent.permissions.length - 3}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Créé le {new Date(agent.dateCreation).toLocaleDateString('fr-FR')}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedAgent(agent);
              setShowDetailModal(true);
            }}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => openPermissionsModal(agent)}
            className="p-1 text-purple-600 hover:bg-purple-100 rounded"
            title="Gérer les permissions"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => openAgencyAssignModal(agent)}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Attribuer des agences"
          >
            <Building2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleToggleStatus(agent.id)}
            className={`p-1 rounded ${
              agent.statut === 'actif' 
                ? 'text-red-600 hover:bg-red-100' 
                : 'text-green-600 hover:bg-green-100'
            }`}
            title={agent.statut === 'actif' ? 'Suspendre' : 'Activer'}
          >
            {agent.statut === 'actif' ? (
              <UserX className="w-4 h-4" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </Card>
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Agents</h1>
          <p className="text-gray-600">Gérer vos agents et leurs permissions</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Agent
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total agents"
          value={agents.length}
          icon={UserCheck}
          color="blue"
        />
        <StatCard
          title="Agents actifs"
          value={agents.filter(a => a.statut === 'actif').length}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Agents suspendus"
          value={agents.filter(a => a.statut === 'suspendu').length}
          icon={UserX}
          color="red"
        />
      </div>

      {/* Filtres et recherche */}
      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filterOptions}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        placeholder="Rechercher un agent..."
      />

      {/* Contrôles de vue */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {filteredAgents.length} agent{filteredAgents.length > 1 ? 's' : ''} trouvé{filteredAgents.length > 1 ? 's' : ''}
          </span>
        </div>
        <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {/* Liste des agents */}
      {currentView === 'table' && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Agent</TableHeaderCell>
                <TableHeaderCell>Contact</TableHeaderCell>
                <TableHeaderCell>Permissions</TableHeaderCell>
                <TableHeaderCell>Statut</TableHeaderCell>
                <TableHeaderCell>Date création</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium">
                          {agent.prenom[0]}{agent.nom[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {agent.prenom} {agent.nom}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {agent.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {agent.telephone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {agent.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission.module} variant="info" size="sm">
                          {permission.module}
                        </Badge>
                      ))}
                      {agent.permissions.length > 3 && (
                        <Badge variant="default" size="sm">
                          +{agent.permissions.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={agent.statut === 'actif' ? 'success' : 'danger'}>
                      {agent.statut === 'actif' ? 'Actif' : 'Suspendu'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(agent.dateCreation).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowDetailModal(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => openPermissionsModal(agent)}
                        className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                        title="Gérer les permissions"
                      >
                        <Settings className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openAgencyAssignModal(agent)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Attribuer des agences"
                      >
                        <Building2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(agent.id)}
                        className={`p-1 rounded ${
                          agent.statut === 'actif' 
                            ? 'text-red-600 hover:bg-red-100' 
                            : 'text-green-600 hover:bg-green-100'
                        }`}
                        title={agent.statut === 'actif' ? 'Suspendre' : 'Activer'}
                      >
                        {agent.statut === 'actif' ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowDeleteModal(true);
                        }}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {currentView === 'grid' && (
        <GridView columns={3}>
          {filteredAgents.map(renderAgentCard)}
        </GridView>
      )}

      {currentView === 'list' && (
        <ListView>
          {filteredAgents.map((agent) => (
            <Card key={agent.id} padding="sm" className="hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {agent.prenom[0]}{agent.nom[0]}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900">
                        {agent.prenom} {agent.nom}
                      </h3>
                      <Badge variant={agent.statut === 'actif' ? 'success' : 'danger'} size="sm">
                        {agent.statut === 'actif' ? 'Actif' : 'Suspendu'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">{agent.email}</span>
                      <span className="text-sm text-gray-600">{agent.telephone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedAgent(agent);
                      setShowDetailModal(true);
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => openPermissionsModal(agent)}
                    className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                    title="Gérer les permissions"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openAgencyAssignModal(agent)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    title="Attribuer des agences"
                  >
                    <Building2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleStatus(agent.id)}
                    className={`p-1 rounded ${
                      agent.statut === 'actif' 
                        ? 'text-red-600 hover:bg-red-100' 
                        : 'text-green-600 hover:bg-green-100'
                    }`}
                    title={agent.statut === 'actif' ? 'Suspendre' : 'Activer'}
                  >
                    {agent.statut === 'actif' ? (
                      <UserX className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </ListView>
      )}

      {/* Modal ajout agent */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Nouvel agent"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.prenom}
                onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              className="input-field"
              value={formData.telephone}
              onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              className="input-field"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">
              Laissez vide pour générer un mot de passe aléatoire
            </p>
          </div>

          {userAgences.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agence *
              </label>
              <select
                className="input-field"
                value={formData.agenceId}
                onChange={(e) => setFormData(prev => ({ ...prev, agenceId: e.target.value }))}
              >
                {userAgences.map(agence => (
                  <option key={agence.id} value={agence.id}>
                    {agence.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              onClick={handleAddAgent}
              disabled={!formData.nom || !formData.prenom || !formData.email}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Créer l'agent
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal permissions */}
      <Modal
        isOpen={showPermissionsModal}
        onClose={() => {
          setShowPermissionsModal(false);
          setSelectedAgent(null);
          resetForm();
        }}
        title="Gestion des permissions"
        size="xl"
      >
        {selectedAgent && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">
                Permissions pour {selectedAgent.prenom} {selectedAgent.nom}
              </h3>
              <p className="text-sm text-blue-700">
                Sélectionnez les modules et actions auxquels cet agent aura accès.
              </p>
            </div>
            
            <div className="space-y-6">
              {availableModules.map((module) => (
                <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{module.name}</h4>
                      <p className="text-sm text-gray-500">{module.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableActions.map((action) => (
                      <div key={action} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${module.id}-${action}`}
                          checked={hasPermission(module.id, action)}
                          onChange={(e) => handlePermissionChange(module.id, action, e.target.checked)}
                          className="mr-2"
                        />
                        <label 
                          htmlFor={`${module.id}-${action}`}
                          className="text-sm text-gray-700 capitalize cursor-pointer"
                        >
                          {action}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPermissionsModal(false);
                  setSelectedAgent(null);
                  resetForm();
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdatePermissions}
                className="btn-primary"
              >
                Enregistrer les permissions
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal attribution d'agence */}
      <Modal
        isOpen={showAgencyAssignModal}
        onClose={() => {
          setShowAgencyAssignModal(false);
          setSelectedAgent(null);
        }}
        title="Attribuer des agences"
        size="lg"
      >
        {selectedAgent && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">
                Attribution d'agences pour {selectedAgent.prenom} {selectedAgent.nom}
              </h3>
              <p className="text-sm text-blue-700">
                Sélectionnez les agences auxquelles cet agent aura accès.
              </p>
            </div>
            
            <div className="space-y-4">
              {userAgences.map((agence) => (
                <div key={agence.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`agence-${agence.id}`}
                      className="mr-3"
                      // In a real implementation, you would check if the agent is assigned to this agency
                      defaultChecked={agence.id === currentAgence?.id}
                    />
                    <label htmlFor={`agence-${agence.id}`} className="cursor-pointer">
                      <p className="font-medium text-gray-900">{agence.nom}</p>
                      <p className="text-sm text-gray-500">{agence.email}</p>
                    </label>
                  </div>
                  <div>
                    <Badge variant={agence.statut === 'approuve' ? 'success' : 'warning'}>
                      {agence.statut === 'approuve' ? 'Approuvée' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAgencyAssignModal(false);
                  setSelectedAgent(null);
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleAssignAgency}
                className="btn-primary"
              >
                Enregistrer les attributions
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal détails agent */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails de l'agent"
        size="lg"
      >
        {selectedAgent && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <p className="text-sm text-gray-900">
                  {selectedAgent.prenom} {selectedAgent.nom}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-sm text-gray-900">{selectedAgent.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <p className="text-sm text-gray-900">{selectedAgent.telephone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <Badge variant={selectedAgent.statut === 'actif' ? 'success' : 'danger'}>
                  {selectedAgent.statut === 'actif' ? 'Actif' : 'Suspendu'}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Permissions
              </label>
              <div className="space-y-3">
                {selectedAgent.permissions.map((permission) => (
                  <div key={permission.module} className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 capitalize">
                      {permission.module}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {permission.actions.map((action) => (
                        <Badge key={action} variant="info" size="sm">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => openPermissionsModal(selectedAgent)}
                className="btn-primary"
              >
                <Settings className="w-4 h-4 mr-2" />
                Gérer les permissions
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal suppression */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAgent(null);
        }}
        title="Confirmer la suppression"
      >
        {selectedAgent && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer l'agent{' '}
              <strong>{selectedAgent.prenom} {selectedAgent.nom}</strong> ?
            </p>
            <p className="text-sm text-red-600">
              Cette action est irréversible et supprimera tous les accès de cet agent.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAgent}
                className="btn-danger"
              >
                Supprimer
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAgent(null);
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AgentsPage;