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

const CreancesListPage: React.FC = () => {
  const [creances, setCreances] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCreance, setSelectedCreance] = useState<Facture | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRelanceModal, setShowRelanceModal] = useState(false);

  useEffect(() => {
    const fetchCreances = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simuler des factures impayées
        setCreances([
          {
            id: '1',
            numero: 'FAC-2024-001',
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
            dateEmission: '2024-01-15',
            dateEcheance: '2024-01-25',
            statut: 'en_retard',
            montantHT: 1000.00,
            montantTTC: 1200.00,
            articles: []
          },
          {
            id: '2',
            numero: 'FAC-2024-005',
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
            dateEmission: '2024-01-05',
            dateEcheance: '2024-01-20',
            statut: 'en_retard',
            montantHT: 2500.00,
            montantTTC: 3000.00,
            articles: []
          }
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des créances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreances();
  }, []);

  const calculateDaysLate = (dateEcheance: string) => {
    const today = new Date();
    const echeance = new Date(dateEcheance);
    const diffTime = today.getTime() - echeance.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleSendReminder = async (creanceId: string) => {
    try {
      console.log('Relance envoyée pour la créance:', creanceId);
      setShowRelanceModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la relance:', error);
    }
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
              <p className="text-2xl font-bold text-gray-900">{creances.length}</p>
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
                {Math.round(creances.reduce((sum, c) => sum + calculateDaysLate(c.dateEcheance), 0) / creances.length || 0)} jours
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
                {(totalCreances / creances.length || 0).toLocaleString('fr-FR', { 
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
                      
                      <button
                        onClick={() => {
                          setSelectedCreance(creance);
                          setShowRelanceModal(true);
                        }}
                        className="p-1 text-orange-600 hover:bg-orange-100 rounded"
                        title="Envoyer une relance"
                      >
                        <Mail className="w-4 h-4" />
                      </button>

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
              <button 
                onClick={() => {
                  setShowDetailModal(false);
                  setShowRelanceModal(true);
                }}
                className="btn-secondary"
              >
                <Mail className="w-4 h-4 mr-2" />
                Envoyer une relance
              </button>
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
                defaultValue={`Madame, Monsieur,

Nous vous rappelons que la facture ${selectedCreance.numero} d'un montant de ${selectedCreance.montantTTC.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} est échue depuis le ${new Date(selectedCreance.dateEcheance).toLocaleDateString('fr-FR')}.

Nous vous remercions de bien vouloir procéder au règlement dans les plus brefs délais.

Cordialement,
L'équipe SamTech`}
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
                onClick={() => handleSendReminder(selectedCreance.id)}
                className="btn-primary"
              >
                <Mail className="w-4 h-4 mr-2" />
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