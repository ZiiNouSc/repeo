const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all audit logs
router.get('/logs', (req, res) => {
  try {
    // In a real app, you would filter logs by user/agence
    const auditLogs = readData('auditLogs') || [];
    
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
router.get('/stats', (req, res) => {
  try {
    const auditLogs = readData('auditLogs') || [];
    
    const stats = {
      totalLogs: auditLogs.length,
      successCount: auditLogs.filter(log => log.success).length,
      failureCount: auditLogs.filter(log => !log.success).length,
      avgDuration: Math.round(auditLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / auditLogs.length) || 0
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

// Create audit log entry (usually called internally)
router.post('/logs', (req, res) => {
  try {
    const { 
      action, 
      module, 
      description, 
      userId, 
      userName, 
      userRole, 
      ipAddress, 
      userAgent, 
      success, 
      duration, 
      details, 
      affectedResource, 
      oldValue, 
      newValue 
    } = req.body;
    
    if (!action || !module || !description) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const auditLogs = readData('auditLogs') || [];
    
    const newLog = {
      id: generateId(),
      timestamp: formatDate(new Date()),
      action,
      module,
      description,
      userId,
      userName,
      userRole,
      ipAddress: ipAddress || req.ip,
      userAgent,
      success: success !== undefined ? success : true,
      duration,
      details,
      affectedResource,
      oldValue,
      newValue
    };
    
    auditLogs.push(newLog);
    
    if (writeData('auditLogs', auditLogs)) {
      res.status(201).json({
        success: true,
        message: 'Log d\'audit créé avec succès',
        data: newLog
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du log d\'audit',
      error: error.message
    });
  }
});

// Export audit logs
router.get('/export', (req, res) => {
  try {
    const auditLogs = readData('auditLogs') || [];
    
    // In a real app, this would generate a CSV or JSON file
    res.status(200).json({
      success: true,
      message: 'Logs d\'audit exportés avec succès',
      data: auditLogs
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