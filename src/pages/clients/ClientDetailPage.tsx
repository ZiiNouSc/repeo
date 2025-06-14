import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Euro,
  FileText,
  Plus,
  Eye
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Client, Facture, BonCommande } from '../../types';
import { clientsAPI, facturesAPI, bonCommandeAPI } from '../../services/api';

const ClientDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [bonsCommande, setBonsCommande] = useState<BonCommande[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('infos');

  useEffect(() => {
    if (id) {
      fetchClientData();
    }
  }, [id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      // Fetch client data
      const clientResponse = await clientsAPI.getById(id!);
      setClient(clientResponse.data.data);
      
      // Fetch factures
      const facturesResponse = await facturesAPI.getAll();
      const clientFactures = facturesResponse.data.data.filter(
        (facture: Facture) => facture.clientId === id
      );
      setFactures(clientFactures);
      
      // Fetch bons de commande
      const bonsCommandeResponse = await bonCommandeAPI.getAll();
      const clientBonsCommande = bonsCommandeResponse.data.data.filter(
        (bon: BonCommande) => bon.clientId === id
      );
      setBonsCommande(clientBonsCommande);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données client:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'infos', label: 'Informations', count: null },
    { id: 'factures', label: 'Factures', count: factures.length },
    { id: 'bons-commande', label: 'Bons de commande', count: bonsCommande.length },
    { id: 'historique', label: 'Historique', count: null }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client non trouvé</p>
        <button
          onClick={() => navigate('/clients')}
          className="btn-primary mt-4"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'infos':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {client.entreprise || `${client.prenom} ${client.nom}`}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-700">
                      {client.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <a href={`tel:${client.telephone}`} className="text-blue-600 hover:text-blue-700">
                      {client.telephone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adresse</label>
                    <p className="text-gray-900">{client.adresse}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Euro className="w-4 h-4 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Solde</label>
                    <Badge 
                      variant={
                        client.solde > 0 ? 'success' :
                        client.solde < 0 ? 'danger' : 'default'
                      }
                      size="lg"
                    >
                      {client.solde.toLocaleString('fr-FR', { 
                        style: 'currency', 
                        currency: 'EUR' 
                      })}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Client depuis</label>
                    <p className="text-gray-900">
                      {new Date(client.dateCreation).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Actions rapides</h3>
                  <div className="space-y-2">
                    <Link
                      to={`/factures/nouvelle?clientId=${client.id}`}
                      className="btn-primary w-full justify-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nouvelle facture
                    </Link>
                    <Link
                      to={`/bons-commande/nouveau?clientId=${client.id}`}
                      className="btn-secondary w-full justify-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nouveau bon de commande
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'factures':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Factures ({factures.length})
              </h3>
              <Link
                to={`/factures/nouvelle?clientId=${client.id}`}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle facture
              </Link>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Numéro</TableHeaderCell>
                  <TableHeaderCell>Date émission</TableHeaderCell>
                  <TableHeaderCell>Échéance</TableHeaderCell>
                  <TableHeaderCell>Montant TTC</TableHeaderCell>
                  <TableHeaderCell>Statut</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {factures.map((facture) => (
                  <TableRow key={facture.id}>
                    <TableCell>
                      <span className="font-medium">{facture.numero}</span>
                    </TableCell>
                    <TableCell>
                      {new Date(facture.dateEmission).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {facture.montantTTC.toLocaleString('fr-FR', { 
                          style: 'currency', 
                          currency: 'EUR' 
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          facture.statut === 'payee' ? 'success' :
                          facture.statut === 'en_retard' ? 'danger' :
                          facture.statut === 'envoyee' ? 'info' : 'default'
                        }
                      >
                        {facture.statut === 'payee' ? 'Payée' :
                         facture.statut === 'en_retard' ? 'En retard' :
                         facture.statut === 'envoyee' ? 'Envoyée' : 'Brouillon'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/factures/${facture.id}`}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Voir la facture"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {factures.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune facture pour ce client</p>
              </div>
            )}
          </div>
        );

      case 'bons-commande':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Bons de commande ({bonsCommande.length})
              </h3>
              <Link
                to={`/bons-commande/nouveau?clientId=${client.id}`}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau bon de commande
              </Link>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Numéro</TableHeaderCell>
                  <TableHeaderCell>Date création</TableHeaderCell>
                  <TableHeaderCell>Montant TTC</TableHeaderCell>
                  <TableHeaderCell>Statut</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonsCommande.map((bon) => (
                  <TableRow key={bon.id}>
                    <TableCell>
                      <span className="font-medium">{bon.numero}</span>
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
                      <Link
                        to={`/bons-commande/${bon.id}`}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Voir le bon de commande"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {bonsCommande.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun bon de commande pour ce client</p>
              </div>
            )}
          </div>
        );

      case 'historique':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Historique des interactions</h3>
            
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-medium text-gray-900">Facture FAC-2024-001 créée</p>
                <p className="text-sm text-gray-600">15 janvier 2024 à 14:30</p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="font-medium text-gray-900">Paiement reçu pour FAC-2024-005</p>
                <p className="text-sm text-gray-600">12 janvier 2024 à 10:15</p>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <p className="font-medium text-gray-900">Bon de commande BC-2024-001 accepté</p>
                <p className="text-sm text-gray-600">10 janvier 2024 à 16:45</p>
              </div>
              
              <div className="border-l-4 border-gray-500 pl-4 py-2">
                <p className="font-medium text-gray-900">Client créé</p>
                <p className="text-sm text-gray-600">10 janvier 2024 à 09:00</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {client.entreprise || `${client.prenom} ${client.nom}`}
            </h1>
            <p className="text-gray-600">Détails du client</p>
          </div>
        </div>
        <Link
          to={`/clients/${client.id}/modifier`}
          className="btn-primary"
        >
          <Edit className="w-4 h-4 mr-2" />
          Modifier
        </Link>
      </div>

      {/* Résumé rapide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Euro className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Solde</p>
              <p className={`text-xl font-bold ${
                client.solde > 0 ? 'text-green-600' :
                client.solde < 0 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {client.solde.toLocaleString('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Factures</p>
              <p className="text-xl font-bold text-gray-900">{factures.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bons de commande</p>
              <p className="text-xl font-bold text-gray-900">{bonsCommande.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Client depuis</p>
              <p className="text-xl font-bold text-gray-900">
                {Math.floor((new Date().getTime() - new Date(client.dateCreation).getTime()) / (1000 * 60 * 60 * 24))} jours
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu de l'onglet */}
      <div className="card">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ClientDetailPage;