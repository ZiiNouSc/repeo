import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  Plane,
  Calendar,
  MapPin,
  Clock,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { BilletAvion } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';

const BilletsListPage: React.FC = () => {
  const [billets, setBillets] = useState<BilletAvion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [selectedBillet, setSelectedBillet] = useState<BilletAvion | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    const fetchBillets = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setBillets([
          {
            id: '1',
            numeroVol: 'AF1234',
            compagnie: 'Air France',
            dateDepart: '2024-02-15T08:30:00Z',
            dateArrivee: '2024-02-15T10:45:00Z',
            origine: 'Paris (CDG)',
            destination: 'Rome (FCO)',
            passager: 'Martin Dubois',
            prix: 245.00,
            statut: 'confirme'
          },
          {
            id: '2',
            numeroVol: 'LH5678',
            compagnie: 'Lufthansa',
            dateDepart: '2024-02-20T14:15:00Z',
            dateArrivee: '2024-02-20T17:30:00Z',
            origine: 'Lyon (LYS)',
            destination: 'Munich (MUC)',
            passager: 'Sophie Martin',
            prix: 189.50,
            statut: 'confirme'
          },
          {
            id: '3',
            numeroVol: 'IB9012',
            compagnie: 'Iberia',
            dateDepart: '2024-02-25T11:00:00Z',
            dateArrivee: '2024-02-25T12:30:00Z',
            origine: 'Marseille (MRS)',
            destination: 'Madrid (MAD)',
            passager: 'Jean Dupont',
            prix: 156.75,
            statut: 'en_attente'
          },
          {
            id: '4',
            numeroVol: 'BA3456',
            compagnie: 'British Airways',
            dateDepart: '2024-01-30T16:45:00Z',
            dateArrivee: '2024-01-30T17:15:00Z',
            origine: 'Paris (CDG)',
            destination: 'Londres (LHR)',
            passager: 'Marie Leroy',
            prix: 198.00,
            statut: 'annule'
          }
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des billets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillets();
  }, []);

  const filteredBillets = billets.filter(billet => {
    const matchesSearch = billet.numeroVol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         billet.passager.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         billet.origine.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         billet.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'tous' || billet.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'confirme':
        return <Plane className="w-4 h-4 text-green-600" />;
      case 'annule':
        return <Plane className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Billets d'Avion</h1>
          <p className="text-gray-600">Gérer les réservations de billets d'avion</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Importer Gmail
          </button>
          {hasPermission('billets', 'creer') && (
            <Link to="/billets/nouveau" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Billet
            </Link>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Plane className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total billets</p>
              <p className="text-2xl font-bold text-gray-900">{billets.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Plane className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmés</p>
              <p className="text-2xl font-bold text-gray-900">
                {billets.filter(b => b.statut === 'confirme').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">
                {billets.filter(b => b.statut === 'en_attente').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <Plane className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Annulés</p>
              <p className="text-2xl font-bold text-gray-900">
                {billets.filter(b => b.statut === 'annule').length}
              </p>
            </div>
          </div>
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
                placeholder="Rechercher un billet..."
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
              <option value="confirme">Confirmé</option>
              <option value="en_attente">En attente</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des billets */}
      <div className="card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Vol</TableHeaderCell>
              <TableHeaderCell>Passager</TableHeaderCell>
              <TableHeaderCell>Itinéraire</TableHeaderCell>
              <TableHeaderCell>Départ</TableHeaderCell>
              <TableHeaderCell>Prix</TableHeaderCell>
              <TableHeaderCell>Statut</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBillets.map((billet) => (
              <TableRow key={billet.id}>
                <TableCell>
                  <div className="flex items-center">
                    {getStatusIcon(billet.statut)}
                    <div className="ml-2">
                      <p className="font-medium text-gray-900">{billet.numeroVol}</p>
                      <p className="text-sm text-gray-500">{billet.compagnie}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-gray-900">{billet.passager}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                    <span>{billet.origine}</span>
                    <span className="mx-2">→</span>
                    <span>{billet.destination}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(billet.dateDepart).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(billet.dateDepart).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {billet.prix.toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      billet.statut === 'confirme' ? 'success' :
                      billet.statut === 'annule' ? 'danger' : 'warning'
                    }
                  >
                    {billet.statut === 'confirme' ? 'Confirmé' :
                     billet.statut === 'annule' ? 'Annulé' : 'En attente'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedBillet(billet);
                        setShowDetailModal(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Voir les détails"
                    >
                      <Plane className="w-4 h-4" />
                    </button>
                    
                    <button
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="Télécharger le billet"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredBillets.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun billet trouvé</p>
          </div>
        )}
      </div>

      {/* Modal détails billet */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails du billet d'avion"
        size="lg"
      >
        {selectedBillet && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de vol
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{selectedBillet.numeroVol}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compagnie
                  </label>
                  <p className="text-sm text-gray-900">{selectedBillet.compagnie}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passager
                  </label>
                  <p className="text-sm text-gray-900">{selectedBillet.passager}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <Badge 
                    variant={
                      selectedBillet.statut === 'confirme' ? 'success' :
                      selectedBillet.statut === 'annule' ? 'danger' : 'warning'
                    }
                  >
                    {selectedBillet.statut === 'confirme' ? 'Confirmé' :
                     selectedBillet.statut === 'annule' ? 'Annulé' : 'En attente'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Origine
                  </label>
                  <p className="text-sm text-gray-900">{selectedBillet.origine}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination
                  </label>
                  <p className="text-sm text-gray-900">{selectedBillet.destination}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Départ
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedBillet.dateDepart).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrivée
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedBillet.dateArrivee).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedBillet.prix.toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button className="btn-secondary">
                <Download className="w-4 h-4 mr-2" />
                Télécharger le billet
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BilletsListPage;