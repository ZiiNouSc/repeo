import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Upload, 
  Building2, 
  MapPin, 
  Phone, 
  Mail,
  Globe,
  FileText,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface ProfileData {
  // Informations générales
  nomAgence: string;
  typeActivite: string;
  siret: string;
  logo: File | null;
  logoUrl: string;
  
  // Coordonnées
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  telephone: string;
  email: string;
  siteWeb: string;
  
  // Informations légales
  raisonSociale: string;
  numeroTVA: string;
  numeroLicence: string;
  garantieFinanciere: string;
  assuranceRC: string;
  
  // Informations bancaires
  banque: string;
  rib: string;
  swift: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const [profileData, setProfileData] = useState<ProfileData>({
    nomAgence: '',
    typeActivite: '',
    siret: '',
    logo: null,
    logoUrl: '',
    adresse: '',
    ville: '',
    codePostal: '',
    pays: 'France',
    telephone: '',
    email: '',
    siteWeb: '',
    raisonSociale: '',
    numeroTVA: '',
    numeroLicence: '',
    garantieFinanciere: '',
    assuranceRC: '',
    banque: '',
    rib: '',
    swift: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - à remplacer par un vrai appel API
        setProfileData({
          nomAgence: 'Voyages Express',
          typeActivite: 'agence-voyage',
          siret: '12345678901234',
          logo: null,
          logoUrl: '/api/placeholder/150/150',
          adresse: '123 Rue de la Paix',
          ville: 'Paris',
          codePostal: '75001',
          pays: 'France',
          telephone: '+33 1 23 45 67 89',
          email: user?.email || '',
          siteWeb: 'https://www.voyages-express.com',
          raisonSociale: 'Voyages Express SARL',
          numeroTVA: 'FR12345678901',
          numeroLicence: 'IM075110001',
          garantieFinanciere: 'APST - 15 Avenue Carnot, 75017 Paris',
          assuranceRC: 'AXA Assurances - Police n° 123456789',
          banque: 'Crédit Agricole',
          rib: 'FR76 1234 5678 9012 3456 7890 123',
          swift: 'AGRIFRPP'
        });
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleInputChange('logo', file);
      // Créer une URL temporaire pour l'aperçu
      const url = URL.createObjectURL(file);
      handleInputChange('logoUrl', url);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Profil sauvegardé:', profileData);
      // Afficher un message de succès
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Informations générales', icon: Building2 },
    { id: 'contact', label: 'Coordonnées', icon: MapPin },
    { id: 'legal', label: 'Informations légales', icon: FileText },
    { id: 'banking', label: 'Informations bancaires', icon: CreditCard }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Logo de l'agence
              </label>
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {profileData.logoUrl ? (
                    <img
                      src={profileData.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <label htmlFor="logo-upload" className="btn-secondary cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Changer le logo
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, SVG jusqu'à 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Nom de l'agence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'agence *
              </label>
              <input
                type="text"
                className="input-field"
                value={profileData.nomAgence}
                onChange={(e) => handleInputChange('nomAgence', e.target.value)}
              />
            </div>

            {/* Type d'activité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'activité *
              </label>
              <select
                className="input-field"
                value={profileData.typeActivite}
                onChange={(e) => handleInputChange('typeActivite', e.target.value)}
              >
                <option value="agence-voyage">Agence de voyage</option>
                <option value="tour-operateur">Tour opérateur</option>
                <option value="receptif">Réceptif</option>
                <option value="transport">Transport touristique</option>
                <option value="hebergement">Hébergement</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            {/* SIRET */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro SIRET *
              </label>
              <input
                type="text"
                className="input-field"
                value={profileData.siret}
                onChange={(e) => handleInputChange('siret', e.target.value)}
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                className="input-field"
                value={profileData.adresse}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
              />
            </div>

            {/* Ville et Code postal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={profileData.ville}
                  onChange={(e) => handleInputChange('ville', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal *
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={profileData.codePostal}
                  onChange={(e) => handleInputChange('codePostal', e.target.value)}
                />
              </div>
            </div>

            {/* Pays */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays *
              </label>
              <select
                className="input-field"
                value={profileData.pays}
                onChange={(e) => handleInputChange('pays', e.target.value)}
              >
                <option value="France">France</option>
                <option value="Belgique">Belgique</option>
                <option value="Suisse">Suisse</option>
                <option value="Canada">Canada</option>
                <option value="Maroc">Maroc</option>
                <option value="Tunisie">Tunisie</option>
                <option value="Algérie">Algérie</option>
              </select>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  className="input-field"
                  value={profileData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>

            {/* Site web */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site web
              </label>
              <input
                type="url"
                className="input-field"
                value={profileData.siteWeb}
                onChange={(e) => handleInputChange('siteWeb', e.target.value)}
                placeholder="https://www.votre-agence.com"
              />
            </div>
          </div>
        );

      case 'legal':
        return (
          <div className="space-y-6">
            {/* Raison sociale */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison sociale *
              </label>
              <input
                type="text"
                className="input-field"
                value={profileData.raisonSociale}
                onChange={(e) => handleInputChange('raisonSociale', e.target.value)}
              />
            </div>

            {/* Numéro de TVA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de TVA *
              </label>
              <input
                type="text"
                className="input-field"
                value={profileData.numeroTVA}
                onChange={(e) => handleInputChange('numeroTVA', e.target.value)}
              />
            </div>

            {/* Numéro de licence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de licence (Immatriculation)
              </label>
              <input
                type="text"
                className="input-field"
                value={profileData.numeroLicence}
                onChange={(e) => handleInputChange('numeroLicence', e.target.value)}
                placeholder="IM075110001"
              />
            </div>

            {/* Garantie financière */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Garantie financière
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={profileData.garantieFinanciere}
                onChange={(e) => handleInputChange('garantieFinanciere', e.target.value)}
                placeholder="Organisme de garantie et adresse"
              />
            </div>

            {/* Assurance RC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assurance Responsabilité Civile
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={profileData.assuranceRC}
                onChange={(e) => handleInputChange('assuranceRC', e.target.value)}
                placeholder="Compagnie d'assurance et numéro de police"
              />
            </div>
          </div>
        );

      case 'banking':
        return (
          <div className="space-y-6">
            {/* Banque */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banque
              </label>
              <input
                type="text"
                className="input-field"
                value={profileData.banque}
                onChange={(e) => handleInputChange('banque', e.target.value)}
                placeholder="Nom de votre banque"
              />
            </div>

            {/* RIB */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RIB / IBAN
              </label>
              <input
                type="text"
                className="input-field"
                value={profileData.rib}
                onChange={(e) => handleInputChange('rib', e.target.value)}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
              />
            </div>

            {/* SWIFT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code SWIFT / BIC
              </label>
              <input
                type="text"
                className="input-field"
                value={profileData.swift}
                onChange={(e) => handleInputChange('swift', e.target.value)}
                placeholder="AGRIFRPP"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Information :</strong> Ces informations bancaires apparaîtront sur vos factures 
                pour faciliter les paiements de vos clients.
              </p>
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil de l'Agence</h1>
          <p className="text-gray-600">Gérer les informations de votre agence</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center"
        >
          {saving ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Enregistrer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation des onglets */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu de l'onglet */}
        <div className="lg:col-span-3">
          <div className="card">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;