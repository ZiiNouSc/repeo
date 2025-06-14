import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SuperadminDashboard from './SuperadminDashboard';
import AgenceDashboard from './AgenceDashboard';
import AgentDashboard from './AgentDashboard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import axios from 'axios';

const DashboardPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [dashboardLoading, setDashboardLoading] = useState(false);

  useEffect(() => {
    // Preload dashboard data if needed
    if (user && !isLoading) {
      setDashboardLoading(true);
      
      // Different endpoints based on user role
      const endpoint = user.role === 'superadmin' 
        ? '/api/dashboard/superadmin/stats'
        : '/api/dashboard/agence/stats';
      
      axios.get(endpoint)
        .then(response => {
          // Data will be handled by the specific dashboard components
          console.log('Dashboard data preloaded');
        })
        .catch(error => {
          console.error('Error preloading dashboard data:', error);
        })
        .finally(() => {
          setDashboardLoading(false);
        });
    }
  }, [user, isLoading]);

  if (isLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Utilisateur non connecté</p>
      </div>
    );
  }

  switch (user.role) {
    case 'superadmin':
      return <SuperadminDashboard />;
    case 'agence':
      return <AgenceDashboard />;
    case 'agent':
      return <AgentDashboard />;
    default:
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Rôle utilisateur non reconnu</p>
        </div>
      );
  }
};

export default DashboardPage;