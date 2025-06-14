import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Receipt, 
  Wallet, 
  TrendingUp, 
  Calendar,
  Euro,
  FileText,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { dashboardAPI } from '../../services/api';

const AgenceDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    facturesEnAttente: 0,
    chiffreAffaireMois: 0,
    soldeCaisse: 0,
    facturesImpayees: 0,
    bonCommandeEnCours: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getAgenceStats();
      const data = response.data.data;
      
      setStats({
        totalClients: data.totalClients,
        facturesEnAttente: data.facturesEnAttente,
        chiffreAffaireMois: data.chiffreAffaireMois,
        soldeCaisse: data.soldeCaisse,
        facturesImpayees: data.facturesImpayees || 0,
        bonCommandeEnCours: data.bonCommandeEnCours || 0
      });

      setRecentActivities(data.recentActivities || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/clients'
    },
    {
      title: 'Factures en Attente',
      value: stats.facturesEnAttente,
      icon: Receipt,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      link: '/factures'
    },
    {
      title: 'CA du Mois',
      value: `${stats.chiffreAffaireMois.toLocaleString()} €`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/situation'
    },
    {
      title: 'Solde Caisse',
      value: `${stats.soldeCaisse.toLocaleString()} €`,
      icon: Wallet,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/caisse'
    }
  ];

  const quickActions = [
    {
      title: 'Nouvelle Facture',
      description: 'Créer une facture client',
      icon: Receipt,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/factures/nouvelle'
    },
    {
      title: 'Nouveau Client',
      description: 'Ajouter un client',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/clients/nouveau'
    },
    {
      title: 'Opération Caisse',
      description: 'Enregistrer une opération',
      icon: Wallet,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/caisse/nouvelle-operation'
    },
    {
      title: 'Bon de Commande',
      description: 'Créer un bon de commande',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      link: '/bons-commande/nouveau'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Agence</h1>
        <p className="text-gray-600">Vue d'ensemble de votre activité</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} to={stat.link} className="card group hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activités récentes */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activités Récentes</h2>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'facture' ? 'bg-blue-100' :
                  activity.type === 'paiement' ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  {activity.type === 'facture' && <Receipt className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'paiement' && <Euro className="w-4 h-4 text-green-600" />}
                  {activity.type === 'commande' && <FileText className="w-4 h-4 text-orange-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleString('fr-FR')}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {activity.montant.toLocaleString()} €
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {recentActivities.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500">Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => {
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
        </div>
      </div>

      {/* Alertes et notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertes</h2>
          <div className="space-y-3">
            {stats.facturesImpayees > 0 && (
              <Link
                to="/creances"
                className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <CreditCard className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {stats.facturesImpayees} facture(s) impayée(s)
                  </p>
                  <p className="text-xs text-red-600">Nécessite votre attention</p>
                </div>
              </Link>
            )}
            {stats.bonCommandeEnCours > 0 && (
              <Link
                to="/bons-commande"
                className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <FileText className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {stats.bonCommandeEnCours} bon(s) de commande en cours
                  </p>
                  <p className="text-xs text-yellow-600">À convertir en factures</p>
                </div>
              </Link>
            )}
            
            {stats.facturesImpayees === 0 && stats.bonCommandeEnCours === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500">Aucune alerte</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Raccourcis</h2>
          <div className="space-y-2">
            <Link
              to="/vitrine"
              className="block text-blue-600 hover:text-blue-700 text-sm font-medium py-1"
            >
              → Gérer ma vitrine publique
            </Link>
            <Link
              to="/packages"
              className="block text-blue-600 hover:text-blue-700 text-sm font-medium py-1"
            >
              → Créer un nouveau package
            </Link>
            <Link
              to="/agents"
              className="block text-blue-600 hover:text-blue-700 text-sm font-medium py-1"
            >
              → Gérer mes agents
            </Link>
            <Link
              to="/parametres"
              className="block text-blue-600 hover:text-blue-700 text-sm font-medium py-1"
            >
              → Paramètres de l'agence
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgenceDashboard;