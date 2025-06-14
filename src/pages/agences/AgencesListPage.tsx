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

const AgencesListPage: React.FC = () => {
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [selectedAgence, setSelectedAgence] = useState<Agence | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showModulesModal, setShowModulesModal] = useState(false);

  const availableModules = [
    { id: 'clients', name: 'Clients', description: 'Gestion des clients' },
    { id: 'fournisseurs', name: 'Fournisseurs', description: 'Gestion des fournisseurs' },
    { id: 'factures', name: 'Factures', description: 'Facturation' },
    { id: 'bons-commande', name: 'Bons de commande', description: 'Gestion des commandes' },
    { id: 'caisse', name: 'Caisse', description: 'Gestion de caisse' },
    { id: 'packages', name: 'Packages', description: 'Création de packages' },
    { id: 'billets', name: 'Billets d\'avion', description: 'Gestion des billets' },
    { id: 'vitrine', name: 'Vitrine', description: 'Vitrine publique' }
  ];

  useEffect(() => {
    const fetchAgences = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setAgences([
          {
            id: '1',
            nom: 'Voyages Express',
            email: 'contact@voyages-express.com',
            telephone: '+33 1 23 45 67 89',
            adresse: '123 Rue de la Paix, 75001 Paris',
            statut: 'en_attente',
            dateInscription: '2024-01-15',
            modulesActifs: []
          },
          {
            id: '2',
            nom: 'Tourisme International',
            email: 'info@tourisme-intl.com',
            telephone: '+33 1 98 76 54 32',
            adresse: '456 Avenue des Voyages, 69002 Lyon',
            statut: 'approuve',
            dateInscription: '2024-01-10',
            modulesActifs: ['clients', 'factures', 'packages', 'billets']
          },
          {
            id: '3',
            nom: 'Évasion Vacances',
            email: 'hello@evasion-vacances.fr',
            telephone: '+33 4 56 78 90 12',
            adresse: '789 Boulevard du Soleil, 13001 Marseille',
            statut: 'suspendu',
            dateInscription: '2024-01-05',
            modulesActifs: ['clients', 'factures']
          }
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des agences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgences();
  }, []);

  const handleApprove = async (agenceId: string) => {
    try {
      // Appel API pour approuver l'agence
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
      // Appel API pour rejeter l'agence
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
      // Appel API pour suspendre l'agence
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
      // Appel API pour mettre à jour les modules
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
                    <p className="font-medium text-gray-900">{module.name}</p>
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
    </div>
  );
};

export default AgencesListPage;