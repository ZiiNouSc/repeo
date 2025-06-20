import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, LogOut, User, Settings, Menu, Mail, Phone, ChevronDown, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, logout, switchAgence, currentAgence, userAgences } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAgencesMenu, setShowAgencesMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const agencesMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    navigate('/parametres');
  };

  const handleSwitchAgence = (agenceId: string) => {
    switchAgence(agenceId);
    setShowAgencesMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (agencesMenuRef.current && !agencesMenuRef.current.contains(event.target as Node)) {
        setShowAgencesMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const notifications = [
    {
      id: 1,
      title: 'Nouvelle facture créée',
      message: 'Facture #FAC-2024-001 créée avec succès',
      time: '5 min',
      unread: true
    },
    {
      id: 2,
      title: 'Paiement reçu',
      message: 'Paiement de 1,250€ reçu de Martin Dubois',
      time: '1h',
      unread: true
    },
    {
      id: 3,
      title: 'Nouveau client',
      message: 'Sophie Martin a été ajoutée à votre base clients',
      time: '2h',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 space-x-4">
          {/* Menu mobile */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Barre de recherche */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
            />
          </div>

          {/* Agency Selector - Only show for agency admins */}
          {user?.role === 'agence' && userAgences.length > 1 && (
            <div className="relative ml-4" ref={agencesMenuRef}>
              <button 
                onClick={() => setShowAgencesMenu(!showAgencesMenu)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Building2 className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {currentAgence?.nom || userAgences[0].nom}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown menu agences */}
              {showAgencesMenu && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-slide-up">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900">Changer d'agence</p>
                  </div>
                  <div className="py-2">
                    {userAgences.map(agence => (
                      <button 
                        key={agence.id}
                        onClick={() => handleSwitchAgence(agence.id)}
                        className={`w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          (currentAgence?.id || userAgences[0].id) === agence.id 
                            ? 'text-blue-600 font-medium' 
                            : 'text-gray-700'
                        }`}
                      >
                        <Building2 className="w-4 h-4 mr-3" />
                        {agence.nom}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown notifications */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-slide-up">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-500">{unreadCount} non lues</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                        notification.unread ? 'border-blue-500 bg-blue-50/30' : 'border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            notification.unread ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-100">
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/notifications');
                    }}
                  >
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Menu utilisateur */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="font-medium text-gray-900 text-sm">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-gray-500 text-xs capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-medium">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown menu utilisateur */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-slide-up">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-gray-900">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2 capitalize">
                    {user?.role}
                  </span>
                </div>
                
                <div className="py-2">
                  {user?.role === 'agence' && (
                    <button 
                      onClick={handleProfileClick}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Mon profil
                    </button>
                  )}
                  
                  <button 
                    onClick={handleSettingsClick}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Paramètres
                  </button>
                </div>
                
                <div className="border-t border-gray-100 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;