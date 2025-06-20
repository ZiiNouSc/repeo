import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Fournisseur } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import { fournisseursAPI } from '../../services/api';

const FournisseursListPage: React.FC = () => {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFournisseur, setSelectedFournisseur] = useState<Fournisseur | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const fetchFournisseurs = async () => {
    try {
      setLoading(true);
      const response = await fournisseursAPI.getAll();
      setFournisseurs(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fournisseurId: string) => {
    if (!fournisseurId) {
      console.error('Fournisseur ID is undefined');
      return;
    }
    
    try {
      setActionLoading(true);
      await fournisseursAPI.delete(fournisseurId);
      setFournisseurs(prev => prev.filter(f => f.id !== fournisseurId));
      setShowDeleteModal(false);
      setSelectedFournisseur(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression: ' + (error.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredFournisseurs = fournisseurs.filter(fournisseur => {
    const searchLower = searchTerm.toLowerCase();
    return (
      fournisseur.nom.toLowerCase().includes(searchLower) ||
      fournisseur.entreprise.toLowerCase().includes(searchLower) ||
      fournisseur.email.toLowerCase().includes(searchLower)
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Fournisseurs</h1>
          <p className="text-gray-600">Gérer vos partenaires et fournisseurs</p>
        </div>
        {hasPermission('fournisseurs', 'creer') && (
          <Link to="/fournisseurs/nouveau" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Fournisseur
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
                placeholder="Rechercher un fournisseur..."
                className="w-full pl-10 input-field"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des fournisseurs */}
      <div className="card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Fournisseur</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Solde</TableHeaderCell>
              <TableHeaderCell>Date création</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFournisseurs.map((fournisseur) => (
              <TableRow key={fournisseur.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{fournisseur.nom}</p>
                      <p className="text-sm text-gray-500">{fournisseur.entreprise}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {fournisseur.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {fournisseur.telephone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      fournisseur.solde > 0 ? 'success' :
                      fournisseur.solde < 0 ? 'danger' : 'default'
                    }
                  >
                    {fournisseur.solde.toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    })}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(fournisseur.dateCreation).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedFournisseur(fournisseur);
                        setShowDetailModal(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {hasPermission('fournisseurs', 'modifier') && fournisseur.id && (
                      <Link
                        to={`/fournisseurs/${fournisseur.id}/modifier`}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}

                    {hasPermission('fournisseurs', 'supprimer') && fournisseur.id && (
                      <button
                        onClick={() => {
                          setSelectedFournisseur(fournisseur);
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

        {filteredFournisseurs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun fournisseur trouvé</p>
          </div>
        )}
      </div>

      {/* Modal détails fournisseur */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails du fournisseur"
        size="lg"
      >
        {selectedFournisseur && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <p className="text-sm text-gray-900">{selectedFournisseur.nom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entreprise
                </label>
                <p className="text-sm text-gray-900">{selectedFournisseur.entreprise}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-sm text-gray-900">{selectedFournisseur.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <p className="text-sm text-gray-900">{selectedFournisseur.telephone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Solde
                </label>
                <Badge 
                  variant={
                    selectedFournisseur.solde > 0 ? 'success' :
                    selectedFournisseur.solde < 0 ? 'danger' : 'default'
                  }
                >
                  {selectedFournisseur.solde.toLocaleString('fr-FR', { 
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
              <p className="text-sm text-gray-900">{selectedFournisseur.adresse}</p>
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
        {selectedFournisseur && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer le fournisseur{' '}
              <strong>{selectedFournisseur.nom}</strong> ?
            </p>
            <p className="text-sm text-red-600">
              Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => selectedFournisseur.id && handleDelete(selectedFournisseur.id)}
                disabled={actionLoading}
                className="btn-danger"
              >
                {actionLoading ? <LoadingSpinner size="sm" className="mr-2" /> : 'Supprimer'}
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

export default FournisseursListPage;