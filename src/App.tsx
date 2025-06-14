import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterWizard from './pages/auth/RegisterWizard';
import PendingApprovalPage from './pages/auth/PendingApprovalPage';
import DashboardPage from './pages/dashboard';
import AgencesListPage from './pages/agences/AgencesListPage';
import ClientsListPageEnhanced from './pages/clients/ClientsListPageEnhanced';
import ClientFormPage from './pages/clients/ClientFormPage';
import ClientDetailPage from './pages/clients/ClientDetailPage';
import FournisseursListPage from './pages/fournisseurs/FournisseursListPage';
import FacturesListPage from './pages/factures/FacturesListPage';
import BonsCommandeListPage from './pages/bons-commande/BonsCommandeListPage';
import CreancesListPage from './pages/creances/CreancesListPage';
import CaissePage from './pages/caisse/CaissePage';
import PackagesListPage from './pages/packages/PackagesListPage';
import BilletsListPage from './pages/billets/BilletsListPage';
import TicketsListPage from './pages/tickets/TicketsListPage';
import ReservationsListPage from './pages/reservations/ReservationsListPage';
import CrmPage from './pages/crm/CrmPage';
import DocumentsPage from './pages/documents/DocumentsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import RapportsPage from './pages/rapports/RapportsPage';
import AuditPage from './pages/audit/AuditPage';
import CalendrierPage from './pages/calendrier/CalendrierPage';
import PermissionsPage from './pages/permissions/PermissionsPage';
import ProfilePage from './pages/profile/ProfilePage';
import TodosPage from './pages/todos/TodosPage';
import TodoFormPage from './pages/todos/TodoFormPage';
import LogsPage from './pages/logs/LogsPage';
import SituationPage from './pages/situation/SituationPage';
import VitrinePage from './pages/vitrine/VitrinePage';
import AgentsPage from './pages/agents/AgentsPage';
import ParametresPage from './pages/parametres/ParametresPage';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Composant pour protéger les routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Vérifier si l'agence est en attente d'approbation
  if (user.role === 'agence' && user.statut === 'en_attente') {
    return <PendingApprovalPage />;
  }

  return <>{children}</>;
};

// Routes principales de l'application
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterWizard />} />
      <Route path="/auth/pending-approval" element={<PendingApprovalPage />} />
      
      {/* Routes protégées */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="agences" element={<AgencesListPage />} />
        <Route path="clients" element={<ClientsListPageEnhanced />} />
        <Route path="clients/nouveau" element={<ClientFormPage />} />
        <Route path="clients/:id" element={<ClientDetailPage />} />
        <Route path="clients/:id/modifier" element={<ClientFormPage />} />
        <Route path="fournisseurs" element={<FournisseursListPage />} />
        <Route path="factures" element={<FacturesListPage />} />
        <Route path="bons-commande" element={<BonsCommandeListPage />} />
        <Route path="creances" element={<CreancesListPage />} />
        <Route path="caisse" element={<CaissePage />} />
        <Route path="packages" element={<PackagesListPage />} />
        <Route path="billets" element={<BilletsListPage />} />
        <Route path="tickets" element={<TicketsListPage />} />
        <Route path="reservations" element={<ReservationsListPage />} />
        <Route path="crm" element={<CrmPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="rapports" element={<RapportsPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="calendrier" element={<CalendrierPage />} />
        <Route path="permissions" element={<PermissionsPage />} />
        <Route path="todos" element={<TodosPage />} />
        <Route path="todos/nouveau" element={<TodoFormPage />} />
        <Route path="todos/:id/modifier" element={<TodoFormPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="situation" element={<SituationPage />} />
        <Route path="vitrine" element={<VitrinePage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="parametres" element={<ParametresPage />} />
      </Route>
      
      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;