import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Download,
  Edit,
  Trash2
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { OperationCaisse } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import axios from 'axios';

const CaissePage: React.FC = () => {
  const [operations, setOperations] = useState<OperationCaisse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('tous');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<OperationCaisse | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [solde, setSolde] = useState({ total: 0, entrees: 0, sorties: 0 });
  const { hasPermission } = usePermissions();

  const [formData, setFormData] = useState({
    type: 'entree' as 'entree' | 'sortie',
    montant: '',
    description: '',
    categorie: '',
    reference: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = [
    'Vente de voyage',
    'Commission',
    'Remboursement client',
    'Frais bancaires',
    'Loyer',
    'Salaires',
    'Marketing',
    'Fournitures',
    'Transport',
    'Autre'
  ];

  useEffect(() => {
    fetchOperations();
    fetchSolde();
  }, []);

  const fetchOperations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/caisse/operations');
      
      if (response.data.success) {
        setOperations(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to load operations');
      }
    } catch (error) {
      console.error('Error loading operations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSolde = async () => {
    try {
      const response = await axios.get('/api/caisse/solde');
      
      if (response.data.success) {
        setSolde({
          total: response.data.data.solde,
          entrees: response.data.data.entrees,
          sorties: response.data.data.sorties
        });
      } else {
        throw new Error(response.data.message || 'Failed to load balance');
      }
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const handleAddOperation = async () => {
    if (!formData.montant || !formData.description || !formData.categorie) return;

    try {
      const response = await axios.post('/api/caisse/operations', {
        type: formData.type,
        montant: parseFloat(formData.montant),
        description: formData.description,
        categorie: formData.categorie,
        reference: formData.reference,
        date: formData.date
      });
      
      if (response.data.success) {
        // Add the new operation to the list
        setOperations(prev => [response.data.data, ...prev]);
        
        // Update the balance
        fetchSolde();
        
        // Close the modal and reset form
        setShowAddModal(false);
        resetForm();
      } else {
        throw new Error(response.data.message || 'Failed to add operation');
      }
    } catch (error) {
      console.error('Error adding operation:', error);
      alert('Une erreur est survenue lors de l\'ajout');
    }
  };

  const handleEditOperation = async () => {
    if (!selectedOperation || !formData.montant || !formData.description || !formData.categorie) return;

    try {
      const response = await axios.put(`/api/caisse/operations/${selectedOperation.id}`, {
        type: formData.type,
        montant: parseFloat(formData.montant),
        description: formData.description,
        categorie: formData.categorie,
        reference: formData.reference,
        date: formData.date
      });
      
      if (response.data.success) {
        // Update the operation in the list
        setOperations(prev => prev.map(op => 
          op.id === selectedOperation.id ? response.data.data : op
        ));
        
        // Update the balance
        fetchSolde();
        
        // Close the modal and reset
        setShowEditModal(false);
        setSelectedOperation(null);
        resetForm();
      } else {
        throw new Error(response.data.message || 'Failed to update operation');
      }
    } catch (error) {
      console.error('Error updating operation:', error);
      alert('Une erreur est survenue lors de la modification');
    }
  };

  const handleDeleteOperation = async () => {
    if (!selectedOperation) return;

    try {
      const response = await axios.delete(`/api/caisse/operations/${selectedOperation.id}`);
      
      if (response.data.success) {
        // Remove the operation from the list
        setOperations(prev => prev.filter(op => op.id !== selectedOperation.id));
        
        // Update the balance
        fetchSolde();
        
        // Close the modal and reset
        setShowDeleteModal(false);
        setSelectedOperation(null);
      } else {
        throw new Error(response.data.message || 'Failed to delete operation');
      }
    } catch (error) {
      console.error('Error deleting operation:', error);
      alert('Une erreur est survenue lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'entree',
      montant: '',
      description: '',
      categorie: '',
      reference: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const openEditModal = (operation: OperationCaisse) => {
    setSelectedOperation(operation);
    setFormData({
      type: operation.type,
      montant: operation.montant.toString(),
      description: operation.description,
      categorie: operation.categorie,
      reference: operation.reference || '',
      date: new Date(operation.date).toISOString().split('T')[0]
    });
    setShowEditModal(true);
  };

  const filteredOperations = operations.filter(operation => {
    const matchesSearch = operation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         operation.categorie.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (operation.reference && operation.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'tous' || operation.type === typeFilter;
    return matchesSearch && matchesType;
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion de Caisse</h1>
          <p className="text-gray-600">Suivi des entrées et sorties d'argent</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
          {hasPermission('caisse', 'creer') && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Opération
            </button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Entrées</p>
              <p className="text-2xl font-bold text-green-600">
                {solde.entrees.toLocaleString('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sorties</p>
              <p className="text-2xl font-bold text-red-600">
                {solde.sorties.toLocaleString('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${solde.total >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <Wallet className={`w-6 h-6 ${solde.total >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Solde</p>
              <p className={`text-2xl font-bold ${solde.total >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {solde.total.toLocaleString('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Opérations</p>
              <p className="text-2xl font-bold text-gray-900">{operations.length}</p>
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
                placeholder="Rechercher une opération..."
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="tous">Tous les types</option>
              <option value="entree">Entrées</option>
              <option value="sortie">Sorties</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des opérations */}
      <div className="card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Description</TableHeaderCell>
              <TableHeaderCell>Catégorie</TableHeaderCell>
              <TableHeaderCell>Référence</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Montant</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOperations.map((operation) => (
              <TableRow key={operation.id}>
                <TableCell>
                  <div className="flex items-center">
                    {operation.type === 'entree' ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 mr-2" />
                    )}
                    <Badge variant={operation.type === 'entree' ? 'success' : 'danger'}>
                      {operation.type === 'entree' ? 'Entrée' : 'Sortie'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-gray-900">{operation.description}</p>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">{operation.categorie}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500">{operation.reference || '-'}</span>
                </TableCell>
                <TableCell>
                  {new Date(operation.date).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${
                    operation.type === 'entree' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {operation.type === 'sortie' ? '-' : '+'}
                    {operation.montant.toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {hasPermission('caisse', 'modifier') && (
                      <button
                        onClick={() => openEditModal(operation)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {hasPermission('caisse', 'supprimer') && (
                      <button
                        onClick={() => {
                          setSelectedOperation(operation);
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

        {filteredOperations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune opération trouvée</p>
          </div>
        )}
      </div>

      {/* Modal ajout opération */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Nouvelle opération de caisse"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'opération *
              </label>
              <select
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'entree' | 'sortie' }))}
              >
                <option value="entree">Entrée d'argent</option>
                <option value="sortie">Sortie d'argent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant * (€)
              </label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                value={formData.montant}
                onChange={(e) => setFormData(prev => ({ ...prev, montant: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              className="input-field"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description de l'opération"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                className="input-field"
                value={formData.categorie}
                onChange={(e) => setFormData(prev => ({ ...prev, categorie: e.target.value }))}
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Référence
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Numéro de facture, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              className="input-field"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              onClick={handleAddOperation}
              disabled={!formData.montant || !formData.description || !formData.categorie}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter l'opération
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal modification opération */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOperation(null);
          resetForm();
        }}
        title="Modifier l'opération"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'opération *
              </label>
              <select
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'entree' | 'sortie' }))}
              >
                <option value="entree">Entrée d'argent</option>
                <option value="sortie">Sortie d'argent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant * (€)
              </label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                value={formData.montant}
                onChange={(e) => setFormData(prev => ({ ...prev, montant: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              className="input-field"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description de l'opération"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                className="input-field"
                value={formData.categorie}
                onChange={(e) => setFormData(prev => ({ ...prev, categorie: e.target.value }))}
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Référence
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Numéro de facture, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              className="input-field"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedOperation(null);
                resetForm();
              }}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              onClick={handleEditOperation}
              disabled={!formData.montant || !formData.description || !formData.categorie}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Modifier l'opération
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal suppression */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedOperation(null);
        }}
        title="Confirmer la suppression"
      >
        {selectedOperation && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer cette opération ?
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{selectedOperation.description}</p>
              <p className="text-sm text-gray-600">
                {selectedOperation.type === 'entree' ? '+' : '-'}
                {selectedOperation.montant.toLocaleString('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                })}
              </p>
            </div>
            <p className="text-sm text-red-600">
              Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteOperation}
                className="btn-danger"
              >
                Supprimer
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedOperation(null);
                }}
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

export default CaissePage;