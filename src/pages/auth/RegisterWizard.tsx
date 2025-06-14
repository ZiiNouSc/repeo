import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  FileText, 
  Upload, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface RegistrationData {
  // Étape 1: Infos générales
  nomAgence: string;
  typeActivite: string;
  siret: string;
  
  // Étape 2: Coordonnées
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  telephone: string;
  email: string;
  siteWeb: string;
  
  // Étape 3: Infos facturation
  raisonSociale: string;
  numeroTVA: string;
  banque: string;
  rib: string;
  swift: string;
  
  // Étape 4: Logo
  logo: File | null;
  
  // Étape 5: Modules
  modulesChoisis: string[];
}

const RegisterWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>({
    nomAgence: '',
    typeActivite: '',
    siret: '',
    adresse: '',
    ville: '',
    codePostal: '',
    pays: 'France',
    telephone: '',
    email: '',
    siteWeb: '',
    raisonSociale: '',
    numeroTVA: '',
    banque: '',
    rib: '',
    swift: '',
    logo: null,
    modulesChoisis: []
  });

  const availableModules = [
    { id: 'clients', name: 'Gestion Clients', description: 'Gérer votre base de clients', essential: true },
    { id: 'fournisseurs', name: 'Gestion Fournisseurs', description: 'Gérer vos partenaires', essential: true },
    { id: 'factures', name: 'Facturation', description: 'Créer et gérer vos factures', essential: true },
    { id: 'bons-commande', name: 'Bons de Commande', description: 'Gérer vos commandes', essential: false },
    { id: 'caisse', name: 'Gestion de Caisse', description: 'Suivi des entrées/sorties', essential: true },
    { id: 'creances', name: 'Suivi des Créances', description: 'Gérer les impayés', essential: false },
    { id: 'packages', name: 'Création de Packages', description: 'Créer vos offres voyage', essential: false },
    { id: 'billets', name: 'Billets d\'Avion', description: 'Gérer les réservations', essential: false },
    { id: 'vitrine', name: 'Vitrine Publique', description: 'Site web automatique', essential: false },
    { id: 'situation', name: 'Situation Financière', description: 'Tableaux de bord', essential: false }
  ];

  const steps = [
    { number: 1, title: 'Informations générales', icon: Building2 },
    { number: 2, title: 'Coordonnées', icon: MapPin },
    { number: 3, title: 'Facturation', icon: FileText },
    { number: 4, title: 'Logo', icon: Upload },
    { number: 5, title: 'Modules', icon: Settings }
  ];

  const handleInputChange = (field: keyof RegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleModuleToggle = (moduleId: string) => {
    setFormData(prev => ({
      ...prev,
      modulesChoisis: prev.modulesChoisis.includes(moduleId)
        ? prev.modulesChoisis.filter(id => id !== moduleId)
        : [...prev.modulesChoisis, moduleId]
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleInputChange('logo', file);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.nomAgence && formData.typeActivite && formData.siret);
      case 2:
        return !!(formData.adresse && formData.ville && formData.codePostal && 
                 formData.telephone && formData.email);
      case 3:
        return !!(formData.raisonSociale && formData.numeroTVA);
      case 4:
        return true; // Logo optionnel
      case 5:
        return formData.modulesChoisis.length > 0;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    
    setLoading(true);
    try {
      // Simulation d'envoi des données
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Données d\'inscription:', formData);
      navigate('/auth/pending-approval');
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'agence *
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.nomAgence}
                onChange={(e) => handleInputChange('nomAgence', e.target.value)}
                placeholder="Ex: Voyages Évasion"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'activité *
              </label>
              <select
                className="input-field"
                value={formData.typeActivite}
                onChange={(e) => handleInputChange('typeActivite', e.target.value)}
              >
                <option value="">Sélectionnez votre activité</option>
                <option value="agence-voyage">Agence de voyage</option>
                <option value="tour-operateur">Tour opérateur</option>
                <option value="receptif">Réceptif</option>
                <option value="transport">Transport touristique</option>
                <option value="hebergement">Hébergement</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro SIRET *
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.siret}
                onChange={(e) => handleInputChange('siret', e.target.value)}
                placeholder="12345678901234"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.adresse}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                placeholder="123 Rue de la Paix"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.ville}
                  onChange={(e) => handleInputChange('ville', e.target.value)}
                  placeholder="Paris"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal *
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.codePostal}
                  onChange={(e) => handleInputChange('codePostal', e.target.value)}
                  placeholder="75001"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays *
              </label>
              <select
                className="input-field"
                value={formData.pays}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  className="input-field"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@votre-agence.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site web (optionnel)
              </label>
              <input
                type="url"
                className="input-field"
                value={formData.siteWeb}
                onChange={(e) => handleInputChange('siteWeb', e.target.value)}
                placeholder="https://www.votre-agence.com"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison sociale *
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.raisonSociale}
                onChange={(e) => handleInputChange('raisonSociale', e.target.value)}
                placeholder="Voyages Évasion SARL"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de TVA *
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.numeroTVA}
                onChange={(e) => handleInputChange('numeroTVA', e.target.value)}
                placeholder="FR12345678901"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banque
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.banque}
                onChange={(e) => handleInputChange('banque', e.target.value)}
                placeholder="Crédit Agricole"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RIB / IBAN
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.rib}
                onChange={(e) => handleInputChange('rib', e.target.value)}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code SWIFT (optionnel)
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.swift}
                onChange={(e) => handleInputChange('swift', e.target.value)}
                placeholder="AGRIFRPP"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                {formData.logo ? (
                  <div className="space-y-4">
                    <img
                      src={URL.createObjectURL(formData.logo)}
                      alt="Logo preview"
                      className="mx-auto h-24 w-auto"
                    />
                    <p className="text-sm text-gray-600">{formData.logo.name}</p>
                    <button
                      type="button"
                      onClick={() => handleInputChange('logo', null)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                          Cliquez pour télécharger
                        </span>
                        <span className="text-gray-600"> ou glissez-déposez</span>
                      </label>
                      <input
                        id="logo-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, SVG jusqu'à 2MB
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Conseil :</strong> Votre logo apparaîtra sur vos factures et votre vitrine publique. 
                Utilisez un format carré ou rectangulaire avec un fond transparent pour un meilleur rendu.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Choisissez vos modules
              </h3>
              <p className="text-gray-600">
                Sélectionnez les fonctionnalités dont vous avez besoin. 
                Vous pourrez demander l'activation d'autres modules plus tard.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableModules.map((module) => (
                <div
                  key={module.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.modulesChoisis.includes(module.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleModuleToggle(module.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{module.name}</h4>
                        {module.essential && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Essentiel
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      formData.modulesChoisis.includes(module.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.modulesChoisis.includes(module.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note :</strong> Les modules sélectionnés seront soumis à validation. 
                Certains modules peuvent nécessiter une approbation manuelle par notre équipe.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">ST</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Inscription SamTech</h1>
          <p className="text-gray-600 mt-2">Créez votre compte agence en quelques étapes</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive 
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="ml-3 hidden md:block">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      Étape {step.number}
                    </p>
                    <p className={`text-xs ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`hidden md:block w-16 h-0.5 ml-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {steps[currentStep - 1].title}
            </h2>
          </div>

          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!validateStep(5) || loading}
                className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Finaliser l'inscription
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterWizard;