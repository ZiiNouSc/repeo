import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface FinancialData {
  chiffreAffaires: {
    moisActuel: number;
    moisPrecedent: number;
    evolution: number;
  };
  benefices: {
    moisActuel: number;
    moisPrecedent: number;
    evolution: number;
  };
  depenses: {
    moisActuel: number;
    moisPrecedent: number;
    evolution: number;
  };
  creances: {
    total: number;
    enRetard: number;
  };
  ventesParMois: Array<{
    mois: string;
    montant: number;
  }>;
  topClients: Array<{
    nom: string;
    montant: number;
    pourcentage: number;
  }>;
  repartitionVentes: Array<{
    categorie: string;
    montant: number;
    pourcentage: number;
  }>;
}

const SituationPage: React.FC = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('mois');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchFinancialData();
  }, [selectedPeriod, selectedYear]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - à remplacer par un vrai appel API
      setData({
        chiffreAffaires: {
          moisActuel: 45230,
          moisPrecedent: 38950,
          evolution: 16.1
        },
        benefices: {
          moisActuel: 12450,
          moisPrecedent: 10200,
          evolution: 22.1
        },
        depenses: {
          moisActuel: 32780,
          moisPrecedent: 28750,
          evolution: 14.0
        },
        creances: {
          total: 8950,
          enRetard: 3200
        },
        ventesParMois: [
          { mois: 'Jan', montant: 32000 },
          { mois: 'Fév', montant: 28500 },
          { mois: 'Mar', montant: 35200 },
          { mois: 'Avr', montant: 41800 },
          { mois: 'Mai', montant: 38950 },
          { mois: 'Juin', montant: 45230 }
        ],
        topClients: [
          { nom: 'Entreprise ABC', montant: 12500, pourcentage: 27.6 },
          { nom: 'Martin Dubois', montant: 8900, pourcentage: 19.7 },
          { nom: 'Sophie Martin', montant: 6750, pourcentage: 14.9 },
          { nom: 'Jean Dupont', montant: 5200, pourcentage: 11.5 },
          { nom: 'Autres', montant: 11880, pourcentage: 26.3 }
        ],
        repartitionVentes: [
          { categorie: 'Packages voyage', montant: 18500, pourcentage: 40.9 },
          { categorie: 'Billets d\'avion', montant: 12800, pourcentage: 28.3 },
          { categorie: 'Hébergement', montant: 8900, pourcentage: 19.7 },
          { categorie: 'Transport', montant: 3200, pourcentage: 7.1 },
          { categorie: 'Autres', montant: 1830, pourcentage: 4.0 }
        ]
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données financières:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Simuler l'export des données
    console.log('Export des données financières');
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    });
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

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
        <p className="text-gray-500">Erreur lors du chargement des données</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Situation Financière</h1>
          <p className="text-gray-600">Tableaux de bord et analyses financières</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="input-field w-auto"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="mois">Par mois</option>
              <option value="trimestre">Par trimestre</option>
              <option value="annee">Par année</option>
            </select>
            <select
              className="input-field w-auto"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
            </select>
          </div>
          <button 
            onClick={fetchFinancialData}
            className="btn-secondary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
          <button 
            onClick={handleExport}
            className="btn-primary"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.chiffreAffaires.moisActuel)}
              </p>
              <div className="flex items-center mt-2">
                {data.chiffreAffaires.evolution >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  data.chiffreAffaires.evolution >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(data.chiffreAffaires.evolution)}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bénéfices</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.benefices.moisActuel)}
              </p>
              <div className="flex items-center mt-2">
                {data.benefices.evolution >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  data.benefices.evolution >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(data.benefices.evolution)}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dépenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.depenses.moisActuel)}
              </p>
              <div className="flex items-center mt-2">
                {data.depenses.evolution >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  data.depenses.evolution >= 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatPercentage(data.depenses.evolution)}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Créances</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.creances.total)}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-red-600 font-medium">
                  {formatCurrency(data.creances.enRetard)}
                </span>
                <span className="text-sm text-gray-500 ml-1">en retard</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des ventes */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Évolution des Ventes</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {data.ventesParMois.map((item, index) => {
              const maxValue = Math.max(...data.ventesParMois.map(v => v.montant));
              const percentage = (item.montant / maxValue) * 100;
              
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-600">
                    {item.mois}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(item.montant)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top clients */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Top Clients</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {data.topClients.map((client, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-yellow-500' :
                    index === 3 ? 'bg-purple-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm font-medium text-gray-900">
                    {client.nom}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(client.montant)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {client.pourcentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Répartition des ventes par catégorie */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Répartition des Ventes par Catégorie
        </h2>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Catégorie</TableHeaderCell>
              <TableHeaderCell>Montant</TableHeaderCell>
              <TableHeaderCell>Pourcentage</TableHeaderCell>
              <TableHeaderCell>Évolution</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.repartitionVentes.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-yellow-500' :
                      index === 3 ? 'bg-purple-500' : 'bg-gray-400'
                    }`} />
                    <span className="font-medium text-gray-900">
                      {item.categorie}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {formatCurrency(item.montant)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.pourcentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {item.pourcentage.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600 font-medium">
                      +{(Math.random() * 20).toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SituationPage;