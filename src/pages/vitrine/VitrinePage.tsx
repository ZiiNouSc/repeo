import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Eye, 
  EyeOff, 
  Edit, 
  Save,
  Upload,
  Palette,
  Settings,
  Share2,
  ExternalLink
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import axios from 'axios';

interface VitrineConfig {
  isActive: boolean;
  domainName: string;
  title: string;
  description: string;
  logo: string;
  bannerImage: string;
  primaryColor: string;
  secondaryColor: string;
  showPackages: boolean;
  showContact: boolean;
  showAbout: boolean;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    hours: string;
  };
  aboutText: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

const VitrinePage: React.FC = () => {
  const [config, setConfig] = useState<VitrineConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchVitrineConfig();
  }, []);

  const fetchVitrineConfig = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/vitrine');
      
      if (response.data.success) {
        setConfig(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to load vitrine config');
      }
    } catch (error) {
      console.error('Error loading vitrine config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    
    setSaving(true);
    try {
      const response = await axios.put('/api/vitrine', config);
      
      if (response.data.success) {
        alert('Configuration de la vitrine sauvegardée avec succès');
      } else {
        throw new Error(response.data.message || 'Failed to save vitrine config');
      }
    } catch (error) {
      console.error('Error saving vitrine config:', error);
      alert('Une erreur est survenue lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!config) return;
    
    try {
      const response = await axios.put('/api/vitrine/toggle');
      
      if (response.data.success) {
        setConfig(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      } else {
        throw new Error(response.data.message || 'Failed to toggle vitrine status');
      }
    } catch (error) {
      console.error('Error toggling vitrine status:', error);
      alert('Une erreur est survenue lors du changement de statut');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setConfig(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleContactInfoChange = (field: string, value: string) => {
    setConfig(prev => prev ? {
      ...prev,
      contactInfo: { ...prev.contactInfo, [field]: value }
    } : null);
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setConfig(prev => prev ? {
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    } : null);
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'content', label: 'Contenu', icon: Edit },
    { id: 'contact', label: 'Contact', icon: Share2 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erreur lors du chargement de la configuration</p>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-medium text-blue-900">Statut de la vitrine</h3>
                <p className="text-sm text-blue-700">
                  {config.isActive ? 'Votre vitrine est en ligne' : 'Votre vitrine est hors ligne'}
                </p>
              </div>
              <button
                onClick={handleToggleActive}
                className={`btn-${config.isActive ? 'danger' : 'primary'}`}
              >
                {config.isActive ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Désactiver
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Activer
                  </>
                )}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de domaine
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  value={config.domainName}
                  onChange={(e) => handleInputChange('domainName', e.target.value)}
                />
                <a
                  href={`https://${config.domainName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du site
              </label>
              <input
                type="text"
                className="input-field"
                value={config.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={config.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showPackages"
                  checked={config.showPackages}
                  onChange={(e) => handleInputChange('showPackages', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showPackages" className="text-sm font-medium text-gray-700">
                  Afficher les packages
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showContact"
                  checked={config.showContact}
                  onChange={(e) => handleInputChange('showContact', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showContact" className="text-sm font-medium text-gray-700">
                  Afficher les contacts
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showAbout"
                  checked={config.showAbout}
                  onChange={(e) => handleInputChange('showAbout', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showAbout" className="text-sm font-medium text-gray-700">
                  Afficher "À propos"
                </label>
              </div>
            </div>
          </div>
        );

      case 'design':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo
              </label>
              <div className="flex items-center space-x-4">
                <img
                  src={config.logo}
                  alt="Logo"
                  className="w-20 h-20 object-contain border rounded-lg"
                />
                <button className="btn-secondary">
                  <Upload className="w-4 h-4 mr-2" />
                  Changer le logo
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image de bannière
              </label>
              <div className="space-y-4">
                <img
                  src={config.bannerImage}
                  alt="Bannière"
                  className="w-full h-32 object-cover border rounded-lg"
                />
                <button className="btn-secondary">
                  <Upload className="w-4 h-4 mr-2" />
                  Changer la bannière
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur principale
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-12 h-10 border rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="input-field flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur secondaire
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 border rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="input-field flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Aperçu des couleurs</h4>
              <div className="flex space-x-4">
                <div 
                  className="w-16 h-16 rounded-lg border"
                  style={{ backgroundColor: config.primaryColor }}
                />
                <div 
                  className="w-16 h-16 rounded-lg border"
                  style={{ backgroundColor: config.secondaryColor }}
                />
              </div>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte "À propos"
              </label>
              <textarea
                className="input-field"
                rows={6}
                value={config.aboutText}
                onChange={(e) => handleInputChange('aboutText', e.target.value)}
                placeholder="Décrivez votre agence, votre histoire, vos valeurs..."
              />
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Réseaux sociaux</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    value={config.socialLinks.facebook}
                    onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                    placeholder="https://facebook.com/votre-page"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    value={config.socialLinks.instagram}
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    placeholder="https://instagram.com/votre-compte"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    value={config.socialLinks.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    placeholder="https://twitter.com/votre-compte"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                className="input-field"
                value={config.contactInfo.phone}
                onChange={(e) => handleContactInfoChange('phone', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="input-field"
                value={config.contactInfo.email}
                onChange={(e) => handleContactInfoChange('email', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={config.contactInfo.address}
                onChange={(e) => handleContactInfoChange('address', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horaires d'ouverture
              </label>
              <input
                type="text"
                className="input-field"
                value={config.contactInfo.hours}
                onChange={(e) => handleContactInfoChange('hours', e.target.value)}
                placeholder="Lun-Ven: 9h-18h, Sam: 9h-12h"
              />
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
          <h1 className="text-2xl font-bold text-gray-900">Vitrine Publique</h1>
          <p className="text-gray-600">Gérer votre site web public</p>
        </div>
        <div className="flex space-x-3">
          <Badge variant={config.isActive ? 'success' : 'default'}>
            {config.isActive ? 'En ligne' : 'Hors ligne'}
          </Badge>
          <button 
            onClick={() => setShowPreview(true)}
            className="btn-secondary"
          >
            <Eye className="w-4 h-4 mr-2" />
            Aperçu
          </button>
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

      {/* Modal aperçu */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Aperçu de la vitrine"
        size="2xl"
      >
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aperçu de votre vitrine
            </h3>
            <p className="text-gray-600 mb-4">
              Voici comment votre site apparaîtra à vos visiteurs
            </p>
            <div className="bg-white rounded-lg p-6 text-left shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <img src={config.logo} alt="Logo" className="h-12" />
                <div className="flex space-x-4">
                  <span className="text-sm text-gray-600">Accueil</span>
                  <span className="text-sm text-gray-600">Packages</span>
                  <span className="text-sm text-gray-600">Contact</span>
                </div>
              </div>
              <div 
                className="h-32 rounded-lg mb-4"
                style={{ backgroundColor: config.primaryColor }}
              />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {config.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {config.description}
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-100 h-20 rounded"></div>
                <div className="bg-gray-100 h-20 rounded"></div>
                <div className="bg-gray-100 h-20 rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <a
              href={`https://${config.domainName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir le site en direct
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VitrinePage;