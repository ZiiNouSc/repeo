import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Client } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';

const ClientsListPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setClients([
          {
            id: '1',
            nom: 'Dubois',
            prenom: 'Martin',
            email: 'martin.dubois@email.com',
            telephone: '+33 1 23 45 67 89',
            adresse: '123 Rue de la Paix, 75001 Paris',
            solde: 1250.50,
            dateCreation: '2024-01-10'
          },
          {
            id: '2',
            nom: 'Entreprise ABC',
            entreprise: 'ABC Solutions',
            email: 'contact@abc-solutions.com',
            telephone: '+33 1 98 76 54 32',
            adresse: '456 Avenue des Affaires, 69002 Lyon',
            solde: -450.00,
            dateCreation: '2024-01-08'
          },
          {
            id: '3',
            nom: 'Martin',
            prenom: 'Sophie',
            email: 'sophie.martin@email.com',
            telephone: '+33 4 56 78 90 12',
            adresse: '789 Boulevard du Commerce, 13001 Marseille',
            solde: 0,
            dateCreation: '2024-01-05'
          }
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleDelete = async (clientId: string) => {
    try {
      setClients(prev => prev.filter(client => client.id !== clientId));
      setShowDeleteModal(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.nom.toLowerCase().includes(searchLower) ||
      (client.prenom && client.prenom.toLowerCase().includes(searchLower)) ||
      (client.entreprise && client.entreprise.toLowerCase().includes(searchLower)) ||
      client.email.toLowerCase().includes(searchLower)
    );
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Clients</h1>
          <p className="text-gray-600">Gérer votre base de clients</p>
        </div>
        {hasPermission('clients', 'creer') && (
          <Link to="/clients/nouveau" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Client
          </Link>
        )}
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                className="w-full pl-10 input-field"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des clients */}
      <div className="card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Client</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Solde</TableHeaderCell>
              <TableHeaderCell>Date création</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">
                      {client.entreprise || `${client.prenom} ${client.nom}`}
                    </p>
                    <p className="text-sm text-gray-500">{client.adresse}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {client.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {client.telephone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      client.solde > 0 ? 'success' :
                      client.solde < 0 ? 'danger' : 'default'
                    }
                  >
                    {client.solde.toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    })}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(client.dateCreation).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setShowDetailModal(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {hasPermission('clients', 'modifier') && (
                      <Link
                        to={`/clients/${client.id}/modifier`}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}

                    {hasPermission('clients', 'supprimer') && (
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setShowDeleteModal(true);
                        }}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredClients.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun client trouvé</p>
          </div>
        )}
      </div>

      {/* Modal détails client */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails du client"
        size="lg"
      >
        {selectedClient && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {selectedClient.entreprise ? 'Entreprise' : 'Nom complet'}
                </label>
                <p className="text-sm text-gray-900">
                  {selectedClient.entreprise || `${selectedClient.prenom} ${selectedClient.nom}`}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-sm text-gray-900">{selectedClient.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <p className="text-sm text-gray-900">{selectedClient.telephone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Solde
                </label>
                <Badge 
                  variant={
                    selectedClient.solde > 0 ? 'success' :
                    selectedClient.solde < 0 ? 'danger' : 'default'
                  }
                >
                  {selectedClient.solde.toLocaleString('fr-FR', { 
                    style: 'currency', 
                    currency: 'EUR' 
                  })}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <p className="text-sm text-gray-900">{selectedClient.adresse}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal suppression */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
      >
        {selectedClient && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer le client{' '}
              <strong>
                {selectedClient.entreprise || `${selectedClient.prenom} ${selectedClient.nom}`}
              </strong> ?
            </p>
            <p className="text-sm text-red-600">
              Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(selectedClient.id)}
                className="btn-danger"
              >
                Supprimer
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
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

export default ClientsListPage;