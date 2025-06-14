import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye,
  Edit,
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plane,
  Hotel,
  Car,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
import EmptyState from '../../components/ui/EmptyState';

interface Reservation {
  id: string;
  numero: string;
  clientId: string;
  clientNom: string;
  type: 'vol' | 'hotel' | 'package' | 'transport';
  destination: string;
  dateDepart: string;
  dateRetour: string;
  nombrePersonnes: number;
  montant: number;
  statut: 'confirmee' | 'en_attente' | 'annulee' | 'terminee';
  dateCreation: string;
  notes?: string;
}

const ReservationsListPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'table' | 'grid' | 'list'>('table');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const filterOptions = [
    {
      id: 'type',
      label: 'Type de réservation',
      options: [
        { value: 'vol', label: 'Vol' },
        { value: 'hotel', label: 'Hôtel' },
        { value: 'package', label: 'Package' },
        { value: 'transport', label: 'Transport' }
      ]
    },
    {
      id: 'statut',
      label: 'Statut',
      options: [
        { value: 'confirmee', label: 'Confirmée' },
        { value: 'en_attente', label: 'En attente' },
        { value: 'annulee', label: 'Annulée' },
        { value: 'terminee', label: 'Terminée' }
      ]
    },
    {
      id: 'periode',
      label: 'Période',
      options: [
        { value: 'cette_semaine', label: 'Cette semaine' },
        { value: 'ce_mois', label: 'Ce mois' },
        { value: 'prochains_30j', label: 'Prochains 30 jours' }
      ]
    }
  ];

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setReservations([
        {
          id: '1',
          numero: 'RES-2024-001',
          clientId: '1',
          clientNom: 'Martin Dubois',
          type: 'package',
          destination: 'Rome, Italie',
          dateDepart: '2024-02-15',
          dateRetour: '2024-02-18',
          nombrePersonnes: 2,
          montant: 1200.00,
          statut: 'confirmee',
          dateCreation: '2024-01-15',
          notes: 'Voyage de noces - demande chambre avec vue'
        },
        {
          id: '2',
          numero: 'RES-2024-002',
          clientId: '2',
          clientNom: 'Sophie Martin',
          type: 'vol',
          destination: 'Madrid, Espagne',
          dateDepart: '2024-02-20',
          dateRetour: '2024-02-25',
          nombrePersonnes: 1,
          montant: 350.00,
          statut: 'en_attente',
          dateCreation: '2024-01-14'
        },
        {
          id: '3',
          numero: 'RES-2024-003',
          clientId: '3',
          clientNom: 'Entreprise ABC',
          type: 'hotel',
          destination: 'Londres, Royaume-Uni',
          dateDepart: '2024-03-01',
          dateRetour: '2024-03-05',
          nombrePersonnes: 4,
          montant: 2400.00,
          statut: 'confirmee',
          dateCreation: '2024-01-12',
          notes: 'Séminaire entreprise - 4 chambres individuelles'
        },
        {
          id: '4',
          numero: 'RES-2024-004',
          clientId: '4',
          clientNom: 'Jean Leroy',
          type: 'transport',
          destination: 'Marseille, France',
          dateDepart: '2024-01-25',
          dateRetour: '2024-01-25',
          nombrePersonnes: 3,
          montant: 180.00,
          statut: 'terminee',
          dateCreation: '2024-01-10'
        }
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
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

  const filteredReservations = reservations.filter(reservation => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      reservation.numero.toLowerCase().includes(searchLower) ||
      reservation.clientNom.toLowerCase().includes(searchLower) ||
      reservation.destination.toLowerCase().includes(searchLower)
    );

    const typeFilter = activeFilters.type;
    const statutFilter = activeFilters.statut;

    const matchesType = !typeFilter || typeFilter === 'tous' || reservation.type === typeFilter;
    const matchesStatut = !statutFilter || statutFilter === 'tous' || reservation.statut === statutFilter;

    return matchesSearch && matchesType && matchesStatut;
  });

  const stats = {
    total: reservations.length,
    confirmees: reservations.filter(r => r.statut === 'confirmee').length,
    enAttente: reservations.filter(r => r.statut === 'en_attente').length,
    chiffreAffaires: reservations
      .filter(r => r.statut === 'confirmee' || r.statut === 'terminee')
      .reduce((sum, r) => sum + r.montant, 0)
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vol': return <Plane className="w-5 h-5" />;
      case 'hotel': return <Hotel className="w-5 h-5" />;
      case 'transport': return <Car className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vol': return 'blue';
      case 'hotel': return 'green';
      case 'transport': return 'purple';
      default: return 'orange';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'confirmee': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'annulee': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'terminee': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const renderReservationCard = (reservation: Reservation) => (
    <Card key={reservation.id} hover className="h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 bg-${getTypeColor(reservation.type)}-100 rounded-full flex items-center justify-center mr-3`}>
            {getTypeIcon(reservation.type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{reservation.numero}</h3>
            <p className="text-sm text-gray-600">{reservation.clientNom}</p>
          </div>
        </div>
        {getStatutIcon(reservation.statut)}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          {reservation.destination}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date(reservation.dateDepart).toLocaleDateString('fr-FR')} - {new Date(reservation.dateRetour).toLocaleDateString('fr-FR')}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          {reservation.nombrePersonnes} personne{reservation.nombrePersonnes > 1 ? 's' : ''}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-lg font-semibold text-gray-900">
          {reservation.montant.toLocaleString('fr-FR', { 
            style: 'currency', 
            currency: 'EUR' 
          })}
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={
              reservation.statut === 'confirmee' ? 'success' :
              reservation.statut === 'annulee' ? 'danger' :
              reservation.statut === 'terminee' ? 'info' : 'warning'
            }
            size="sm"
          >
            {reservation.statut === 'confirmee' ? 'Confirmée' :
             reservation.statut === 'annulee' ? 'Annulée' :
             reservation.statut === 'terminee' ? 'Terminée' : 'En attente'}
          </Badge>
          <button
            onClick={() => {
              setSelectedReservation(reservation);
              setShowDetailModal(true);
            }}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Réservations</h1>
          <p className="text-gray-600">Suivre et gérer toutes vos réservations</p>
        </div>
        <Link to="/reservations/nouvelle" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Réservation
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total réservations"
          value={stats.total}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Confirmées"
          value={stats.confirmees}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="En attente"
          value={stats.enAttente}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Chiffre d'affaires"
          value={stats.chiffreAffaires.toLocaleString('fr-FR', { 
            style: 'currency', 
            currency: 'EUR' 
          })}
          icon={TrendingUp}
          color="purple"
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
        placeholder="Rechercher une réservation..."
        showDateFilter={true}
      />

      {/* Contrôles de vue */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {filteredReservations.length} réservation{filteredReservations.length > 1 ? 's' : ''} trouvée{filteredReservations.length > 1 ? 's' : ''}
          </span>
        </div>
        <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {/* Contenu principal */}
      {filteredReservations.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Aucune réservation trouvée"
          description="Aucune réservation ne correspond à vos critères de recherche."
          action={{
            label: "Nouvelle réservation",
            onClick: () => window.location.href = '/reservations/nouvelle'
          }}
        />
      ) : (
        <>
          {currentView === 'table' && (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Réservation</TableHeaderCell>
                    <TableHeaderCell>Client</TableHeaderCell>
                    <TableHeaderCell>Destination</TableHeaderCell>
                    <TableHeaderCell>Dates</TableHeaderCell>
                    <TableHeaderCell>Montant</TableHeaderCell>
                    <TableHeaderCell>Statut</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-10 h-10 bg-${getTypeColor(reservation.type)}-100 rounded-full flex items-center justify-center mr-3`}>
                            {getTypeIcon(reservation.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{reservation.numero}</p>
                            <p className="text-sm text-gray-500 capitalize">{reservation.type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-gray-900">{reservation.clientNom}</p>
                        <p className="text-sm text-gray-500">{reservation.nombrePersonnes} personne{reservation.nombrePersonnes > 1 ? 's' : ''}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          {reservation.destination}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(reservation.dateDepart).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-sm text-gray-500">
                            au {new Date(reservation.dateRetour).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {reservation.montant.toLocaleString('fr-FR', { 
                            style: 'currency', 
                            currency: 'EUR' 
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatutIcon(reservation.statut)}
                          <Badge 
                            variant={
                              reservation.statut === 'confirmee' ? 'success' :
                              reservation.statut === 'annulee' ? 'danger' :
                              reservation.statut === 'terminee' ? 'info' : 'warning'
                            }
                            className="ml-2"
                          >
                            {reservation.statut === 'confirmee' ? 'Confirmée' :
                             reservation.statut === 'annulee' ? 'Annulée' :
                             reservation.statut === 'terminee' ? 'Terminée' : 'En attente'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setShowDetailModal(true);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/reservations/${reservation.id}/modifier`}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
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
              {filteredReservations.map(renderReservationCard)}
            </GridView>
          )}

          {currentView === 'list' && (
            <ListView>
              {filteredReservations.map((reservation) => (
                <Card key={reservation.id} padding="sm" className="hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-10 h-10 bg-${getTypeColor(reservation.type)}-100 rounded-full flex items-center justify-center`}>
                        {getTypeIcon(reservation.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-gray-900">{reservation.numero}</h3>
                          <Badge 
                            variant={
                              reservation.statut === 'confirmee' ? 'success' :
                              reservation.statut === 'annulee' ? 'danger' :
                              reservation.statut === 'terminee' ? 'info' : 'warning'
                            }
                            size="sm"
                          >
                            {reservation.statut === 'confirmee' ? 'Confirmée' :
                             reservation.statut === 'annulee' ? 'Annulée' :
                             reservation.statut === 'terminee' ? 'Terminée' : 'En attente'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">{reservation.clientNom}</span>
                          <span className="text-sm text-gray-600">{reservation.destination}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {reservation.montant.toLocaleString('fr-FR', { 
                              style: 'currency', 
                              currency: 'EUR' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setShowDetailModal(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/reservations/${reservation.id}/modifier`}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </ListView>
          )}
        </>
      )}

      {/* Modal détails réservation */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails de la réservation"
        size="xl"
      >
        {selectedReservation && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de réservation
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{selectedReservation.numero}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client
                  </label>
                  <p className="text-sm text-gray-900">{selectedReservation.clientNom}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de réservation
                  </label>
                  <div className="flex items-center">
                    {getTypeIcon(selectedReservation.type)}
                    <span className="ml-2 capitalize">{selectedReservation.type}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <div className="flex items-center">
                    {getStatutIcon(selectedReservation.statut)}
                    <Badge 
                      variant={
                        selectedReservation.statut === 'confirmee' ? 'success' :
                        selectedReservation.statut === 'annulee' ? 'danger' :
                        selectedReservation.statut === 'terminee' ? 'info' : 'warning'
                      }
                      className="ml-2"
                    >
                      {selectedReservation.statut === 'confirmee' ? 'Confirmée' :
                       selectedReservation.statut === 'annulee' ? 'Annulée' :
                       selectedReservation.statut === 'terminee' ? 'Terminée' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination
                  </label>
                  <p className="text-sm text-gray-900">{selectedReservation.destination}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de départ
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedReservation.dateDepart).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de retour
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedReservation.dateRetour).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de personnes
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedReservation.nombrePersonnes} personne{selectedReservation.nombrePersonnes > 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant total
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedReservation.montant.toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {selectedReservation.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{selectedReservation.notes}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Link
                to={`/reservations/${selectedReservation.id}/modifier`}
                className="btn-secondary"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Link>
              <button className="btn-primary">
                Générer les documents
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReservationsListPage;