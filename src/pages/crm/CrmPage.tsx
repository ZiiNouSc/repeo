import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare,
  TrendingUp,
  Clock,
  Star,
  Plus,
  Search,
  Filter,
  Eye,
  Edit
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

interface Contact {
  id: string;
  nom: string;
  prenom: string;
  entreprise?: string;
  email: string;
  telephone: string;
  statut: 'prospect' | 'client' | 'ancien_client';
  source: 'site_web' | 'recommandation' | 'publicite' | 'salon' | 'autre';
  score: number; // 1-5
  derniereInteraction: string;
  prochainRappel?: string;
  notes: string;
  interactions: Interaction[];
  dateCreation: string;
}

interface Interaction {
  id: string;
  type: 'appel' | 'email' | 'rencontre' | 'devis' | 'vente';
  date: string;
  description: string;
  resultat?: 'positif' | 'neutre' | 'negatif';
}

const CrmPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'table' | 'grid' | 'list'>('table');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const filterOptions = [
    {
      id: 'statut',
      label: 'Statut',
      options: [
        { value: 'prospect', label: 'Prospect' },
        { value: 'client', label: 'Client' },
        { value: 'ancien_client', label: 'Ancien client' }
      ]
    },
    {
      id: 'source',
      label: 'Source',
      options: [
        { value: 'site_web', label: 'Site web' },
        { value: 'recommandation', label: 'Recommandation' },
        { value: 'publicite', label: 'Publicité' },
        { value: 'salon', label: 'Salon' },
        { value: 'autre', label: 'Autre' }
      ]
    },
    {
      id: 'score',
      label: 'Score',
      options: [
        { value: '5', label: '5 étoiles' },
        { value: '4', label: '4 étoiles' },
        { value: '3', label: '3 étoiles' },
        { value: '2', label: '2 étoiles' },
        { value: '1', label: '1 étoile' }
      ]
    }
  ];

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setContacts([
        {
          id: '1',
          nom: 'Dubois',
          prenom: 'Martin',
          email: 'martin.dubois@email.com',
          telephone: '+33 1 23 45 67 89',
          statut: 'client',
          source: 'site_web',
          score: 5,
          derniereInteraction: '2024-01-15T10:30:00Z',
          prochainRappel: '2024-01-25T14:00:00Z',
          notes: 'Client fidèle, intéressé par les voyages en Europe',
          interactions: [
            {
              id: '1',
              type: 'vente',
              date: '2024-01-15T10:30:00Z',
              description: 'Vente package Rome - 1200€',
              resultat: 'positif'
            },
            {
              id: '2',
              type: 'appel',
              date: '2024-01-10T14:00:00Z',
              description: 'Appel de suivi pour le voyage à Rome',
              resultat: 'positif'
            }
          ],
          dateCreation: '2024-01-01'
        },
        {
          id: '2',
          nom: 'Martin',
          prenom: 'Sophie',
          entreprise: 'TechCorp',
          email: 'sophie.martin@techcorp.com',
          telephone: '+33 1 98 76 54 32',
          statut: 'prospect',
          source: 'recommandation',
          score: 4,
          derniereInteraction: '2024-01-14T16:20:00Z',
          prochainRappel: '2024-01-20T10:00:00Z',
          notes: 'Intéressée par un séminaire entreprise, budget 5000€',
          interactions: [
            {
              id: '3',
              type: 'devis',
              date: '2024-01-14T16:20:00Z',
              description: 'Envoi devis séminaire Londres - 5000€',
              resultat: 'neutre'
            },
            {
              id: '4',
              type: 'rencontre',
              date: '2024-01-12T11:00:00Z',
              description: 'Rendez-vous en agence pour discuter du projet',
              resultat: 'positif'
            }
          ],
          dateCreation: '2024-01-05'
        },
        {
          id: '3',
          nom: 'Leroy',
          prenom: 'Jean',
          email: 'jean.leroy@email.com',
          telephone: '+33 4 56 78 90 12',
          statut: 'prospect',
          source: 'publicite',
          score: 3,
          derniereInteraction: '2024-01-12T09:15:00Z',
          notes: 'Prospect tiède, à relancer dans 2 semaines',
          interactions: [
            {
              id: '5',
              type: 'email',
              date: '2024-01-12T09:15:00Z',
              description: 'Envoi brochure voyages été 2024',
              resultat: 'neutre'
            }
          ],
          dateCreation: '2024-01-08'
        }
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
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

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      contact.nom.toLowerCase().includes(searchLower) ||
      contact.prenom.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      (contact.entreprise && contact.entreprise.toLowerCase().includes(searchLower))
    );

    const statutFilter = activeFilters.statut;
    const sourceFilter = activeFilters.source;
    const scoreFilter = activeFilters.score;

    const matchesStatut = !statutFilter || statutFilter === 'tous' || contact.statut === statutFilter;
    const matchesSource = !sourceFilter || sourceFilter === 'tous' || contact.source === sourceFilter;
    const matchesScore = !scoreFilter || scoreFilter === 'tous' || contact.score.toString() === scoreFilter;

    return matchesSearch && matchesStatut && matchesSource && matchesScore;
  });

  const stats = {
    totalContacts: contacts.length,
    prospects: contacts.filter(c => c.statut === 'prospect').length,
    clients: contacts.filter(c => c.statut === 'client').length,
    rappelsAujourdhui: contacts.filter(c => 
      c.prochainRappel && 
      new Date(c.prochainRappel).toDateString() === new Date().toDateString()
    ).length
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'client': return 'success';
      case 'prospect': return 'warning';
      case 'ancien_client': return 'default';
      default: return 'default';
    }
  };

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= score ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderContactCard = (contact: Contact) => (
    <Card key={contact.id} hover className="h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {contact.prenom} {contact.nom}
            </h3>
            {contact.entreprise && (
              <p className="text-sm text-gray-600">{contact.entreprise}</p>
            )}
            <Badge variant={getStatutColor(contact.statut)} size="sm" className="mt-1">
              {contact.statut === 'client' ? 'Client' :
               contact.statut === 'prospect' ? 'Prospect' : 'Ancien client'}
            </Badge>
          </div>
        </div>
        {renderStars(contact.score)}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          {contact.email}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="w-4 h-4 mr-2" />
          {contact.telephone}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          Dernière interaction: {new Date(contact.derniereInteraction).toLocaleDateString('fr-FR')}
        </div>
      </div>

      {contact.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-2">{contact.notes}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {contact.interactions.length} interaction{contact.interactions.length > 1 ? 's' : ''}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedContact(contact);
              setShowDetailModal(true);
            }}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
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
          <h1 className="text-2xl font-bold text-gray-900">CRM - Gestion des Contacts</h1>
          <p className="text-gray-600">Gérer vos prospects et relations clients</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Contact
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total contacts"
          value={stats.totalContacts}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Prospects"
          value={stats.prospects}
          icon={TrendingUp}
          color="yellow"
        />
        <StatCard
          title="Clients"
          value={stats.clients}
          icon={Star}
          color="green"
        />
        <StatCard
          title="Rappels aujourd'hui"
          value={stats.rappelsAujourdhui}
          icon={Clock}
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
        placeholder="Rechercher un contact..."
      />

      {/* Contrôles de vue */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {filteredContacts.length} contact{filteredContacts.length > 1 ? 's' : ''} trouvé{filteredContacts.length > 1 ? 's' : ''}
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
                <TableHeaderCell>Contact</TableHeaderCell>
                <TableHeaderCell>Statut</TableHeaderCell>
                <TableHeaderCell>Score</TableHeaderCell>
                <TableHeaderCell>Dernière interaction</TableHeaderCell>
                <TableHeaderCell>Prochain rappel</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {contact.prenom} {contact.nom}
                        </p>
                        {contact.entreprise && (
                          <p className="text-sm text-gray-500">{contact.entreprise}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{contact.email}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatutColor(contact.statut)}>
                      {contact.statut === 'client' ? 'Client' :
                       contact.statut === 'prospect' ? 'Prospect' : 'Ancien client'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {renderStars(contact.score)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-900">
                        {new Date(contact.derniereInteraction).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {contact.interactions[0]?.type}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {contact.prochainRappel ? (
                      <div className={`text-sm ${
                        new Date(contact.prochainRappel) <= new Date() 
                          ? 'text-red-600 font-medium' 
                          : 'text-gray-900'
                      }`}>
                        {new Date(contact.prochainRappel).toLocaleDateString('fr-FR')}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowDetailModal(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Appeler"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                        title="Envoyer un email"
                      >
                        <Mail className="w-4 h-4" />
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
          {filteredContacts.map(renderContactCard)}
        </GridView>
      )}

      {/* Modal détails contact */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails du contact"
        size="xl"
      >
        {selectedContact && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedContact.prenom} {selectedContact.nom}
                  </p>
                  {selectedContact.entreprise && (
                    <p className="text-sm text-gray-600">{selectedContact.entreprise}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact
                  </label>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedContact.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedContact.telephone}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <Badge variant={getStatutColor(selectedContact.statut)}>
                    {selectedContact.statut === 'client' ? 'Client' :
                     selectedContact.statut === 'prospect' ? 'Prospect' : 'Ancien client'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Score
                  </label>
                  {renderStars(selectedContact.score)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {selectedContact.source.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dernière interaction
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedContact.derniereInteraction).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {selectedContact.prochainRappel && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prochain rappel
                    </label>
                    <p className={`text-sm ${
                      new Date(selectedContact.prochainRappel) <= new Date() 
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-900'
                    }`}>
                      {new Date(selectedContact.prochainRappel).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedContact.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{selectedContact.notes}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Historique des interactions
              </label>
              <div className="space-y-3">
                {selectedContact.interactions.map((interaction) => (
                  <div key={interaction.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {interaction.type === 'appel' && <Phone className="w-4 h-4 text-green-600 mr-2" />}
                        {interaction.type === 'email' && <Mail className="w-4 h-4 text-blue-600 mr-2" />}
                        {interaction.type === 'rencontre' && <Users className="w-4 h-4 text-purple-600 mr-2" />}
                        {interaction.type === 'devis' && <FileText className="w-4 h-4 text-orange-600 mr-2" />}
                        {interaction.type === 'vente' && <TrendingUp className="w-4 h-4 text-green-600 mr-2" />}
                        <span className="font-medium text-gray-900 capitalize">{interaction.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {interaction.resultat && (
                          <Badge 
                            variant={
                              interaction.resultat === 'positif' ? 'success' :
                              interaction.resultat === 'negatif' ? 'danger' : 'default'
                            }
                            size="sm"
                          >
                            {interaction.resultat}
                          </Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(interaction.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{interaction.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button className="btn-secondary">
                <Phone className="w-4 h-4 mr-2" />
                Appeler
              </button>
              <button className="btn-secondary">
                <Mail className="w-4 h-4 mr-2" />
                Envoyer un email
              </button>
              <button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle interaction
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal ajout contact */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nouveau contact"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input type="text" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input type="text" className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entreprise
            </label>
            <input type="text" className="input-field" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input type="email" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <input type="tel" className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut *
              </label>
              <select className="input-field">
                <option value="prospect">Prospect</option>
                <option value="client">Client</option>
                <option value="ancien_client">Ancien client</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source *
              </label>
              <select className="input-field">
                <option value="site_web">Site web</option>
                <option value="recommandation">Recommandation</option>
                <option value="publicite">Publicité</option>
                <option value="salon">Salon</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea className="input-field" rows={3}></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowAddModal(false)}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button className="btn-primary">
              Créer le contact
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CrmPage;