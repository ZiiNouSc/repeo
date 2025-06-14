import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Settings, 
  Bell, 
  Shield, 
  Database,
  Mail,
  Smartphone,
  Globe,
  CreditCard,
  Users,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';

interface ParametresData {
  // Paramètres généraux
  nomAgence: string;
  fuseau: string;
  langue: string;
  devise: string;
  
  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  notificationFactures: boolean;
  notificationPaiements: boolean;
  notificationRappels: boolean;
  
  // Sécurité
  authentificationDouble: boolean;
  sessionTimeout: number;
  tentativesConnexion: number;
  
  // Facturation
  numeroFactureAuto: boolean;
  prefixeFacture: string;
  tvaDefaut: number;
  conditionsPaiement: string;
  
  // Sauvegarde
  sauvegardeAuto: boolean;
  frequenceSauvegarde: string;
  derniereSauvegarde: string;
  
  // API et intégrations
  apiKey: string;
  webhookUrl: string;
  integrationComptable: boolean;
}

const ParametresPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ParametresData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchParametres();
  }, []);

  const fetchParametres = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - à remplacer par un vrai appel API
      setData({
        nomAgence: 'Voyages Express',
        fuseau: 'Europe/Paris',
        langue: 'fr',
        devise: 'EUR',
        
        emailNotifications: true,
        smsNotifications: false,
        notificationFactures: true,
        notificationPaiements: true,
        notificationRappels: true,
        
        authentificationDouble: false,
        sessionTimeout: 30,
        tentativesConnexion: 5,
        
        numeroFactureAuto: true,
        prefixeFacture: 'FAC',
        tvaDefaut: 20,
        conditionsPaiement: '30 jours',
        
        sauvegardeAuto: true,
        frequenceSauvegarde: 'quotidienne',
        derniereSauvegarde: '2024-01-15T02:00:00Z',
        
        apiKey: 'sk_live_xxxxxxxxxxxxxxxxxxxxxxxx',
        webhookUrl: 'https://votre-agence.com/webhook',
        integrationComptable: false
      });
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data) return;
    
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Paramètres sauvegardés:', data);
      // Afficher un message de succès
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ParametresData, value: any) => {
    setData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleBackup = async () => {
    try {
      console.log('Sauvegarde manuelle déclenchée');
      // Simuler une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 3000));
      setData(prev => prev ? { 
        ...prev, 
        derniereSauvegarde: new Date().toISOString() 
      } : null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const generateApiKey = () => {
    const newKey = 'sk_live_' + Math.random().toString(36).substring(2, 28);
    handleInputChange('apiKey', newKey);
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'billing', label: 'Facturation', icon: CreditCard },
    { id: 'backup', label: 'Sauvegarde', icon: Database },
    { id: 'api', label: 'API & Intégrations', icon: Globe }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erreur lors du chargement des paramètres</p>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'agence
              </label>
              <input
                type="text"
                className="input-field"
                value={data.nomAgence}
                onChange={(e) => handleInputChange('nomAgence', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuseau horaire
                </label>
                <select
                  className="input-field"
                  value={data.fuseau}
                  onChange={(e) => handleInputChange('fuseau', e.target.value)}
                >
                  <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                  <option value="Europe/London">Europe/London (GMT+0)</option>
                  <option value="America/New_York">America/New_York (GMT-5)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Langue
                </label>
                <select
                  className="input-field"
                  value={data.langue}
                  onChange={(e) => handleInputChange('langue', e.target.value)}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Devise par défaut
              </label>
              <select
                className="input-field w-auto"
                value={data.devise}
                onChange={(e) => handleInputChange('devise', e.target.value)}
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CHF">CHF</option>
              </select>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Canaux de notification</h3>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Notifications par email</p>
                    <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={data.emailNotifications}
                  onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                  className="toggle"
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <Smartphone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Notifications SMS</p>
                    <p className="text-sm text-gray-500">Recevoir les notifications par SMS</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={data.smsNotifications}
                  onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                  className="toggle"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Types de notifications</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Nouvelles factures</span>
                  <input
                    type="checkbox"
                    checked={data.notificationFactures}
                    onChange={(e) => handleInputChange('notificationFactures', e.target.checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Paiements reçus</span>
                  <input
                    type="checkbox"
                    checked={data.notificationPaiements}
                    onChange={(e) => handleInputChange('notificationPaiements', e.target.checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Rappels d'échéance</span>
                  <input
                    type="checkbox"
                    checked={data.notificationRappels}
                    onChange={(e) => handleInputChange('notificationRappels', e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Authentification à deux facteurs</p>
                <p className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire</p>
              </div>
              <input
                type="checkbox"
                checked={data.authentificationDouble}
                onChange={(e) => handleInputChange('authentificationDouble', e.target.checked)}
                className="toggle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout de session (minutes)
              </label>
              <select
                className="input-field w-auto"
                value={data.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 heure</option>
                <option value={120}>2 heures</option>
                <option value={480}>8 heures</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre maximum de tentatives de connexion
              </label>
              <select
                className="input-field w-auto"
                value={data.tentativesConnexion}
                onChange={(e) => handleInputChange('tentativesConnexion', parseInt(e.target.value))}
              >
                <option value={3}>3 tentatives</option>
                <option value={5}>5 tentatives</option>
                <option value={10}>10 tentatives</option>
              </select>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Numérotation automatique des factures</p>
                <p className="text-sm text-gray-500">Générer automatiquement les numéros de facture</p>
              </div>
              <input
                type="checkbox"
                checked={data.numeroFactureAuto}
                onChange={(e) => handleInputChange('numeroFactureAuto', e.target.checked)}
                className="toggle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Préfixe des factures
              </label>
              <input
                type="text"
                className="input-field w-auto"
                value={data.prefixeFacture}
                onChange={(e) => handleInputChange('prefixeFacture', e.target.value)}
                placeholder="FAC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taux de TVA par défaut (%)
              </label>
              <input
                type="number"
                className="input-field w-auto"
                value={data.tvaDefaut}
                onChange={(e) => handleInputChange('tvaDefaut', parseFloat(e.target.value))}
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conditions de paiement par défaut
              </label>
              <select
                className="input-field"
                value={data.conditionsPaiement}
                onChange={(e) => handleInputChange('conditionsPaiement', e.target.value)}
              >
                <option value="Comptant">Comptant</option>
                <option value="15 jours">15 jours</option>
                <option value="30 jours">30 jours</option>
                <option value="45 jours">45 jours</option>
                <option value="60 jours">60 jours</option>
              </select>
            </div>
          </div>
        );

      case 'backup':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Sauvegarde automatique</p>
                <p className="text-sm text-gray-500">Sauvegarder automatiquement vos données</p>
              </div>
              <input
                type="checkbox"
                checked={data.sauvegardeAuto}
                onChange={(e) => handleInputChange('sauvegardeAuto', e.target.checked)}
                className="toggle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fréquence de sauvegarde
              </label>
              <select
                className="input-field"
                value={data.frequenceSauvegarde}
                onChange={(e) => handleInputChange('frequenceSauvegarde', e.target.value)}
                disabled={!data.sauvegardeAuto}
              >
                <option value="quotidienne">Quotidienne</option>
                <option value="hebdomadaire">Hebdomadaire</option>
                <option value="mensuelle">Mensuelle</option>
              </select>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900">Dernière sauvegarde</p>
                  <p className="text-sm text-gray-600">
                    {new Date(data.derniereSauvegarde).toLocaleString('fr-FR')}
                  </p>
                </div>
                <Badge variant="success">Réussie</Badge>
              </div>
              
              <button
                onClick={handleBackup}
                className="btn-secondary"
              >
                <Database className="w-4 h-4 mr-2" />
                Sauvegarder maintenant
              </button>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clé API
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  className="input-field flex-1 font-mono"
                  value={data.apiKey}
                  readOnly
                />
                <button
                  onClick={generateApiKey}
                  className="btn-secondary"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Régénérer
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Utilisez cette clé pour accéder à l'API SamTech
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Webhook
              </label>
              <input
                type="url"
                className="input-field"
                value={data.webhookUrl}
                onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                placeholder="https://votre-site.com/webhook"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL pour recevoir les notifications d'événements
              </p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Intégration comptable</p>
                <p className="text-sm text-gray-500">Synchroniser avec votre logiciel comptable</p>
              </div>
              <input
                type="checkbox"
                checked={data.integrationComptable}
                onChange={(e) => handleInputChange('integrationComptable', e.target.checked)}
                className="toggle"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Documentation API</h4>
              <p className="text-sm text-blue-700 mb-3">
                Consultez notre documentation pour intégrer l'API SamTech dans vos applications.
              </p>
              <a
                href="/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Voir la documentation →
              </a>
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
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Configuration de votre agence</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center"
        >
          {saving ? (
            <LoadingSpinner size="sm\" className="mr-2" />
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

export default ParametresPage;