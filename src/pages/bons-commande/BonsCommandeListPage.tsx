import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { BonCommande } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';

const BonsCommandeListPage: React.FC = () => {
  const [bonsCommande, setBonsCommande] = useState<BonCommande[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [selectedBon, setSelectedBon] = useState<BonCommande | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    const fetchBonsCommande = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setBonsCommande([
          {
            id: '1',
            numero: 'BC-2024-001',
            clientId: '1',
            client: {
              id: '1',
              nom: 'Dubois',
              prenom: 'Martin',
              email: 'martin.dubois@email.com',
              telephone: '+33 1 23 45 67 89',
              adresse: '123 Rue de la Paix, 75001 Paris',
              solde: 1250.50,
              dateCreation: '2024-01-10'
            },
            dateCreation: '2024-01-15',
            statut: 'envoye',
            montantHT: 1000.00,
            montantTTC: 1200.00,
            articles: [
              {
                id: '1',
                designation: 'Package Voyage Paris-Rome',
                quantite: 1,
                prixUnitaire: 1000.00,
                montant: 1000.00
              }
            ]
          },
          {
            id: '2',
            numero: 'BC-2024-002',
            clientId: '2',
            client: {
              id: '2',
              nom: 'Entreprise ABC',
              entreprise: 'ABC Solutions',
              email: 'contact@abc-solutions.com',
              telephone: '+33 1 98 76 54 32',
              adresse: '456 Avenue des Affaires, 69002 Lyon',
              solde: -450.00,
              dateCreation: '2024-01-08'
            },
            dateCreation: '2024-01-12',
            statut: 'accepte',
            montantHT: 2500.00,
            montantTTC: 3000.00,
            articles: [
              {
                id: '1',
                designation: 'Séminaire entreprise - 3 jours',
                quantite: 1,
                prixUnitaire: 2500.00,
                montant: 2500.00
              }
            ]
          },
          {
            id: '3',
            numero: 'BC-2024-003',
            clientId: '3',
            client: {
              id: '3',
              nom: 'Martin',
              prenom: 'Sophie',
              email: 'sophie.martin@email.com',
              telephone: '+33 4 56 78 90 12',
              adresse: '789 Boulevard du Commerce, 13001 Marseille',
              solde: 0,
              dateCreation: '2024-01-05'
            },
            dateCreation: '2024-01-10',
            statut: 'brouillon',
            montantHT: 750.00,
            montantTTC: 900.00,
            articles: [
              {
                id: '1',
                designation: 'Billet avion Marseille-Madrid',
                quantite: 2,
                prixUnitaire: 375.00,
                montant: 750.00
              }
            ]
          }
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des bons de commande:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBonsCommande();
  }, []);

  const handleConvertToInvoice = async (bonId: string) => {
    try {
      setBonsCommande(prev => prev.map(bon => 
        bon.id === bonId 
          ? { ...bon, statut: 'facture' as const }
          : bon
      ));
      console.log('Bon de commande converti en facture');
    } catch (error) {
      console.error('Erreur lors de la conversion:', error);
    }
  };

  const filteredBons = bonsCommande.filter(bon => {
    const matchesSearch = bon.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bon.client.entreprise || `${bon.client.prenom} ${bon.client.nom}`)
                           .toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'tous' || bon.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'accepte':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'refuse':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'envoye':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'facture':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
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
          <h1 className="text-2xl font-bold text-gray-900">Bons de Commande</h1>
          <p className="text-gray-600">Gérer vos bons de commande clients</p>
        </div>
        {hasPermission('bons-commande', 'creer') && (
          <Link to="/bons-commande/nouveau" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Bon de Commande
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
                placeholder="Rechercher un bon de commande..."
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
              <option value="brouillon">Brouillon</option>
              <option value="envoye">Envoyé</option>
              <option value="accepte">Accepté</option>
              <option value="refuse">Refusé</option>
              <option value="facture">Facturé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des bons de commande */}
      <div className="card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Numéro</TableHeaderCell>
              <TableHeaderCell>Client</TableHeaderCell>
              <TableHeaderCell>Date création</TableHeaderCell>
              <TableHeaderCell>Montant TTC</TableHeaderCell>
              <TableHeaderCell>Statut</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBons.map((bon) => (
              <TableRow key={bon.id}>
                <TableCell>
                  <div className="flex items-center">
                    {getStatusIcon(bon.statut)}
                    <span className="ml-2 font-medium text-gray-900">
                      {bon.numero}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">
                      {bon.client.entreprise || `${bon.client.prenom} ${bon.client.nom}`}
                    </p>
                    <p className="text-sm text-gray-500">{bon.client.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(bon.dateCreation).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {bon.montantTTC.toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      bon.statut === 'accepte' ? 'success' :
                      bon.statut === 'refuse' ? 'danger' :
                      bon.statut === 'envoye' ? 'info' :
                      bon.statut === 'facture' ? 'success' : 'default'
                    }
                  >
                    {bon.statut === 'accepte' ? 'Accepté' :
                     bon.statut === 'refuse' ? 'Refusé' :
                     bon.statut === 'envoye' ? 'Envoyé' :
                     bon.statut === 'facture' ? 'Facturé' : 'Brouillon'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedBon(bon);
                        setShowDetailModal(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {hasPermission('bons-commande', 'modifier') && bon.statut !== 'facture' && (
                      <Link
                        to={`/bons-commande/${bon.id}/modifier`}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}

                    {bon.statut === 'accepte' && hasPermission('factures', 'creer') && (
                      <button
                        onClick={() => handleConvertToInvoice(bon.id)}
                        className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                        title="Convertir en facture"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredBons.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun bon de commande trouvé</p>
          </div>
        )}
      </div>

      {/* Modal détails bon de commande */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails du bon de commande"
        size="xl"
      >
        {selectedBon && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{selectedBon.numero}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedBon.client.entreprise || `${selectedBon.client.prenom} ${selectedBon.client.nom}`}
                  </p>
                  <p className="text-sm text-gray-500">{selectedBon.client.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <Badge 
                    variant={
                      selectedBon.statut === 'accepte' ? 'success' :
                      selectedBon.statut === 'refuse' ? 'danger' :
                      selectedBon.statut === 'envoye' ? 'info' :
                      selectedBon.statut === 'facture' ? 'success' : 'default'
                    }
                  >
                    {selectedBon.statut === 'accepte' ? 'Accepté' :
                     selectedBon.statut === 'refuse' ? 'Refusé' :
                     selectedBon.statut === 'envoye' ? 'Envoyé' :
                     selectedBon.statut === 'facture' ? 'Facturé' : 'Brouillon'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de création
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedBon.dateCreation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant HT
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedBon.montantHT.toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant TTC
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedBon.montantTTC.toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Articles
              </label>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Désignation</TableHeaderCell>
                      <TableHeaderCell>Quantité</TableHeaderCell>
                      <TableHeaderCell>Prix unitaire</TableHeaderCell>
                      <TableHeaderCell>Montant</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBon.articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell>{article.designation}</TableCell>
                        <TableCell>{article.quantite}</TableCell>
                        <TableCell>
                          {article.prixUnitaire.toLocaleString('fr-FR', { 
                            style: 'currency', 
                            currency: 'EUR' 
                          })}
                        </TableCell>
                        <TableCell>
                          {article.montant.toLocaleString('fr-FR', { 
                            style: 'currency', 
                            currency: 'EUR' 
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              {selectedBon.statut === 'accepte' && (
                <button 
                  onClick={() => handleConvertToInvoice(selectedBon.id)}
                  className="btn-primary"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Convertir en facture
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BonsCommandeListPage;