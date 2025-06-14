import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Ticket
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Agence, Ticket as TicketType } from '../../types';
import axios from 'axios';

const SuperadminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalAgences: 0,
    agencesApprouvees: 0,
    agencesEnAttente: 0,
    ticketsOuverts: 0
  });
  const [recentAgencies, setRecentAgencies] = useState<Agence[]>([]);
  const [recentTickets, setRecentTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/dashboard/superadmin/stats');
      
      if (response.data.success) {
        const data = response.data.data;
        setStats({
          totalAgences: data.totalAgences,
          agencesApprouvees: data.agencesApprouvees,
          agencesEnAttente: data.agencesEnAttente,
          ticketsOuverts: data.ticketsOuverts
        });
        setRecentAgencies(data.recentAgencies);
        setRecentTickets(data.recentTickets);
      } else {
        throw new Error(response.data.message || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
      title: 'Total Agences',
      value: stats.totalAgences,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Agences Approuvées',
      value: stats.agencesApprouvees,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'En Attente',
      value: stats.agencesEnAttente,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Tickets Ouverts',
      value: stats.ticketsOuverts,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Super Admin</h1>
        <p className="text-gray-600">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agences récentes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Agences Récentes</h2>
            <Link
              to="/agences"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Voir tout
            </Link>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Nom</TableHeaderCell>
                <TableHeaderCell>Statut</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAgencies.map((agence) => (
                <TableRow key={agence.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{agence.nom}</p>
                      <p className="text-sm text-gray-500">{agence.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        agence.statut === 'approuve' ? 'success' :
                        agence.statut === 'en_attente' ? 'warning' : 'danger'
                      }
                    >
                      {agence.statut === 'approuve' ? 'Approuvée' :
                       agence.statut === 'en_attente' ? 'En attente' : 'Rejetée'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(agence.dateInscription).toLocaleDateString('fr-FR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Tickets récents */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tickets Récents</h2>
            <Link
              to="/tickets"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Voir tout
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{ticket.sujet}</h3>
                    <p className="text-sm text-gray-600 mt-1">{ticket.agence.nom}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(ticket.dateCreation).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge 
                      variant={
                        ticket.priorite === 'urgente' ? 'danger' :
                        ticket.priorite === 'haute' ? 'warning' : 'default'
                      }
                    >
                      {ticket.priorite}
                    </Badge>
                    <Badge variant="info">
                      {ticket.statut}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/agences"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Building2 className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Gérer les Agences</h3>
              <p className="text-sm text-gray-600">Approuver et configurer</p>
            </div>
          </Link>
          
          <Link
            to="/tickets"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Ticket className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Support Tickets</h3>
              <p className="text-sm text-gray-600">Traiter les demandes</p>
            </div>
          </Link>
          
          <Link
            to="/parametres"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Paramètres</h3>
              <p className="text-sm text-gray-600">Configuration système</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperadminDashboard;