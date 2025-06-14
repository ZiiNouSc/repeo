import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  Settings,
  Send,
  Plus
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ViewToggle from '../../components/ui/ViewToggle';
import GridView from '../../components/ui/GridView';
import Card from '../../components/ui/Card';
import SearchFilter from '../../components/ui/SearchFilter';
import StatCard from '../../components/ui/StatCard';
import { useAuth } from '../../contexts/AuthContext';

interface Notification {
  id: string;
  type: 'email' | 'sms' | 'push' | 'systeme';
  titre: string;
  message: string;
  destinataire: string;
  statut: 'envoye' | 'en_attente' | 'echec' | 'lu';
  priorite: 'faible' | 'normale' | 'haute' | 'urgente';
  dateCreation: string;
  dateEnvoi?: string;
  dateOuverture?: string;
  erreur?: string;
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'table' | 'grid' | 'list'>('table');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const filterOptions = [
    {
      id: 'type',
      label: 'Type',
      options: [
        { value: 'email', label: 'Email' },
        { value: 'sms', label: 'SMS' },
        { value: 'push', label: 'Push' },
        { value: 'systeme', label: 'Système' }
      ]
    },
    {
      id: 'statut',
      label: 'Statut',
      options: [
        { value: 'envoye', label: 'Envoyé' },
        { value: 'en_attente', label: 'En attente' },
        { value: 'echec', label: 'Échec' },
        { value: 'lu', label: 'Lu' }
      ]
    },
    {
      id: 'priorite',
      label: 'Priorité',
      options: [
        { value: 'urgente', label: 'Urgente' },
        { value: 'haute', label: 'Haute' },
        { value: 'normale', label: 'Normale' },
        { value: 'faible', label: 'Faible' }
      ]
    }
  ];

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotifications([
        {
          id: '1',
          type: 'email',
          titre: 'Confirmation de réservation',
          message: 'Votre réservation pour Rome a été confirmée. Détails en pièce jointe.',
          destinataire: 'martin.dubois@email.com',
          statut: 'envoye',
          priorite: 'normale',
          dateCreation: '2024-01-15T10:30:00Z',
          dateEnvoi: '2024-01-15T10:32:00Z',
          dateOuverture: '2024-01-15T11:45:00Z'
        },
        {
          id: '2',
          type: 'sms',
          titre: 'Rappel rendez-vous',
          message: 'Rappel: RDV demain 14h en agence pour finaliser votre dossier voyage.',
          destinataire: '+33 1 23 45 67 89',
          statut: 'envoye',
          priorite: 'haute',
          dateCreation: '2024-01-14T16:00:00Z',
          dateEnvoi: '2024-01-14T16:01:00Z'
        },
        {
          id: '3',
          type: 'email',
          titre: 'Facture en retard',
          message: 'Votre facture FAC-2024-001 est en retard de paiement. Merci de régulariser.',
          destinataire: 'sophie.martin@email.com',
          statut: 'echec',
          priorite: 'urgente',
          dateCreation: '2024-01-13T09:00:00Z',
          erreur: 'Adresse email invalide'
        },
        {
          id: '4',
          type: 'push',
          titre: 'Nouveau message',
          message: 'Vous avez reçu un nouveau message de votre conseiller voyage.',
          destinataire: 'Agent Mobile App',
          statut: 'en_attente',
          priorite: 'normale',
          dateCreation: '2024-01-15T14:20:00Z'
        }
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
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

  const filteredNotifications = notifications.filter(notification => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      notification.titre.toLowerCase().includes(searchLower) ||
      notification.message.toLowerCase().includes(searchLower) ||
      notification.destinataire.toLowerCase().includes(searchLower)
    );

    const typeFilter = activeFilters.type;
    const statutFilter = activeFilters.statut;
    const prioriteFilter = activeFilters.priorite;

    const matchesType = !typeFilter || typeFilter === 'tous' || notification.type === typeFilter;
    const matchesStatut = !statutFilter || statutFilter === 'tous' || notification.statut === statutFilter;
    const matchesPriorite = !prioriteFilter || prioriteFilter === 'tous' || notification.priorite === prioriteFilter;

    return matchesSearch && matchesType && matchesStatut && matchesPriorite;
  });

