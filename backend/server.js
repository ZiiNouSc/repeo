const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');
const clientsRoutes = require('./routes/clients');
const fournisseursRoutes = require('./routes/fournisseurs');
const facturesRoutes = require('./routes/factures');
const bonsCommandeRoutes = require('./routes/bonsCommande');
const caisseRoutes = require('./routes/caisse');
const packagesRoutes = require('./routes/packages');
const billetsRoutes = require('./routes/billets');
const agencesRoutes = require('./routes/agences');
const agentsRoutes = require('./routes/agents');
const ticketsRoutes = require('./routes/tickets');
const todosRoutes = require('./routes/todos');
const documentsRoutes = require('./routes/documents');
const dashboardRoutes = require('./routes/dashboard');
const creancesRoutes = require('./routes/creances');
const reservationsRoutes = require('./routes/reservations');
const profileRoutes = require('./routes/profile');
const parametresRoutes = require('./routes/parametres');
const vitrineRoutes = require('./routes/vitrine');
const rapportsRoutes = require('./routes/rapports');
const notificationsRoutes = require('./routes/notifications');
const calendrierRoutes = require('./routes/calendrier');
const logsRoutes = require('./routes/logs');
const permissionsRoutes = require('./routes/permissions');
const auditRoutes = require('./routes/audit');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/fournisseurs', fournisseursRoutes);
app.use('/api/factures', facturesRoutes);
app.use('/api/bons-commande', bonsCommandeRoutes);
app.use('/api/caisse', caisseRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/billets', billetsRoutes);
app.use('/api/agences', agencesRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/todos', todosRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/creances', creancesRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/parametres', parametresRoutes);
app.use('/api/vitrine', vitrineRoutes);
app.use('/api/rapports', rapportsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/calendrier', calendrierRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/audit', auditRoutes);

// Placeholder for PDF generation
app.get('/api/factures/:id/pdf', (req, res) => {
  // In a real app, this would generate a PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="facture-${req.params.id}.pdf"`);
  
  // Send a placeholder PDF (just some text)
  res.send('This is a placeholder for a PDF file');
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});