import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye,
  Edit,
  Trash2,
  Globe,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Package } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';

const PackagesListPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setPackages([
          {
            id: '1',
            nom: 'Séjour Paris Romantique',
            description: 'Un week-end romantique à Paris avec hébergement 4 étoiles et dîner aux chandelles',
            prix: 450.00,
            duree: '3 jours / 2 nuits',
            inclusions: [
              'Hébergement 4 étoiles',
              'Petit-déjeuner',
              'Dîner romantique',
              'Visite guidée de Montmartre',
              'Croisière sur la Seine'
            ],
            visible: true,
            dateCreation: '2024-01-15'
          },
          {
            id: '2',
            nom: 'Circuit Châteaux de la Loire',
            description: 'Découverte des plus beaux châteaux de la Loire en 5 jours',
            prix: 890.00,
            duree: '5 jours / 4 nuits',
            inclusions: [
              'Transport en autocar',
              'Hébergement 3 étoiles',
              'Demi-pension',
              'Visites guidées des châteaux',
              'Guide accompagnateur'
            ],
            visible: true,
            dateCreation: '2024-01-12'
          },
          {
            id: '3',
            nom: 'Escapade Côte d\'Azur',
            description: 'Séjour détente sur la Côte d\'Azur avec activités nautiques',
            prix: 650.00,
            duree: '4 jours / 3 nuits',
            inclusions: [
              'Hébergement vue mer',
              'Petit-déjeuner',
              'Activités nautiques',
              'Excursion à Monaco',
              'Dégustation de vins'
            ],
            visible: false,
            dateCreation: '2024-01-10'
          }
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleToggleVisibility = async (packageId: string) => {
    try {
      setPackages(prev => prev.map(pkg => 
        pkg.id === packageId 
          ? { ...pkg, visible: !pkg.visible }
          : pkg
      ));
    } catch (error) {
      console.error('Erreur lors du changement de visibilité:', error);
    }
  };

  const handleDelete = async (packageId: string) => {
    try {
      setPackages(prev => prev.filter(pkg => pkg.id !== packageId));
      setShowDeleteModal(false);
      setSelectedPackage(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pkg.nom.toLowerCase().includes(searchLower) ||
      pkg.description.toLowerCase().includes(searchLower)
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Packages</h1>
          <p className="text-gray-600">Créer et gérer vos offres de voyage</p>
        </div>
        {hasPermission('packages', 'creer') && (
          <Link to="/packages/nouveau" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Package
          </Link>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total packages</p>
              <p className="text-2xl font-bold text-gray-900">{packages.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Packages visibles</p>
              <p className="text-2xl font-bold text-gray-900">
                {packages.filter(pkg => pkg.visible).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <EyeOff className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Packages masqués</p>
              <p className="text-2xl font-bold text-gray-900">
                {packages.filter(pkg => !pkg.visible).length}
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
                placeholder="Rechercher un package..."
                className="w-full pl-10 input-field"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des packages */}
      <div className="card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Package</TableHeaderCell>
              <TableHeaderCell>Prix</TableHeaderCell>
              <TableHeaderCell>Durée</TableHeaderCell>
              <TableHeaderCell>Visibilité</TableHeaderCell>
              <TableHeaderCell>Date création</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPackages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{pkg.nom}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{pkg.description}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-gray-900">
                    {pkg.prix.toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">{pkg.duree}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={pkg.visible ? 'success' : 'default'}>
                    {pkg.visible ? 'Visible' : 'Masqué'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(pkg.dateCreation).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowDetailModal(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {hasPermission('packages', 'modifier') && (
                      <Link
                        to={`/packages/${pkg.id}/modifier`}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}

                    <button
                      onClick={() => handleToggleVisibility(pkg.id)}
                      className={`p-1 rounded ${
                        pkg.visible 
                          ? 'text-orange-600 hover:bg-orange-100' 
                          : 'text-green-600 hover:bg-green-100'
                      }`}
                      title={pkg.visible ? 'Masquer' : 'Rendre visible'}
                    >
                      {pkg.visible ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    </button>

                    {hasPermission('packages', 'supprimer') && (
                      <button
                        onClick={() => {
                          setSelectedPackage(pkg);
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

        {filteredPackages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun package trouvé</p>
          </div>
        )}
      </div>

      {/* Modal détails package */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails du package"
        size="lg"
      >
        {selectedPackage && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du package
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{selectedPackage.nom}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-900">{selectedPackage.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visibilité
                  </label>
                  <Badge variant={selectedPackage.visible ? 'success' : 'default'}>
                    {selectedPackage.visible ? 'Visible sur la vitrine' : 'Masqué'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix
                  </label>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedPackage.prix.toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée
                  </label>
                  <p className="text-sm text-gray-900">{selectedPackage.duree}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de création
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedPackage.dateCreation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Inclusions
              </label>
              <ul className="space-y-2">
                {selectedPackage.inclusions.map((inclusion, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-900">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    {inclusion}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleToggleVisibility(selectedPackage.id)}
                className={selectedPackage.visible ? 'btn-secondary' : 'btn-primary'}
              >
                {selectedPackage.visible ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Masquer
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Rendre visible
                  </>
                )}
              </button>
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
        {selectedPackage && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer le package{' '}
              <strong>{selectedPackage.nom}</strong> ?
            </p>
            <p className="text-sm text-red-600">
              Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(selectedPackage.id)}
                className="btn-danger"
              >
                Supprimer
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

export default PackagesListPage;