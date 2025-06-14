const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, formatDate } = require('../utils/dataHelper');

// Get all logs
router.get('/', (req, res) => {
  try {
    // In a real app, you would filter logs by user/agence
    const logs = readData('logs') || [];
    
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
router.get('/stats', (req, res) => {
  try {
    const logs = readData('logs') || [];
    
    const stats = {
      total: logs.length,
      info: logs.filter(log => log.level === 'info').length,
      success: logs.filter(log => log.level === 'success').length,
      warning: logs.filter(log => log.level === 'warning').length,
      error: logs.filter(log => log.level === 'error').length,
      avgDuration: logs.reduce((sum, log) => sum + (log.duration || 0), 0) / logs.length || 0
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

// Create log entry (usually called internally)
router.post('/', (req, res) => {
  try {
    const { 
      level, 
      action, 
      description, 
      userId, 
      userName, 
      userRole, 
      ipAddress, 
      userAgent, 
      success, 
      duration, 
      module, 
      details 
    } = req.body;
    
    if (!level || !action || !description) {
      return res.status(400).json({
        success: false,
        message: 'Informations manquantes'
      });
    }
    
    const logs = readData('logs') || [];
    
    const newLog = {
      id: generateId(),
      timestamp: formatDate(new Date()),
      level,
      action,
      description,
      userId,
      userName,
      userRole,
      ipAddress: ipAddress || req.ip,
      userAgent,
      success: success !== undefined ? success : true,
      duration,
      module,
      details
    };
    
    logs.push(newLog);
    
    if (writeData('logs', logs)) {
      res.status(201).json({
        success: true,
        message: 'Log créé avec succès',
        data: newLog
      });
    } else {
      throw new Error('Erreur lors de l\'écriture des données');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du log',
      error: error.message
    });
  }
});

// Export logs
router.get('/export', (req, res) => {
  try {
    const logs = readData('logs') || [];
    
    // In a real app, this would generate a CSV or JSON file
    res.status(200).json({
      success: true,
      message: 'Logs exportés avec succès',
      data: logs
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