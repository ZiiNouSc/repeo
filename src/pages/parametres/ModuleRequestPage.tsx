import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Plus, 
  CheckSquare,
  Package,
  FileText,
  Users,
  CreditCard,
  Wallet,
  Plane,
  Calendar,
  MessageSquare,
  FolderOpen,
  Clock,
  Store,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import axios from 'axios';

interface ModuleRequest {
  id: string;
  modules: string[];
  message: string;
  statut: 'en_attente' | 'approuve' | 'rejete';
  dateCreation: string;
  dateTraitement?: string;
  commentaireAdmin?: string;
}

const ModuleRequestPage: React.FC = () => {
  const { user, currentAgence } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ModuleRequest[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableModules = [
    { id: 'clients', name: 'Clients', description: 'Gestion des clients', icon: Users },
    { id: 'fournisseurs', name: 'Fournisseurs', description: 'Gestion des fournisseurs', icon: Users },
    { id: 'factures', name: 'Factures', description: 'Facturation', icon: FileText },
    { id: 'bons-commande', name: 'Bons de commande', description: 'Gestion des commandes', icon: FileText },
    { id: 'caisse', name: 'Caisse', description: 'Gestion de caisse', icon: Wallet },
    { id: 'creances', name: 'Créances', description: 'Suivi des impayés', icon: CreditCard },
    { id: 'packages', name: 'Packages', description: 'Création de packages', icon: Package },
    { id: 'billets', name: 'Billets d\'avion', description: 'Gestion des billets', icon: Plane },
    { id: 'vitrine', name: 'Vitrine', description: 'Vitrine publique', icon: Store },
    { id: 'documents', name: 'Documents', description: 'Gestion des documents', icon: FolderOpen },
    { id: 'todos', name: 'Tâches', description: 'Gestion des tâches', icon: CheckSquare },
    { id: 'calendrier', name: 'Calendrier', description: 'Gestion du calendrier', icon: Calendar },
    { id: 'crm', name: 'CRM', description: 'Gestion des contacts', icon: MessageSquare },
    { id: 'reservations', name: 'Réservations', description: 'Gestion des réservations', icon: Clock }
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/module-requests/agency');
      
      if (response.data.success) {
        setRequests(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to load module requests');
      }
    } catch (error) {
      console.error('Error loading module requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedModules.length === 0 || !message.trim()) {
      alert('Veuillez sélectionner au moins un module et saisir un message');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await axios.post('/api/module-requests', {
        modules: selectedModules,
        message
      });
      
      if (response.data.success) {
        alert('Demande de modules envoyée avec succès');
        setSelectedModules([]);
        setMessage('');
        fetchRequests();
      } else {
        throw new Error(response.data.message || 'Failed to submit module request');
      }
    } catch (error) {
      console.error('Error submitting module request:', error);
      alert('Une erreur est survenue lors de l\'envoi de la demande');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'approuve':
        return <Badge variant="success">Approuvée</Badge>;
      case 'rejete':
        return <Badge variant="danger">Rejetée</Badge>;
      default:
        return <Badge variant="warning">En attente</Badge>;
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demande de Modules</h1>
          <p className="text-gray-600">Demandez l'activation de nouveaux modules pour votre agence</p>
        </div>
      </div>

      {/* Current modules */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Modules actuellement actifs</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {currentAgence?.modulesActifs && currentAgence.modulesActifs.length > 0 ? (
            currentAgence.modulesActifs.map(moduleId => {
              const module = availableModules.find(m => m.id === moduleId);
              if (!module) return null;
              
              const Icon = module.icon;
              return (
                <div key={moduleId} className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-blue-800">{module.name}</span>
                </div>
              );
            })
          ) : (
            <p className="col-span-full text-gray-500">Aucun module actif pour le moment</p>
          )}
        </div>
      </Card>

      {/* New request form */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Demander de nouveaux modules</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sélectionnez les modules souhaités
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableModules.map(module => {
                // Skip modules that are already active
                if (currentAgence?.modulesActifs?.includes(module.id)) {
                  return null;
                }
                
                const Icon = module.icon;
                const isSelected = selectedModules.includes(module.id);
                
                return (
                  <div
                    key={module.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleModuleToggle(module.id)}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {module.name}
                      </p>
                      <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                        {module.description}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message pour l'administrateur
            </label>
            <textarea
              id="message"
              rows={4}
              className="input-field"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Expliquez pourquoi vous avez besoin de ces modules et comment vous comptez les utiliser..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={selectedModules.length === 0 || !message.trim() || submitting}
              className="btn-primary flex items-center"
            >
              {submitting ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Envoyer la demande
            </button>
          </div>
        </div>
      </Card>

      {/* Previous requests */}
      {requests.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique des demandes</h2>
          
          <div className="space-y-4">
            {requests.map(request => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="mr-3">
                      {getStatusBadge(request.statut)}
                    </div>
                    <p className="font-medium text-gray-900">
                      Demande du {new Date(request.dateCreation).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {request.dateTraitement && (
                    <p className="text-sm text-gray-500">
                      Traitée le {new Date(request.dateTraitement).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
                
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Modules demandés:</p>
                  <div className="flex flex-wrap gap-2">
                    {request.modules.map(moduleId => {
                      const module = availableModules.find(m => m.id === moduleId);
                      return (
                        <Badge key={moduleId} variant="info">
                          {module ? module.name : moduleId}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Votre message:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{request.message}</p>
                </div>
                
                {request.commentaireAdmin && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Réponse de l'administrateur:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{request.commentaireAdmin}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ModuleRequestPage;