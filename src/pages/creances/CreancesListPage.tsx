import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Euro
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Facture } from '../../types';
import { creancesAPI } from '../../services/api';

const CreancesListPage: React.FC = () => {
  const [creances, setCreances] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCreance, setSelectedCreance] = useState<Facture | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRelanceModal, setShowRelanceModal] = useState(false);
  const [relanceMessage, setRelanceMessage] = useState('');
  const [stats, setStats] = useState({
    totalCreances: 0,
    totalFactures: 0,
    avgDaysLate: 0
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCreances();
    fetchStats();
  }, []);

  const fetchCreances = async () => {
    try {
      setLoading(true);
      const response = await creancesAPI.getAll();
      
      if (response.data.success) {
        setCreances(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to load unpaid invoices');
      }
    } catch (error) {
      console.error('Error loading unpaid invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await creancesAPI.getStats();
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to load stats');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const calculateDaysLate = (dateEcheance: string) => {
    const today = new Date();
    const echeance = new Date(dateEcheance);
    const diffTime = today.getTime() - echeance.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleSendReminder = async (creanceId: string) => {
    if (!creanceId) {
      console.error('Creance ID is undefined');
      return;
    }
    
    if (!relanceMessage.trim()) {
      alert('Veuillez saisir un message de relance');
      return;
    }
    
    try {
      setActionLoading(true);
      const response = await creancesAPI.sendReminder(creanceId, relanceMessage);
      
      if (response.data.success) {
        alert('Relance envoyée avec succès');
        setShowRelanceModal(false);
        setRelanceMessage('');
      } else {
        throw new Error(response.data.message || 'Failed to send reminder');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Une erreur est survenue lors de l\'envoi de la relance: ' + (error.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setActionLoading(false);
    }
  };

  const prepareRelanceMessage = (creance: Facture) => {
    const message = `Madame, Monsieur,

Nous vous rappelons que la facture ${creance.numero} d'un montant de ${creance.montantTTC.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} est échue depuis le ${new Date(creance.dateEcheance).toLocaleDateString('fr-FR')}.

Nous vous remercions de bien vouloir procéder au règlement dans les plus brefs délais.

Cordialement,
L'équipe SamTech`;
    
    setRelanceMessage(message);
    setSelectedCreance(creance);
    setShowRelanceModal(true);
  };

  const filteredCreances = creances.filter(creance => {
    const searchLower = searchTerm.toLowerCase();
    return (
      creance.numero.toLowerCase().includes(searchLower) ||
      (creance.client.entreprise || `${creance.client.prenom} ${creance.client.nom}`)
        .toLowerCase().includes(searchLower)
    );
  });

  const totalCreances = creances.reduce((sum, creance) => sum + creance.montantTTC, 0);

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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Créances</h1>
          <p className="text-gray-600">Suivi des factures impayées et relances</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total des créances</p>
          <p className="text-2xl font-bold text-red-600">
            {totalCreances.toLocaleString('fr-FR', { 
              style: 'currency', 
              currency: 'EUR' 
            })}
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Factures en retard</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFactures}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Retard moyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.avgDaysLate} jours
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Euro className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Montant moyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats.totalCreances / (stats.totalFactures || 1)).toLocaleString('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                })}
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
                placeholder="Rechercher une créance..."
                className="w-full pl-10 input-field"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des créances */}
      <div className="card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Facture</TableHeaderCell>
              <TableHeaderCell>Client</TableHeaderCell>
              <TableHeaderCell>Date échéance</TableHeaderCell>
              <TableHeaderCell>Retard</TableHeaderCell>
              <TableHeaderCell>Montant TTC</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCreances.map((creance) => {
              const daysLate = calculateDaysLate(creance.dateEcheance);
              return (
                <TableRow key={creance.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      <span className="font-medium text-gray-900">
                        {creance.numero}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">
                        {creance.client.entreprise || `${creance.client.prenom} ${creance.client.nom}`}
                      </p>
                      <p className="text-sm text-gray-500">{creance.client.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-red-600 font-medium">
                      {new Date(creance.dateEcheance).toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="danger">
                      {daysLate} jour{daysLate > 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-red-600">
                      {creance.montantTTC.toLocaleString('fr-FR', { 
                        style: 'currency', 
                        currency: 'EUR' 
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCreance(creance);
                          setShowDetailModal(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Voir les détails"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                      
                      {creance.id && (
                        <button
                          onClick={() => prepareRelanceMessage(creance)}
                          disabled={actionLoading}
                          className="p-1 text-orange-600 hover:bg-orange-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Envoyer une relance"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      )}

                      <a
                        href={`tel:${creance.client.telephone}`}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Appeler le client"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredCreances.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune créance trouvée</p>
          </div>
        )}
      </div>

      {/* Modal détails créance */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails de la créance"
        size="lg"
      >
        {selectedCreance && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de facture
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{selectedCreance.numero}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedCreance.client.entreprise || `${selectedCreance.client.prenom} ${selectedCreance.client.nom}`}
                  </p>
                  <p className="text-sm text-gray-500">{selectedCreance.client.email}</p>
                  <p className="text-sm text-gray-500">{selectedCreance.client.telephone}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'échéance
                  </label>
                  <p className="text-sm text-red-600 font-medium">
                    {new Date(selectedCreance.dateEcheance).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retard
                  </label>
                  <Badge variant="danger">
                    {calculateDaysLate(selectedCreance.dateEcheance)} jour(s)
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant dû
                  </label>
                  <p className="text-lg font-semibold text-red-600">
                    {selectedCreance.montantTTC.toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              {selectedCreance.id && (
                <button 
                  onClick={() => {
                    setShowDetailModal(false);
                    prepareRelanceMessage(selectedCreance);
                  }}
                  disabled={actionLoading}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer une relance
                </button>
              )}
              <a
                href={`tel:${selectedCreance.client.telephone}`}
                className="btn-primary"
              >
                <Phone className="w-4 h-4 mr-2" />
                Appeler le client
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal relance */}
      <Modal
        isOpen={showRelanceModal}
        onClose={() => setShowRelanceModal(false)}
        title="Envoyer une relance"
        size="lg"
      >
        {selectedCreance && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">
                Relance pour la facture {selectedCreance.numero}
              </h3>
              <p className="text-sm text-yellow-700">
                Client: {selectedCreance.client.entreprise || `${selectedCreance.client.prenom} ${selectedCreance.client.nom}`}
              </p>
              <p className="text-sm text-yellow-700">
                Montant: {selectedCreance.montantTTC.toLocaleString('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                })}
              </p>
              <p className="text-sm text-yellow-700">
                Retard: {calculateDaysLate(selectedCreance.dateEcheance)} jour(s)
              </p>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message de relance
              </label>
              <textarea
                id="message"
                rows={6}
                className="input-field"
                value={relanceMessage}
                onChange={(e) => setRelanceMessage(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRelanceModal(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={() => selectedCreance.id && handleSendReminder(selectedCreance.id)}
                disabled={!relanceMessage.trim() || actionLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Envoyer la relance
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CreancesListPage;