  const stats = {
    total: notifications.length,
    envoyes: notifications.filter(n => n.statut === 'envoye').length,
    enAttente: notifications.filter(n => n.statut === 'en_attente').length,
    echecs: notifications.filter(n => n.statut === 'echec').length
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-5 h-5 text-blue-600" />;
      case 'sms': return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'push': return <Bell className="w-5 h-5 text-purple-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'envoye': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'echec': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'lu': return <Eye className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'urgente': return 'danger';
      case 'haute': return 'warning';
      case 'normale': return 'info';
      default: return 'default';
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
          <h1 className="text-2xl font-bold text-gray-900">Centre de Notifications</h1>
          <p className="text-gray-600">Gérer et suivre toutes vos communications</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Notification
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total notifications"
          value={stats.total}
          icon={Bell}
          color="blue"
        />
        <StatCard
          title="Envoyées"
          value={stats.envoyes}
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
          title="Échecs"
          value={stats.echecs}
          icon={AlertTriangle}
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
        placeholder="Rechercher une notification..."
      />

      {/* Contrôles de vue */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''} trouvée{filteredNotifications.length > 1 ? 's' : ''}
          </span>
        </div>
        <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {/* Contenu principal */}
      {currentView === 'table' && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Notification</TableHeaderCell>
                <TableHeaderCell>Destinataire</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Priorité</TableHeaderCell>
                <TableHeaderCell>Statut</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{notification.titre}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{notification.message}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-900">{notification.destinataire}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getTypeIcon(notification.type)}
                      <span className="ml-2 capitalize">{notification.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPrioriteColor(notification.priorite)} size="sm">
                      {notification.priorite}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getStatutIcon(notification.statut)}
                      <Badge 
                        variant={
                          notification.statut === 'envoye' ? 'success' :
                          notification.statut === 'echec' ? 'danger' :
                          notification.statut === 'lu' ? 'info' : 'warning'
                        }
                        className="ml-2"
                        size="sm"
                      >
                        {notification.statut === 'envoye' ? 'Envoyé' :
                         notification.statut === 'echec' ? 'Échec' :
                         notification.statut === 'lu' ? 'Lu' : 'En attente'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-900">
                        {new Date(notification.dateCreation).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.dateCreation).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedNotification(notification);
                          setShowDetailModal(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {notification.statut === 'echec' && (
                        <button
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Renvoyer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button
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

      {/* Modal détails notification */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails de la notification"
        size="lg"
      >
        {selectedNotification && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{selectedNotification.titre}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <div className="flex items-center">
                    {getTypeIcon(selectedNotification.type)}
                    <span className="ml-2 capitalize">{selectedNotification.type}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destinataire
                  </label>
                  <p className="text-sm text-gray-900">{selectedNotification.destinataire}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorité
                  </label>
                  <Badge variant={getPrioriteColor(selectedNotification.priorite)}>
                    {selectedNotification.priorite}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <div className="flex items-center">
                    {getStatutIcon(selectedNotification.statut)}
                    <Badge 
                      variant={
                        selectedNotification.statut === 'envoye' ? 'success' :
                        selectedNotification.statut === 'echec' ? 'danger' :
                        selectedNotification.statut === 'lu' ? 'info' : 'warning'
                      }
                      className="ml-2"
                    >
                      {selectedNotification.statut === 'envoye' ? 'Envoyé' :
                       selectedNotification.statut === 'echec' ? 'Échec' :
                       selectedNotification.statut === 'lu' ? 'Lu' : 'En attente'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de création
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedNotification.dateCreation).toLocaleString('fr-FR')}
                  </p>
                </div>
                {selectedNotification.dateEnvoi && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'envoi
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedNotification.dateEnvoi).toLocaleString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900">{selectedNotification.message}</p>
              </div>
            </div>

            {selectedNotification.erreur && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Erreur
                </label>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{selectedNotification.erreur}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              {selectedNotification.statut === 'echec' && (
                <button className="btn-primary">
                  <Send className="w-4 h-4 mr-2" />
                  Renvoyer
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal création notification */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvelle notification"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select className="input-field">
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
                <option value="systeme">Système</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorité *
              </label>
              <select className="input-field">
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
                <option value="faible">Faible</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destinataire *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Email, téléphone ou nom du destinataire"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Titre de la notification"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Contenu de la notification..."
            />
          </div>

          <div className="flex items-center">
            <input type="checkbox" id="envoyerMaintenant" className="mr-2" />
            <label htmlFor="envoyerMaintenant" className="text-sm text-gray-700">
              Envoyer immédiatement
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowCreateModal(false)}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button className="btn-primary">
              <Send className="w-4 h-4 mr-2" />
              Créer et envoyer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationsPage;