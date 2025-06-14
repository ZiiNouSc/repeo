import React, { useState, useEffect } from 'react';
import { Users, Receipt, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AgentDashboard: React.FC = () => {
  const { hasPermission, getAccessibleModules } = usePermissions();
  const [stats, setStats] = useState({
    clientsTraites: 0,
    facturesCreees: 0,
    operationsSemaine: 0
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const accessibleModules = getAccessibleModules();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          clientsTraites: 12,
          facturesCreees: 8,
          operationsSemaine: 15
        });

        setRecentTasks([
          {
            id: '1',
            type: 'client',
            description: 'Mise à jour fiche client - Martin Dubois',
            date: '2024-01-15T14:30:00Z'
          },
          {
            id: '2',
            type: 'facture',
            description: 'Facture #2024-015 créée',
            date: '2024-01-15T11:20:00Z'
          },
          {
            id: '3',
            type: 'commande',
            description: 'Bon de commande #BC-045 traité',
            date: '2024-01-14T16:45:00Z'
          }
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const availableStatCards = [
    {
      title: 'Clients Traités',
      value: stats.clientsTraites,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      module: 'clients'
    },
    {
      title: 'Factures Créées',
      value: stats.facturesCreees,
      icon: Receipt,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      module: 'factures'
    },
    {
      title: 'Opérations/Semaine',
      value: stats.operationsSemaine,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      module: 'caisse'
    }
  ];

  const visibleStatCards = availableStatCards.filter(card => 
    accessibleModules.includes(card.module)
  );

  const quickActions = [
    {
      title: 'Nouveau Client',
      description: 'Ajouter un client',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/clients/nouveau',
      module: 'clients',
      permission: 'creer'
    },
    {
      title: 'Nouvelle Facture',
      description: 'Créer une facture',
      icon: Receipt,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/factures/nouvelle',
      module: 'factures',
      permission: 'creer'
    }
  ];

  const visibleActions = quickActions.filter(action => 
    hasPermission(action.module, action.permission)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Tableau de Bord</h1>
        <p className="text-gray-600">Vue d'ensemble de mon activité</p>
      </div>

      {/* Statistiques */}
      {visibleStatCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleStatCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tâches récentes */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activités Récentes</h2>
          
          <div className="space-y-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  task.type === 'client' ? 'bg-blue-100' :
                  task.type === 'facture' ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  {task.type === 'client' && <Users className="w-4 h-4 text-blue-600" />}
                  {task.type === 'facture' && <Receipt className="w-4 h-4 text-green-600" />}
                  {task.type === 'commande' && <Calendar className="w-4 h-4 text-orange-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{task.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(task.date).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
          {visibleActions.length > 0 ? (
            <div className="space-y-3">
              {visibleActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.link}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <Icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Aucune action rapide disponible avec vos permissions actuelles.
            </p>
          )}
        </div>
      </div>

      {/* Modules accessibles */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Modules Accessibles</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {accessibleModules.map((module) => (
            <Link
              key={module}
              to={`/${module}`}
              className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-center"
            >
              <p className="text-sm font-medium text-gray-900 capitalize">
                {module.replace('-', ' ')}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;