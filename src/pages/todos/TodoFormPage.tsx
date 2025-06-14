import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Calendar, User, Bell, CheckSquare } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

interface TodoFormData {
  titre: string;
  description: string;
  clientId: string;
  clientNom: string;
  dateEcheance: string;
  priorite: 'faible' | 'normale' | 'haute' | 'urgente';
  type: 'rappel' | 'tache' | 'suivi';
  assigneA: string;
  notificationEmail: boolean;
  notificationSMS: boolean;
  recurrence: 'aucune' | 'quotidienne' | 'hebdomadaire' | 'mensuelle';
}

const TodoFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<TodoFormData>({
    titre: '',
    description: '',
    clientId: '',
    clientNom: '',
    dateEcheance: '',
    priorite: 'normale',
    type: 'tache',
    assigneA: '',
    notificationEmail: true,
    notificationSMS: false,
    recurrence: 'aucune'
  });

  useEffect(() => {
    fetchClients();
    if (user?.role === 'agence') {
      fetchAgents();
    }
    if (isEditing && id) {
      fetchTodo();
    }
  }, [isEditing, id, user]);

  const fetchClients = async () => {
    try {
      // Mock data - à remplacer par un vrai appel API
      setClients([
        { id: '1', nom: 'Dubois', prenom: 'Martin', entreprise: '' },
        { id: '2', nom: 'Entreprise ABC', prenom: '', entreprise: 'ABC Solutions' },
        { id: '3', nom: 'Martin', prenom: 'Sophie', entreprise: '' }
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      // Mock data - à remplacer par un vrai appel API
      setAgents([
        { id: '1', nom: 'Martin', prenom: 'Sophie' },
        { id: '2', nom: 'Dubois', prenom: 'Jean' },
        { id: '3', nom: 'Leroy', prenom: 'Marie' }
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des agents:', error);
    }
  };

  const fetchTodo = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data pour l'édition
      setFormData({
        titre: 'Rappeler Martin Dubois',
        description: 'Confirmer les dates de voyage pour le package Rome',
        clientId: '1',
        clientNom: 'Martin Dubois',
        dateEcheance: '2024-01-20T10:00',
        priorite: 'haute',
        type: 'rappel',
        assigneA: 'Sophie Martin',
        notificationEmail: true,
        notificationSMS: false,
        recurrence: 'aucune'
      });
    } catch (error) {
      console.error('Erreur lors du chargement de la tâche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Tâche sauvegardée:', formData);
      navigate('/todos');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof TodoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientId,
        clientNom: client.entreprise || `${client.prenom} ${client.nom}`
      }));
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
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/todos')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Modifier les informations de la tâche' : 'Créer une nouvelle tâche ou rappel'}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informations générales
          </h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                type="text"
                id="titre"
                value={formData.titre}
                onChange={(e) => handleChange('titre', e.target.value)}
                required
                className="input-field"
                placeholder="Titre de la tâche ou du rappel"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="input-field"
                placeholder="Description détaillée de la tâche"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="input-field"
                >
                  <option value="tache">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Tâche
                  </option>
                  <option value="rappel">
                    <Bell className="w-4 h-4 mr-2" />
                    Rappel
                  </option>
                  <option value="suivi">
                    <User className="w-4 h-4 mr-2" />
                    Suivi client
                  </option>
                </select>
              </div>

              <div>
                <label htmlFor="priorite" className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité *
                </label>
                <select
                  id="priorite"
                  value={formData.priorite}
                  onChange={(e) => handleChange('priorite', e.target.value)}
                  className="input-field"
                >
                  <option value="faible">Faible</option>
                  <option value="normale">Normale</option>
                  <option value="haute">Haute</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Planification
          </h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="dateEcheance" className="block text-sm font-medium text-gray-700 mb-1">
                Date et heure d'échéance *
              </label>
              <input
                type="datetime-local"
                id="dateEcheance"
                value={formData.dateEcheance}
                onChange={(e) => handleChange('dateEcheance', e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700 mb-1">
                Récurrence
              </label>
              <select
                id="recurrence"
                value={formData.recurrence}
                onChange={(e) => handleChange('recurrence', e.target.value)}
                className="input-field"
              >
                <option value="aucune">Aucune</option>
                <option value="quotidienne">Quotidienne</option>
                <option value="hebdomadaire">Hebdomadaire</option>
                <option value="mensuelle">Mensuelle</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Attribution et client
          </h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                Client concerné
              </label>
              <select
                id="clientId"
                value={formData.clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="input-field"
              >
                <option value="">Aucun client spécifique</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.entreprise || `${client.prenom} ${client.nom}`}
                  </option>
                ))}
              </select>
            </div>

            {user?.role === 'agence' && (
              <div>
                <label htmlFor="assigneA" className="block text-sm font-medium text-gray-700 mb-1">
                  Assigné à
                </label>
                <select
                  id="assigneA"
                  value={formData.assigneA}
                  onChange={(e) => handleChange('assigneA', e.target.value)}
                  className="input-field"
                >
                  <option value="">Moi-même</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={`${agent.prenom} ${agent.nom}`}>
                      {agent.prenom} {agent.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Notifications
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notificationEmail"
                checked={formData.notificationEmail}
                onChange={(e) => handleChange('notificationEmail', e.target.checked)}
                className="mr-3"
              />
              <label htmlFor="notificationEmail" className="text-sm font-medium text-gray-700">
                Notification par email
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notificationSMS"
                checked={formData.notificationSMS}
                onChange={(e) => handleChange('notificationSMS', e.target.checked)}
                className="mr-3"
              />
              <label htmlFor="notificationSMS" className="text-sm font-medium text-gray-700">
                Notification par SMS
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/todos')}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving || !formData.titre || !formData.dateEcheance}
            className="btn-primary flex items-center"
          >
            {saving ? (
              <LoadingSpinner size="sm" className="mr-2" />
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

export default TodoFormPage;