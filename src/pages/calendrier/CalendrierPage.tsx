import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Plane,
  Building2,
  Clock,
  MapPin,
  Filter,
  Eye
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  type: 'reservation' | 'rappel' | 'rendez_vous' | 'tache' | 'autre';
  clientId?: string;
  clientNom?: string;
  description?: string;
  location?: string;
  color: string;
}

const CalendrierPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const eventTypes = [
    { id: 'reservation', label: 'Réservation', color: 'blue' },
    { id: 'rappel', label: 'Rappel', color: 'yellow' },
    { id: 'rendez_vous', label: 'Rendez-vous', color: 'green' },
    { id: 'tache', label: 'Tâche', color: 'purple' },
    { id: 'autre', label: 'Autre', color: 'gray' }
  ];

  useEffect(() => {
    fetchEvents();
  }, [currentDate, currentView]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - à remplacer par un vrai appel API
      setEvents([
        {
          id: '1',
          title: 'Départ voyage Rome - Martin Dubois',
          start: '2024-01-15T08:00:00',
          end: '2024-01-15T10:00:00',
          allDay: false,
          type: 'reservation',
          clientId: '1',
          clientNom: 'Martin Dubois',
          description: 'Vol Paris-Rome AF1234',
          location: 'Aéroport CDG Terminal 2E',
          color: '#3B82F6' // blue-500
        },
        {
          id: '2',
          title: 'Rendez-vous client - Sophie Martin',
          start: '2024-01-16T14:30:00',
          end: '2024-01-16T15:30:00',
          allDay: false,
          type: 'rendez_vous',
          clientId: '2',
          clientNom: 'Sophie Martin',
          description: 'Présentation des offres pour séminaire entreprise',
          location: 'Agence principale',
          color: '#10B981' // green-500
        },
        {
          id: '3',
          title: 'Rappel paiement facture - Entreprise ABC',
          start: '2024-01-17T09:00:00',
          end: '2024-01-17T09:30:00',
          allDay: false,
          type: 'rappel',
          clientId: '3',
          clientNom: 'Entreprise ABC',
          description: 'Rappeler pour le paiement de la facture FAC-2024-002',
          color: '#F59E0B' // yellow-500
        },
        {
          id: '4',
          title: 'Finaliser devis séminaire Londres',
          start: '2024-01-18',
          end: '2024-01-18',
          allDay: true,
          type: 'tache',
          description: 'Compléter et envoyer le devis pour le séminaire à Londres',
          color: '#8B5CF6' // purple-500
        },
        {
          id: '5',
          title: 'Formation nouveaux produits',
          start: '2024-01-19T10:00:00',
          end: '2024-01-19T12:00:00',
          allDay: false,
          type: 'autre',
          description: 'Formation interne sur les nouveaux packages été 2024',
          location: 'Salle de réunion',
          color: '#6B7280' // gray-500
        }
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const toggleFilter = (typeId: string) => {
    setActiveFilters(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  const filteredEvents = events.filter(event => {
    if (activeFilters.length === 0) return true;
    return activeFilters.includes(event.type);
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reservation': return <Plane className="w-4 h-4" />;
      case 'rendez_vous': return <Users className="w-4 h-4" />;
      case 'rappel': return <Clock className="w-4 h-4" />;
      case 'tache': return <CheckSquare className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleString('fr-FR', { month: 'long' });
  };

  const getViewTitle = () => {
    if (currentView === 'month') {
      return `${getMonthName(currentDate)} ${currentDate.getFullYear()}`;
    } else if (currentView === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.getDate()} - ${weekEnd.getDate()} ${getMonthName(weekStart)} ${weekStart.getFullYear()}`;
      } else {
        return `${weekStart.getDate()} ${getMonthName(weekStart)} - ${weekEnd.getDate()} ${getMonthName(weekEnd)} ${weekStart.getFullYear()}`;
      }
    } else {
      return currentDate.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Obtenir le premier lundi (ou le premier jour du mois)
    let startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    if (dayOfWeek !== 1) { // Si ce n'est pas un lundi
      startDate.setDate(firstDay.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    }
    
    // Obtenir le dernier dimanche (ou le dernier jour du mois)
    let endDate = new Date(lastDay);
    const lastDayOfWeek = lastDay.getDay();
    if (lastDayOfWeek !== 0) { // Si ce n'est pas un dimanche
      endDate.setDate(lastDay.getDate() + (7 - lastDayOfWeek));
    }
    
    const days = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const getDaysInWeek = (date: Date) => {
    const currentDay = date.getDay(); // 0 = dimanche, 1 = lundi, etc.
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - (currentDay === 0 ? 6 : currentDay - 1)); // Commencer par lundi
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getHoursInDay = () => {
    const hours = [];
    for (let i = 8; i <= 20; i++) { // De 8h à 20h
      hours.push(i);
    }
    return hours;
  };

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      // Pour les événements sur toute la journée
      if (event.allDay) {
        return eventStart.toDateString() === day.toDateString();
      }
      
      // Pour les événements avec une heure spécifique
      return eventStart.toDateString() === day.toDateString();
    });
  };

  const getEventsForHour = (day: Date, hour: number) => {
    return filteredEvents.filter(event => {
      if (event.allDay) return false;
      
      const eventStart = new Date(event.start);
      return eventStart.toDateString() === day.toDateString() && 
             eventStart.getHours() === hour;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendrier</h1>
          <p className="text-gray-600">Gérer vos événements et rendez-vous</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel Événement
        </button>
      </div>

      {/* Contrôles du calendrier */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevious}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Aujourd'hui
          </button>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 ml-2">
            {getViewTitle()}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setCurrentView('month')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                currentView === 'month' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setCurrentView('week')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                currentView === 'week' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setCurrentView('day')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                currentView === 'day' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Jour
            </button>
          </div>
          
          <div className="relative">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Filtrer par type"
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-10 p-2">
              {eventTypes.map(type => (
                <div key={type.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id={`filter-${type.id}`}
                    checked={activeFilters.length === 0 || activeFilters.includes(type.id)}
                    onChange={() => toggleFilter(type.id)}
                    className="mr-2"
                  />
                  <label 
                    htmlFor={`filter-${type.id}`}
                    className="flex items-center cursor-pointer"
                  >
                    <span 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-sm text-gray-700">{type.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vue du calendrier */}
      <Card className="overflow-hidden">
        {currentView === 'month' && (
          <div className="calendar-month">
            {/* En-têtes des jours de la semaine */}
            <div className="grid grid-cols-7 border-b">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                <div key={index} className="p-2 text-center text-sm font-medium text-gray-700">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Grille des jours */}
            <div className="grid grid-cols-7 auto-rows-fr">
              {getDaysInMonth(currentDate).map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                
                return (
                  <div 
                    key={index} 
                    className={`min-h-[120px] border-b border-r p-1 ${
                      isToday(day) 
                        ? 'bg-blue-50' 
                        : isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`text-right p-1 ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div 
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                          className="text-xs p-1 rounded truncate cursor-pointer"
                          style={{ backgroundColor: event.color + '33' }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 p-1">
                          + {dayEvents.length - 3} autre(s)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentView === 'week' && (
          <div className="calendar-week">
            {/* En-têtes des jours */}
            <div className="grid grid-cols-8 border-b">
              <div className="p-2 text-center text-sm font-medium text-gray-700 border-r">
                Heure
              </div>
              {getDaysInWeek(currentDate).map((day, index) => (
                <div 
                  key={index} 
                  className={`p-2 text-center ${
                    isToday(day) ? 'bg-blue-50 font-semibold' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700">
                    {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg ${isToday(day) ? 'text-blue-600' : 'text-gray-900'}`}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Grille des heures */}
            {getHoursInDay().map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b">
                <div className="p-2 text-right text-sm text-gray-500 border-r">
                  {hour}:00
                </div>
                {getDaysInWeek(currentDate).map((day, dayIndex) => {
                  const hourEvents = getEventsForHour(day, hour);
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`p-1 ${isToday(day) ? 'bg-blue-50' : ''}`}
                    >
                      {hourEvents.map(event => (
                        <div 
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                          className="text-xs p-1 rounded truncate cursor-pointer mb-1"
                          style={{ backgroundColor: event.color + '33' }}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {currentView === 'day' && (
          <div className="calendar-day">
            <div className="text-center p-4 bg-blue-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </h3>
            </div>
            
            {/* Événements sur toute la journée */}
            <div className="p-4 border-b">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Toute la journée</h4>
              <div className="space-y-2">
                {getEventsForDay(currentDate)
                  .filter(event => event.allDay)
                  .map(event => (
                    <div 
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowEventModal(true);
                      }}
                      className="p-2 rounded cursor-pointer"
                      style={{ backgroundColor: event.color + '33' }}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: event.color }}
                        />
                        <span className="font-medium text-gray-900">{event.title}</span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      )}
                    </div>
                  ))}
                {getEventsForDay(currentDate).filter(event => event.allDay).length === 0 && (
                  <p className="text-sm text-gray-500">Aucun événement sur toute la journée</p>
                )}
              </div>
            </div>
            
            {/* Grille des heures */}
            <div className="space-y-4 p-4">
              {getHoursInDay().map(hour => {
                const hourEvents = getEventsForHour(currentDate, hour);
                
                return (
                  <div key={hour} className="relative">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      {hour}:00
                    </div>
                    <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                      {hourEvents.map(event => (
                        <div 
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                          className="p-2 rounded cursor-pointer"
                          style={{ backgroundColor: event.color + '33' }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: event.color }}
                              />
                              <span className="font-medium text-gray-900">{event.title}</span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {new Date(event.start).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                              {' - '}
                              {new Date(event.end).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center mt-1 text-sm text-gray-600">
                              <MapPin className="w-3 h-3 mr-1" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      ))}
                      {hourEvents.length === 0 && (
                        <div className="h-8 border border-dashed border-gray-200 rounded-lg"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Modal détails événement */}
      <Modal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title="Détails de l'événement"
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedEvent.color }}
              />
              <h3 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <div className="flex items-center">
                    {getTypeIcon(selectedEvent.type)}
                    <span className="ml-2 capitalize">{selectedEvent.type.replace('_', ' ')}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date et heure
                  </label>
                  <div className="flex items-center text-sm text-gray-900">
                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedEvent.allDay ? (
                      <span>
                        {new Date(selectedEvent.start).toLocaleDateString('fr-FR')} (Toute la journée)
                      </span>
                    ) : (
                      <span>
                        {new Date(selectedEvent.start).toLocaleDateString('fr-FR')}{' '}
                        {new Date(selectedEvent.start).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {' - '}
                        {new Date(selectedEvent.end).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    )}
                  </div>
                </div>
                {selectedEvent.clientNom && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client
                    </label>
                    <div className="flex items-center text-sm text-gray-900">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedEvent.clientNom}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {selectedEvent.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lieu
                    </label>
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedEvent.location}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedEvent.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{selectedEvent.description}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button className="btn-secondary">
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </button>
              <button className="btn-primary">
                <Bell className="w-4 h-4 mr-2" />
                Ajouter un rappel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal ajout événement */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nouvel événement"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <input type="text" className="input-field" placeholder="Titre de l'événement" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select className="input-field">
                {eventTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client (optionnel)
              </label>
              <select className="input-field">
                <option value="">Aucun client</option>
                <option value="1">Martin Dubois</option>
                <option value="2">Sophie Martin</option>
                <option value="3">Entreprise ABC</option>
              </select>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <input type="checkbox" id="allDay" className="mr-2" />
            <label htmlFor="allDay" className="text-sm text-gray-700">
              Toute la journée
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input type="datetime-local" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin *
              </label>
              <input type="datetime-local" className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lieu
            </label>
            <input type="text" className="input-field" placeholder="Lieu de l'événement" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea className="input-field" rows={3} placeholder="Description de l'événement"></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowAddModal(false)}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button className="btn-primary">
              Créer l'événement
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CalendrierPage;