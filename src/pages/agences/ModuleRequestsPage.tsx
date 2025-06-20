import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  Package,
  FileText,
  Users,
  CreditCard,
  Wallet,
  Plane,
  FolderOpen,
  Clock,
  Store
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Card from '../../components/ui/Card';
import SearchFilter from '../../components/ui/SearchFilter';
import axios from 'axios';

interface ModuleRequest {
  id: string;
  agenceId: string;
  modules: string[];
  message: string;
  statut: 'en_attente' | 'approuve' | 'rejete';
  dateCreation: string;
  dateTraitement?: string;
  commentaireAdmin?: string;
  agence: {
    nom: string;
    email: string;
    telephone: string;
  };
}

const ModuleRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ModuleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [selectedRequest, setSelectedRequest] = useState<ModuleRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [processing, setProcessing] = useState(false);

  const availableModules = [
    { id: 'clients', name: 'Clients', description: 'Gestion des clients', icon: Users },
    { id: 'fournisseurs', name: 'Fournisseurs', description: 'Gestion des fournisseurs', icon: Users },
    { id: 'factures', name: 'Factures', description: 'Facturation', icon: FileText },
    { id: 'bons-commande', name: 'Bons de commande', description: 'Gestion des commandes', icon: FileText },
    { id: 'caisse', name: 'Caisse', description: 'Gestion de caisse', icon: Wallet },
    { id: 'creances', name: 'Créances', description: 'Suivi des impayés', icon: CreditCard },
    { id: 'packages', name: 'Packages', description: 'Création de packages', icon: Package },
    { id: 'billets', name: 'Billets d\'avion', description: 'Gestion des billets', icon: Plane },
    { id: 'vitrine', name: 'Vitrine', description: 'Vitrine publique', icon: Store },
    { id: 'documents', name: 'Documents', description: 'Gestion des documents', icon: FolderOpen },
    { id: 'todos', name: 'Tâches', description: 'Gestion des tâches', icon: CheckSquare },
    { id: 'calendrier', name: 'Calendrier', description: 'Gestion du calendrier', icon: Calendar },
    { id: 'crm', name: 'CRM', description: 'Gestion des contacts', icon: MessageSquare },
    { id: 'reservations', name: 'Réservations', description: 'Gestion des réservations', icon: Clock }
  ];

  const filterOptions = [
    {
      id: 'statut',
      label: 'Statut',
      options: [
        { value: 'en_attente', label: 'En attente' },
        { value: 'approuve', label: 'Approuvé' },
        { value: 'rejete', label: 'Rejeté' }
      ]
    }
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/module-requests');
      
      if (response.data.success) {
        setRequests(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to load module requests');
      }
    } catch (error) {
      console.error('Error loading module requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (approved: boolean) => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    try {
      const response = await axios.put(`/api/module-requests/${selectedRequest.id}/process`, {
        statut: approved ? 'approuve' : 'rejete',
        commentaireAdmin: adminComment
      });
      
      if (response.data.success) {
        // Update the request in the list
        setRequests(prev => prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, statut: approved ? 'approuve' : 'rejete', commentaireAdmin: adminComment, dateTraitement: new Date().toISOString() }
            : req
        ));
        
        setShowProcessModal(false);
        setAdminComment('');
        setSelectedRequest(null);
      } else {
        throw new Error(response.data.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error processing request:', error);
      alert('Une erreur est survenue lors du traitement de la demande');
    } finally {
      setProcessing(false);
    }
  };

  const handleFilterChange = (filterId: string, value: string) => {
    if (filterId === 'statut') {
      setStatusFilter(value);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('tous');
  };

  const filteredRequests = requests.filter(request => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      request.agence.nom.toLowerCase().includes(searchLower) ||
      request.message.toLowerCase().includes(searchLower)
    );
    
    const matchesStatus = statusFilter === 'tous' || request.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'approuve':
        return <Badge variant="success">Approuvée</Badge>;
      case 'rejete':
        return <Badge variant="danger">Rejetée</Badge>;
      default:
        return <Badge variant="warning">En attente</Badge>;
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
          <h1 className="text-2xl font-bold text-gray-900">Demandes de Modules</h1>
          <p className="text-gray-600">Gérer les demandes d'activation de modules des agences</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filterOptions}
        activeFilters={{ statut: statusFilter }}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        placeholder="Rechercher une demande..."
      />

      {/* Liste des demandes */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Agence</TableHeaderCell>
              <TableHeaderCell>Modules demandés</TableHeaderCell>
              <TableHeaderCell>Date demande</TableHeaderCell>
              <TableHeaderCell>Statut</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{request.agence.nom}</p>
                    <p className="text-sm text-gray-500">{request.agence.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {request.modules.slice(0, 3).map((moduleId) => {
                      const module = availableModules.find(m => m.id === moduleId);
                      return (
                        <Badge key={moduleId} variant="info" size="sm">
                          {module ? module.name : moduleId}
                        </Badge>
                      );
                    })}
                    {request.modules.length > 3 && (
                      <Badge variant="default" size="sm">
                        +{request.modules.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(request.dateCreation).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  {getStatusBadge(request.statut)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailModal(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {request.statut === 'en_attente' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setAdminComment('');
                            setShowProcessModal(true);
                          }}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Traiter la demande"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredRequests.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune demande trouvée</p>
          </div>
        )}
      </Card>

      {/* Modal détails demande */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails de la demande"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agence
                </label>
                <p className="text-sm text-gray-900">{selectedRequest.agence.nom}</p>
                <p className="text-sm text-gray-500">{selectedRequest.agence.email}</p>
                <p className="text-sm text-gray-500">{selectedRequest.agence.telephone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                {getStatusBadge(selectedRequest.statut)}
                {selectedRequest.dateTraitement && (
                  <p className="text-sm text-gray-500 mt-1">
                    Traité le {new Date(selectedRequest.dateTraitement).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modules demandés
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedRequest.modules.map((moduleId) => {
                  const module = availableModules.find(m => m.id === moduleId);
                  return (
                    <Badge key={moduleId} variant="info">
                      {module ? module.name : moduleId}
                    </Badge>
                  );
                })}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message de l'agence
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900">{selectedRequest.message}</p>
              </div>
            </div>
            
            {selectedRequest.commentaireAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire administrateur
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{selectedRequest.commentaireAdmin}</p>
                </div>
              </div>
            )}
            
            {selectedRequest.statut === 'en_attente' && (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setAdminComment('');
                    setShowProcessModal(true);
                  }}
                  className="btn-primary"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Traiter la demande
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal traitement demande */}
      <Modal
        isOpen={showProcessModal}
        onClose={() => {
          setShowProcessModal(false);
          setAdminComment('');
        }}
        title="Traiter la demande"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">
                Demande de {selectedRequest.agence.nom}
              </h3>
              <p className="text-sm text-blue-700">
                Modules demandés: {selectedRequest.modules.map(m => {
                  const module = availableModules.find(mod => mod.id === m);
                  return module ? module.name : m;
                }).join(', ')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message de l'agence
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900">{selectedRequest.message}</p>
              </div>
            </div>
            
            <div>
              <label htmlFor="adminComment" className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                id="adminComment"
                rows={4}
                className="input-field"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Ajoutez un commentaire à votre décision..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowProcessModal(false);
                  setAdminComment('');
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={() => handleProcessRequest(false)}
                disabled={processing}
                className="btn-danger"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rejeter
              </button>
              <button
                onClick={() => handleProcessRequest(true)}
                disabled={processing}
                className="btn-success"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approuver
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ModuleRequestsPage;