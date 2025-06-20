const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');

// Get all audit logs
router.get('/logs', protect, admin, (req, res) => {
  try {
    // In a real app, you would filter logs by user/agence
    const auditLogs = [
      {
        id: '1',
        timestamp: '2024-01-15T14:30:25Z',
        userId: '2',
        userName: 'Sophie Martin',
        userRole: 'agence',
        action: 'CREATE',
        module: 'clients',
        description: 'Création du client "Martin Dubois"',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        duration: 245,
        affectedResource: 'client:1',
        newValue: { nom: 'Dubois', prenom: 'Martin', email: 'martin.dubois@email.com' }
      },
      {
        id: '2',
        timestamp: '2024-01-15T14:25:10Z',
        userId: '3',
        userName: 'Jean Dupont',
        userRole: 'agent',
        action: 'UPDATE',
        module: 'factures',
        description: 'Modification de la facture FAC-2024-001',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        success: true,
        duration: 189,
        affectedResource: 'facture:1',
        oldValue: { montantHT: 1000.00 },
        newValue: { montantHT: 1200.00 }
      }
    ];
    
    // Apply filters
    const { action, module, userRole, success, dateRange } = req.query;
    
    let filteredLogs = auditLogs;
    
    if (action && action !== 'tous') {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }
    
    if (module && module !== 'tous') {
      filteredLogs = filteredLogs.filter(log => log.module === module);
    }
    
    if (userRole && userRole !== 'tous') {
      filteredLogs = filteredLogs.filter(log => log.userRole === userRole);
    }
    
    if (success && success !== 'tous') {
      filteredLogs = filteredLogs.filter(log => log.success === (success === 'true'));
    }
    
    if (dateRange && dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Include the entire end day
      
      filteredLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate <= endDate;
      });
    }
    
    res.status(200).json({
      success: true,
      data: filteredLogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des logs d\'audit',
      error: error.message
    });
  }
});

// Get audit log stats
router.get('/stats', protect, admin, (req, res) => {
  try {
    const stats = {
      totalLogs: 8,
      successCount: 6,
      failureCount: 2,
      avgDuration: 217
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

// Export audit logs
router.get('/export', protect, admin, (req, res) => {
  try {
    // In a real app, this would generate a CSV or JSON file
    res.status(200).json({
      success: true,
      message: 'Logs d\'audit exportés avec succès',
      downloadUrl: '/api/audit/download/audit_logs.csv'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'export des logs d\'audit',
      error: error.message
    });
  }
});

module.exports = router;