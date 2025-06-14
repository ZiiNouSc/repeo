const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to users data file
const usersFilePath = path.join(__dirname, '../data/users.json');

// Helper function to read users data
const readUsers = () => {
  try {
    if (!fs.existsSync(usersFilePath)) {
      // Create directory if it doesn't exist
      const dataDir = path.dirname(usersFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // Create initial users file with default users
      const initialUsers = [
        {
          id: '1',
          email: 'superadmin@samtech.com',
          password: 'demo123', // In a real app, this would be hashed
          nom: 'Admin',
          prenom: 'Super',
          role: 'superadmin',
          statut: 'actif'
        },
        {
          id: '2',
          email: 'agence@test.com',
          password: 'demo123',
          nom: 'Test',
          prenom: 'Agence',
          role: 'agence',
          agenceId: 'agence-1',
          statut: 'actif'
        },
        {
          id: '3',
          email: 'agent@test.com',
          password: 'demo123',
          nom: 'Test',
          prenom: 'Agent',
          role: 'agent',
          agenceId: 'agence-1',
          statut: 'actif',
          permissions: [
            { module: 'clients', actions: ['lire', 'creer', 'modifier'] },
            { module: 'factures', actions: ['lire', 'creer'] },
            { module: 'reservations', actions: ['lire', 'creer'] },
            { module: 'todos', actions: ['lire', 'creer', 'modifier'] },
            { module: 'documents', actions: ['lire', 'creer'] },
            { module: 'calendrier', actions: ['lire', 'creer'] }
          ]
        }
      ];
      
      fs.writeFileSync(usersFilePath, JSON.stringify(initialUsers, null, 2));
      return initialUsers;
    }
    
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users data:', error);
    return [];
  }
};

// Helper function to write users data
const writeUsers = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users data:', error);
    return false;
  }
};

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email et mot de passe requis'
    });
  }
  
  const users = readUsers();
  const user = users.find(u => u.email === email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Identifiants incorrects'
    });
  }
  
  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  
  // In a real app, you would generate a JWT token here
  return res.status(200).json({
    success: true,
    message: 'Connexion réussie',
    user: userWithoutPassword
  });
});

// Register route
router.post('/register', (req, res) => {
  const { 
    nomAgence, 
    email, 
    password, 
    typeActivite, 
    siret, 
    adresse, 
    ville, 
    codePostal, 
    pays, 
    telephone,
    modulesChoisis = []
  } = req.body;
  
  if (!nomAgence || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Informations manquantes'
    });
  }
  
  const users = readUsers();
  
  // Check if email already exists
  if (users.some(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      message: 'Cet email est déjà utilisé'
    });
  }
  
  // Create new user
  const newUser = {
    id: uuidv4(),
    email,
    password, // In a real app, this would be hashed
    nom: nomAgence,
    prenom: '',
    role: 'agence',
    statut: 'en_attente',
    agenceId: `agence-${Date.now()}`,
    dateInscription: new Date().toISOString(),
    adresse: `${adresse}, ${codePostal} ${ville}, ${pays}`,
    telephone,
    siret,
    typeActivite,
    modulesActifs: []
  };
  
  users.push(newUser);
  
  if (writeUsers(users)) {
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    
    return res.status(201).json({
      success: true,
      message: 'Inscription réussie, en attente d\'approbation',
      user: userWithoutPassword
    });
  } else {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription'
    });
  }
});

// Logout route (for completeness, though frontend handles this)
router.post('/logout', (req, res) => {
  // In a real app with JWT, you might blacklist the token
  return res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// Get current user route
router.get('/me', (req, res) => {
  // In a real app, you would verify the JWT token and return the user
  // For now, we'll just return a mock response
  return res.status(200).json({
    success: false,
    message: 'Authentification requise'
  });
});

module.exports = router;