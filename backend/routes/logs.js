const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');

// Get all logs
router.get('/', protect, admin, (req, res) => {
  try {
    // In a real app, you would filter logs by user/agence
    const logs = [
      {
        id: '1',
        timestamp: '2024-01-15T14:30:00Z',
        level: 'info',
        action: 'LOGIN',
        description: 'Connexion utilisateur réussie',
        userId: '1',
        userName: 'Sophie Martin',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        details: { loginMethod: 'email', sessionId: 'sess_123456' }
      },
      {
        id: '2',
        timestamp: '2024-01-15T14:25:00Z',
        level: 'success',
        action: 'FACTURE_CREATED',
        description: 'Nouvelle facture créée: FAC-2024-001',
        userId: '2',
        userName: 'Jean Dubois',
        ipAddress: '192.168.1.101',
        details: { factureId: 'FAC-2024-001', montant: 1200.00, clientId: '1' }
      },
      {
        id: '3',
        timestamp: '2024-01-15T14:20:00Z',
        level: 'warning',
        action: 'FAILED_LOGIN',
        description: 'Tentative de connexion échouée',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        details: { email: 'test@example.com', reason: 'invalid_password', attempts: 3 }
      },
      {
        id: '4',
        timestamp: '2024-01-15T14:15:00Z',
        level: 'error',
        action: 'PAYMENT_FAILED',
        description: 'Échec du traitement du paiement',
        userId: '3',
        userName: 'Marie Leroy',
        ipAddress: '192.168.1.103',
        details: { 
          factureId: 'FAC-2024-002', 
          montant: 850.00, 
          errorCode: 'CARD_DECLINED',
          errorMessage: 'Carte bancaire refusée'
        }
      }
    ];
    
    // Apply filters
    const { level, dateFilter, search } = req.query;
    
    let filteredLogs = logs;
    
    if (level && level !== 'tous') {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (dateFilter) {
      const now = new Date();
      let cutoffDate;
      
      switch (dateFilter) {
        case '1j':
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7j':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30j':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
      
      if (cutoffDate) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= cutoffDate);
      }
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.action.toLowerCase().includes(searchLower) ||
        log.description.toLowerCase().includes(searchLower) ||
        (log.userName && log.userName.toLowerCase().includes(searchLower))
      );
    }
    
    res.status(200).json({
      success: true,
      data: filteredLogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des logs',
      error: error.message
    });
  }
});

// Get log stats
router.get('/stats', protect, admin, (req, res) => {
  try {
    const stats = {
      total: 8,
      info: 2,
      success: 2,
      warning: 2,
      error: 2,
      avgDuration: 185
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

// Export logs
router.get('/export', protect, admin, (req, res) => {
  try {
    // In a real app, this would generate a CSV or JSON file
    res.status(200).json({
      success: true,
      message: 'Logs exportés avec succès',
      downloadUrl: '/api/logs/download/logs.csv'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'export des logs',
      error: error.message
    });
  }
});

module.exports = router;