import axios from 'axios';

// Configuration axios
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('samtech_user');
  if (user) {
    const userData = JSON.parse(user);
    config.headers.Authorization = `Bearer ${userData.token}`;
  }
  return config;
});

// API Agences
export const agencesAPI = {
  getAll: () => api.get('/agences'),
  getById: (id: string) => api.get(`/agences/${id}`),
  approve: (id: string) => api.put(`/agences/${id}/approve`),
  reject: (id: string) => api.put(`/agences/${id}/reject`),
  suspend: (id: string) => api.put(`/agences/${id}/suspend`),
  updateModules: (id: string, modules: string[]) => 
    api.put(`/agences/${id}/modules`, { modules }),
};

// API Clients
export const clientsAPI = {
  getAll: () => api.get('/clients'),
  getById: (id: string) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

// API Fournisseurs
export const fournisseursAPI = {
  getAll: () => api.get('/fournisseurs'),
  getById: (id: string) => api.get(`/fournisseurs/${id}`),
  create: (data: any) => api.post('/fournisseurs', data),
  update: (id: string, data: any) => api.put(`/fournisseurs/${id}`, data),
  delete: (id: string) => api.delete(`/fournisseurs/${id}`),
};

// API Bons de commande
export const bonCommandeAPI = {
  getAll: () => api.get('/bons-commande'),
  getById: (id: string) => api.get(`/bons-commande/${id}`),
  create: (data: any) => api.post('/bons-commande', data),
  update: (id: string, data: any) => api.put(`/bons-commande/${id}`, data),
  delete: (id: string) => api.delete(`/bons-commande/${id}`),
  convertToInvoice: (id: string) => api.post(`/bons-commande/${id}/convert`),
};

// API Factures
export const facturesAPI = {
  getAll: () => api.get('/factures'),
  getById: (id: string) => api.get(`/factures/${id}`),
  create: (data: any) => api.post('/factures', data),
  update: (id: string, data: any) => api.put(`/factures/${id}`, data),
  delete: (id: string) => api.delete(`/factures/${id}`),
  generatePDF: (id: string) => api.get(`/factures/${id}/pdf`, { responseType: 'blob' }),
  markAsPaid: (id: string) => api.put(`/factures/${id}/pay`),
};

// API Caisse
export const caisseAPI = {
  getOperations: () => api.get('/caisse/operations'),
  getSolde: () => api.get('/caisse/solde'),
  addOperation: (data: any) => api.post('/caisse/operations', data),
  updateOperation: (id: string, data: any) => api.put(`/caisse/operations/${id}`, data),
  deleteOperation: (id: string) => api.delete(`/caisse/operations/${id}`),
};

// API Packages
export const packagesAPI = {
  getAll: () => api.get('/packages'),
  getPublic: () => api.get('/packages/public'),
  getById: (id: string) => api.get(`/packages/${id}`),
  create: (data: any) => api.post('/packages', data),
  update: (id: string, data: any) => api.put(`/packages/${id}`, data),
  delete: (id: string) => api.delete(`/packages/${id}`),
  toggleVisibility: (id: string) => api.put(`/packages/${id}/toggle-visibility`),
};

// API Billets d'avion
export const billetsAPI = {
  getAll: () => api.get('/billets'),
  getById: (id: string) => api.get(`/billets/${id}`),
  create: (data: any) => api.post('/billets', data),
  update: (id: string, data: any) => api.put(`/billets/${id}`, data),
  delete: (id: string) => api.delete(`/billets/${id}`),
  importFromGmail: () => api.post('/billets/import-gmail'),
};

// API Agents
export const agentsAPI = {
  getAll: () => api.get('/agents'),
  getById: (id: string) => api.get(`/agents/${id}`),
  create: (data: any) => api.post('/agents', data),
  update: (id: string, data: any) => api.put(`/agents/${id}`, data),
  delete: (id: string) => api.delete(`/agents/${id}`),
  updatePermissions: (id: string, permissions: any[]) => 
    api.put(`/agents/${id}/permissions`, { permissions }),
};

// API Tickets
export const ticketsAPI = {
  getAll: () => api.get('/tickets'),
  getById: (id: string) => api.get(`/tickets/${id}`),
  create: (data: any) => api.post('/tickets', data),
  update: (id: string, data: any) => api.put(`/tickets/${id}`, data),
  updateStatus: (id: string, status: string) => 
    api.put(`/tickets/${id}/status`, { status }),
};

// API Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getSuperadminStats: () => api.get('/dashboard/superadmin/stats'),
  getAgenceStats: () => api.get('/dashboard/agence/stats'),
};

export default api;