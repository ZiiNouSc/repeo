import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Settings 
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Agence } from '../../types';
import { agencesAPI } from '../../services/api';

const AgencesListPage: React.FC = () => {
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [selectedAgence, setSelectedAgence] = useState<Agence | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showModulesModal, setShowModulesModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    typeActivite: 'agence-voyage',
    siret: '',
    modulesActifs: [] as string[]
  });

  const availableModules = [
    { id: 'clients', name: 'Clients', description: 'Gestion des clients', essential: true },
    { id: 'fournisseurs', name: 'Fournisseurs', description: 'Gestion des fournisseurs', essential: true },
    { id: 'factures', name: 'Factures', description: 'Facturation', essential: true },
    { id: 'bons-commande', name: 'Bons de commande', description: 'Gestion des commandes', essential: false },
    { id: 'caisse', name: 'Caisse', description: 'Gestion de caisse', essential: true },
    { id: 'creances', name: 'Créances', description: 'Suivi des impayés', essential: false },
    { id: 'packages', name: 'Packages', description: 'Création de packages', essential: false },
    { id: 'billets', name: 'Billets d\'avion', description: 'Gestion des billets', essential: false },
    { id: 'vitrine', name: 'Vitrine', description: 'Vitrine publique', essential: false },
    { id: 'situation', name: 'Situation', description: 'Tableaux de bord', essential: false },
    { id: 'documents', name: 'Documents', description: 'Gestion des documents', essential: false },
    { id: 'todos', name: 'Tâches', description: 'Gestion des tâches', essential: false },
    { id: 'calendrier', name: 'Calendrier', description: 'Gestion du calendrier', essential: false },
    { id: 'crm', name: 'CRM', description: 'Gestion des contacts', essential: false },
    { id: 'reservations', name: 'Réservations', description: 'Gestion des réservations', essential: false }
  ];

  useEffect(() => {
    fetchAgences();
  }, []);

  const fetchAgences = async () => {
    try {
      setLoading(true);
      const response = await agencesAPI.getAll();
      setAgences(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement des agences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgence = async () => {
    try {
      const response = await agencesAPI.create(formData);
      if (response.data.success) {
        setAgences(prev => [...prev, response.data.data]);
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'agence:', error);
      alert('Erreur: ' + (error.response?.data?.message || 'Une erreur est survenue'));
    }
  };

  const handleApprove = async (agenceId: string) => {
    try {
      await agencesAPI.approve(agenceId);
      setAgences(prev => prev.map(agence => 
        agence.id === agenceId 
          ? { ...agence, statut: 'approuve' as const }
          : agence
      ));
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
    }
  };

  const handleReject = async (agenceId: string) => {
    try {
      await agencesAPI.reject(agenceId);
      setAgences(prev => prev.map(agence => 
        agence.id === agenceId 
          ? { ...agence, statut: 'rejete' as const }
          : agence
      ));
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  const handleSuspend = async (agenceId: string) => {
    try {
      await agencesAPI.suspend(agenceId);
      setAgences(prev => prev.map(agence => 
        agence.id === agenceId 
          ? { ...agence, statut: 'suspendu' as const }
          : agence
      ));
    } catch (error) {
      console.error('Erreur lors de la suspension:', error);
    }
  };

  const handleUpdateModules = async (agenceId: string, modules: string[]) => {
    try {
      await agencesAPI.updateModules(agenceId, modules);
      setAgences(prev => prev.map(agence => 
        agence.id === agenceId 
          ? { ...agence, modulesActifs: modules }
          : agence
      ));
      setShowModulesModal(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des modules:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      email: '',
      telephone: '',
      adresse: '',
      typeActivite: 'agence-voyage',
      siret: '',
      modulesActifs: []
    });
  };

  const filteredAgences = agences.filter(agence => {
    const matchesSearch = agence.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agence.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'tous' || agence.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Agences</h1>
          <p className="text-gray-600">Gérer les agences et leurs permissions</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Agence
        </button>
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une agence..."
                className="w-full pl-10 input-field"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="input-field w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="tous">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="approuve">Approuvées</option>
              <option value="rejete">Rejetées</option>
              <option value="suspendu">Suspendues</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des agences */}
      <div className="card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Agence</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Statut</TableHeaderCell>
              <TableHeaderCell>Modules Actifs</TableHeaderCell>
              <TableHeaderCell>Date d'inscription</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgences.map((agence) => (
              <TableRow key={agence.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{agence.nom}</p>
                    <p className="text-sm text-gray-500">{agence.adresse}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm text-gray-900">{agence.email}</p>
                    <p className="text-sm text-gray-500">{agence.telephone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      agence.statut === 'approuve' ? 'success' :
                      agence.statut === 'en_attente' ? 'warning' :
                      agence.statut === 'suspendu' ? 'danger' : 'default'
                    }
                  >
                    {agence.statut === 'approuve' ? 'Approuvée' :
                     agence.statut === 'en_attente' ? 'En attente' :
                     agence.statut === 'suspendu' ? 'Suspendue' : 'Rejetée'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {agence.modulesActifs.length} module(s)
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(agence.dateInscription).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedAgence(agence);
                        setShowDetailModal(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedAgence(agence);
                        setShowModulesModal(true);
                      }}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      title="Gérer les modules"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    {agence.statut === 'en_attente' && (
                      <>
                        <button
                          onClick={() => handleApprove(agence.id)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Approuver"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(agence.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Rejeter"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {agence.statut === 'approuve' && (
                      <button
                        onClick={() => handleSuspend(agence.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Suspendre"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredAgences.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune agence trouvée</p>
          </div>
        )}
      </div>

      {/* Modal détails agence */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails de l'agence"
        size="lg"
      >
        {selectedAgence && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'agence
                </label>
                <p className="text-sm text-gray-900">{selectedAgence.nom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-sm text-gray-900">{selectedAgence.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <p className="text-sm text-gray-900">{selectedAgence.telephone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <Badge 
                  variant={
                    selectedAgence.statut === 'approuve' ? 'success' :
                    selectedAgence.statut === 'en_attente' ? 'warning' : 'danger'
                  }
                >
                  {selectedAgence.statut === 'approuve' ? 'Approuvée' :
                   selectedAgence.statut === 'en_attente' ? 'En attente' : 'Rejetée'}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <p className="text-sm text-gray-900">{selectedAgence.adresse}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modules actifs
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedAgence.modulesActifs.length > 0 ? (
                  selectedAgence.modulesActifs.map(moduleId => {
                    const module = availableModules.find(m => m.id === moduleId);
                    return (
                      <Badge key={moduleId} variant="info">
                        {module ? module.name : moduleId}
                      </Badge>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">Aucun module actif</p>
                )}
              </div>
            </div>

            {/* Modules demandés */}
            {selectedAgence.modulesDemandes && selectedAgence.modulesDemandes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modules demandés
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedAgence.modulesDemandes.map(moduleId => {
                    const module = availableModules.find(m => m.id === moduleId);
                    return (
                      <Badge key={moduleId} variant="warning">
                        {module ? module.name : moduleId}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedAgence.statut === 'en_attente' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    handleApprove(selectedAgence.id);
                    setShowDetailModal(false);
                  }}
                  className="btn-primary"
                >
                  Approuver
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedAgence.id);
                    setShowDetailModal(false);
                  }}
                  className="btn-danger"
                >
                  Rejeter
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal gestion des modules */}
      <Modal
        isOpen={showModulesModal}
        onClose={() => setShowModulesModal(false)}
        title="Gestion des modules"
        size="lg"
      >
        {selectedAgence && (
          <div className="space-y-6">
            <p className="text-gray-600">
              Sélectionnez les modules accessibles pour <strong>{selectedAgence.nom}</strong>
            </p>
            
            <div className="space-y-3">
              {availableModules.map((module) => (
                <div key={module.id} className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id={module.id}
                    checked={selectedAgence.modulesActifs.includes(module.id)}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      const updatedModules = isChecked
                        ? [...selectedAgence.modulesActifs, module.id]
                        : selectedAgence.modulesActifs.filter(m => m !== module.id);
                      
                      setSelectedAgence({
                        ...selectedAgence,
                        modulesActifs: updatedModules
                      });
                    }}
                    className="mt-1"
                  />
                  <label htmlFor={module.id} className="flex-1">
                    <div className="flex items-center">
                      <p className="font-medium text-gray-900">{module.name}</p>
                      {module.essential && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Essentiel
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{module.description}</p>
                  </label>
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleUpdateModules(selectedAgence.id, selectedAgence.modulesActifs)}
                className="btn-primary"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setShowModulesModal(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal création agence */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Nouvelle agence"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'agence *
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'activité *
              </label>
              <select
                className="input-field"
                value={formData.typeActivite}
                onChange={(e) => setFormData(prev => ({ ...prev, typeActivite: e.target.value }))}
                required
              >
                <option value="agence-voyage">Agence de voyage</option>
                <option value="tour-operateur">Tour opérateur</option>
                <option value="receptif">Réceptif</option>
                <option value="transport">Transport touristique</option>
                <option value="hebergement">Hébergement</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                className="input-field"
                value={formData.telephone}
                onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse *
            </label>
            <input
              type="text"
              className="input-field"
              value={formData.adresse}
              onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SIRET
            </label>
            <input
              type="text"
              className="input-field"
              value={formData.siret}
              onChange={(e) => setFormData(prev => ({ ...prev, siret: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modules actifs
            </label>
            <div className="space-y-3">
              {availableModules.map((module) => (
                <div key={module.id} className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id={`create-${module.id}`}
                    checked={formData.modulesActifs.includes(module.id)}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      const updatedModules = isChecked
                        ? [...formData.modulesActifs, module.id]
                        : formData.modulesActifs.filter(m => m !== module.id);
                      
                      setFormData(prev => ({
                        ...prev,
                        modulesActifs: updatedModules
                      }));
                    }}
                    className="mt-1"
                  />
                  <label htmlFor={`create-${module.id}`} className="flex-1">
                    <div className="flex items-center">
                      <p className="font-medium text-gray-900">{module.name}</p>
                      {module.essential && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Essentiel
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{module.description}</p>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateAgence}
              disabled={!formData.nom || !formData.email || !formData.telephone || !formData.adresse}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Créer l'agence
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AgencesListPage;