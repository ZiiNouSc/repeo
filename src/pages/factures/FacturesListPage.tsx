import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Facture } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import axios from 'axios';

const FacturesListPage: React.FC = () => {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchFactures();
  }, []);

  const fetchFactures = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/factures');
      
      if (response.data.success) {
        setFactures(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to load invoices');
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (factureId: string) => {
    try {
      const response = await axios.put(`/api/factures/${factureId}/pay`);
      
      if (response.data.success) {
        // Update the local state
        setFactures(prev => prev.map(facture => 
          facture.id === factureId 
            ? { ...facture, statut: 'payee' as const }
            : facture
        ));
        
        // If the selected facture is the one being marked as paid, update it too
        if (selectedFacture && selectedFacture.id === factureId) {
          setSelectedFacture({ ...selectedFacture, statut: 'payee' });
        }
      } else {
        throw new Error(response.data.message || 'Failed to mark invoice as paid');
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Une erreur est survenue lors du marquage comme payée');
    }
  };

  const handleGeneratePDF = async (factureId: string) => {
    try {
      // Use axios to get the PDF with responseType blob
      const response = await axios.get(`/api/factures/${factureId}/pdf`, {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${factureId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Une erreur est survenue lors de la génération du PDF');
    }
  };

  const filteredFactures = factures.filter(facture => {
    const matchesSearch = facture.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (facture.client.entreprise || `${facture.client.prenom} ${facture.client.nom}`)
                           .toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'tous' || facture.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'payee':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'en_retard':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'envoyee':
        return <Clock className="w-4 h-4 text-blue-600" />;
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Factures</h1>
          <p className="text-gray-600">Gérer vos factures clients</p>
        </div>
        {hasPermission('factures', 'creer') && (
          <Link to="/factures/nouvelle" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Facture
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
                placeholder="Rechercher une facture..."
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
              <option value="envoyee">Envoyée</option>
              <option value="payee">Payée</option>
              <option value="en_retard">En retard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Numéro</TableHeaderCell>
              <TableHeaderCell>Client</TableHeaderCell>
              <TableHeaderCell>Date émission</TableHeaderCell>
              <TableHeaderCell>Échéance</TableHeaderCell>
              <TableHeaderCell>Montant TTC</TableHeaderCell>
              <TableHeaderCell>Statut</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFactures.map((facture) => (
              <TableRow key={facture.id}>
                <TableCell>
                  <div className="flex items-center">
                    {getStatusIcon(facture.statut)}
                    <span className="ml-2 font-medium text-gray-900">
                      {facture.numero}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">
                      {facture.client.entreprise || `${facture.client.prenom} ${facture.client.nom}`}
                    </p>
                    <p className="text-sm text-gray-500">{facture.client.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(facture.dateEmission).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <div className={`${
                    facture.statut === 'en_retard' ? 'text-red-600 font-medium' : ''
                  }`}>
                    {new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}
                  </div>
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
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedFacture(facture);
                        setShowDetailModal(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {hasPermission('factures', 'modifier') && facture.statut !== 'payee' && (
                      <Link
                        to={`/factures/${facture.id}/modifier`}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}

                    <button
                      onClick={() => handleGeneratePDF(facture.id)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="Télécharger PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {facture.statut === 'brouillon' && (
                      <button
                        className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                        title="Envoyer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}

                    {facture.statut !== 'payee' && hasPermission('factures', 'modifier') && (
                      <button
                        onClick={() => handleMarkAsPaid(facture.id)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Marquer comme payée"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredFactures.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune facture trouvée</p>
          </div>
        )}
      </div>

      {/* Modal détails facture */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails de la facture"
        size="xl"
      >
        {selectedFacture && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de facture
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{selectedFacture.numero}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedFacture.client.entreprise || `${selectedFacture.client.prenom} ${selectedFacture.client.nom}`}
                  </p>
                  <p className="text-sm text-gray-500">{selectedFacture.client.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <Badge 
                    variant={
                      selectedFacture.statut === 'payee' ? 'success' :
                      selectedFacture.statut === 'en_retard' ? 'danger' :
                      selectedFacture.statut === 'envoyee' ? 'info' : 'default'
                    }
                  >
                    {selectedFacture.statut === 'payee' ? 'Payée' :
                     selectedFacture.statut === 'en_retard' ? 'En retard' :
                     selectedFacture.statut === 'envoyee' ? 'Envoyée' : 'Brouillon'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'émission
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedFacture.dateEmission).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'échéance
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedFacture.dateEcheance).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant total TTC
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedFacture.montantTTC.toLocaleString('fr-FR', { 
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
                    {selectedFacture.articles.map((article) => (
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
              <button 
                onClick={() => handleGeneratePDF(selectedFacture.id)}
                className="btn-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </button>
              {selectedFacture.statut !== 'payee' && (
                <button 
                  onClick={() => handleMarkAsPaid(selectedFacture.id)}
                  className="btn-primary"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marquer comme payée
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FacturesListPage;