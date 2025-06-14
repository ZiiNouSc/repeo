import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Client } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ClientFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    entreprise: '',
    email: '',
    telephone: '',
    adresse: ''
  });

  useEffect(() => {
    if (isEditing && id) {
      const fetchClient = async () => {
        setLoading(true);
        try {
          // Simulation - remplacer par un vrai appel API
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock data pour l'édition
          setFormData({
            nom: 'Dubois',
            prenom: 'Martin',
            entreprise: '',
            email: 'martin.dubois@email.com',
            telephone: '+33 1 23 45 67 89',
            adresse: '123 Rue de la Paix, 75001 Paris'
          });
        } catch (error) {
          console.error('Erreur lors du chargement du client:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchClient();
    }
  }, [isEditing, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Client sauvegardé:', formData);
      navigate('/clients');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Modifier le client' : 'Nouveau client'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Modifier les informations du client' : 'Ajouter un nouveau client'}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informations générales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="entreprise" className="block text-sm font-medium text-gray-700 mb-1">
                Entreprise (optionnel)
              </label>
              <input
                type="text"
                id="entreprise"
                name="entreprise"
                value={formData.entreprise}
                onChange={handleChange}
                className="input-field"
                placeholder="Nom de l'entreprise"
              />
            </div>
            
            <div></div>
            
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Nom du client"
              />
            </div>
            
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="input-field"
                placeholder="Prénom du client"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informations de contact
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="email@exemple.com"
              />
            </div>
            
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="+33 1 23 45 67 89"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse *
            </label>
            <textarea
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              required
              rows={3}
              className="input-field"
              placeholder="Adresse complète du client"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center"
          >
            {saving ? (
              <LoadingSpinner size="sm\" className="mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isEditing ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientFormPage;