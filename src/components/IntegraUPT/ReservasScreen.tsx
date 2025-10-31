import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { Calendar, Clock, MapPin, Search, Plus, Edit, Trash2, Eye, X, Check } from 'lucide-react';
import './../../styles/ReservasScreen.css';

interface Reservation {
  id: string;
  location: string;
  resource: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'pending' | 'cancelled';
}

interface ReservasScreenProps {
  user: {
    id: string;
    email: string;
    user_metadata: {
      name: string;
      avatar_url: string;
      role?: string;
      login_type?: string;
      codigo?: string;
    };
  };
  currentSection?: 'home' | 'reservas' | 'eventos' | 'perfil';
  onSectionChange?: (section: 'home' | 'reservas' | 'eventos' | 'perfil') => void;
  onBackToDashboard?: () => void;
}

export const ReservasScreen: React.FC<ReservasScreenProps> = ({ 
  user, 
  currentSection = 'reservas', 
  onSectionChange,
  onBackToDashboard 
}) => {
  const [view, setView] = useState<'list' | 'new' | 'edit' | 'availability'>('list');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para nueva reserva/edición
  const [formData, setFormData] = useState({
    location: '',
    resource: '',
    date: '',
    startTime: '',
    endTime: ''
  });

  // Reservas de ejemplo
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: '1',
      location: 'Biblioteca Central',
      resource: 'Mesa #12',
      date: '2025-10-09',
      startTime: '14:00',
      endTime: '16:00',
      status: 'active'
    },
    {
      id: '2',
      location: 'Laboratorio de Computación',
      resource: 'PC #08',
      date: '2025-10-10',
      startTime: '10:00',
      endTime: '12:00',
      status: 'active'
    },
    {
      id: '3',
      location: 'Sala de Reuniones',
      resource: 'Sala A',
      date: '2025-10-12',
      startTime: '15:00',
      endTime: '17:00',
      status: 'pending'
    }
  ]);

  // Disponibilidad de recursos
  const availabilityData = [
    {
      location: 'Biblioteca Central',
      resources: [
        { name: 'Mesa #1', available: true, nextAvailable: '10:00' },
        { name: 'Mesa #2', available: false, nextAvailable: '14:00' },
        { name: 'Mesa #3', available: true, nextAvailable: 'Ahora' },
        { name: 'Mesa #4', available: true, nextAvailable: 'Ahora' },
      ]
    },
    {
      location: 'Laboratorio de Computación',
      resources: [
        { name: 'PC #01', available: true, nextAvailable: 'Ahora' },
        { name: 'PC #02', available: false, nextAvailable: '16:00' },
        { name: 'PC #03', available: true, nextAvailable: 'Ahora' },
      ]
    },
    {
      location: 'Sala de Reuniones',
      resources: [
        { name: 'Sala A', available: false, nextAvailable: '18:00' },
        { name: 'Sala B', available: true, nextAvailable: 'Ahora' },
      ]
    }
  ];

  const handleCreateReservation = () => {
    const newReservation: Reservation = {
      id: Date.now().toString(),
      location: formData.location,
      resource: formData.resource,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      status: 'pending'
    };
    setReservations([...reservations, newReservation]);
    setFormData({ location: '', resource: '', date: '', startTime: '', endTime: '' });
    setView('list');
  };

  const handleUpdateReservation = () => {
    if (!selectedReservation) return;
    
    setReservations(reservations.map(r => 
      r.id === selectedReservation.id 
        ? { ...r, ...formData }
        : r
    ));
    setSelectedReservation(null);
    setFormData({ location: '', resource: '', date: '', startTime: '', endTime: '' });
    setView('list');
  };

  const handleCancelReservation = (id: string) => {
    if (window.confirm('¿Estás seguro de cancelar esta reserva?')) {
      setReservations(reservations.map(r => 
        r.id === id ? { ...r, status: 'cancelled' as const } : r
      ));
    }
  };

  const handleDeleteReservation = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta reserva?')) {
      setReservations(reservations.filter(r => r.id !== id));
    }
  };

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setFormData({
      location: reservation.location,
      resource: reservation.resource,
      date: reservation.date,
      startTime: reservation.startTime,
      endTime: reservation.endTime
    });
    setView('edit');
  };

  const filteredReservations = reservations.filter(r => 
    r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'reservas-status-active';
      case 'pending': return 'reservas-status-pending';
      case 'cancelled': return 'reservas-status-cancelled';
      default: return 'reservas-status-default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className="reservas-container">
      <Navigation
        user={user} 
        currentSection={currentSection} 
        onSectionChange={onSectionChange}
        onBackToDashboard={onBackToDashboard}
      />
      
      <main className="reservas-main">
        {/* Header */}
        <div className="reservas-header">
          <h1 className="reservas-title">Gestión de Reservas</h1>
          <p className="reservas-subtitle">
            Administra tus reservas de espacios y recursos académicos
          </p>
        </div>

        {/* Botones de acción */}
        <div className="reservas-actions">
          <button
            onClick={() => setView('list')}
            className={`reservas-action-btn ${view === 'list' ? 'reservas-action-active' : 'reservas-action-inactive'}`}
          >
            Mis Reservas
          </button>
          <button
            onClick={() => {
              setFormData({ location: '', resource: '', date: '', startTime: '', endTime: '' });
              setView('new');
            }}
            className={`reservas-action-btn reservas-action-new ${view === 'new' ? 'reservas-action-active' : 'reservas-action-inactive'}`}
          >
            <Plus className="reservas-action-icon" />
            Nueva Reserva
          </button>
          <button
            onClick={() => setView('availability')}
            className={`reservas-action-btn reservas-action-availability ${view === 'availability' ? 'reservas-action-active' : 'reservas-action-inactive'}`}
          >
            <Eye className="reservas-action-icon" />
            Ver Disponibilidad
          </button>
        </div>

        {/* Vista de Lista de Reservas */}
        {view === 'list' && (
          <div className="reservas-list-container">
            {/* Barra de búsqueda */}
            <div className="reservas-search-container">
              <div className="reservas-search-wrapper">
                <Search className="reservas-search-icon" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por ubicación o recurso..."
                  className="reservas-search-input"
                />
              </div>
            </div>

            {/* Lista de reservas */}
            {filteredReservations.length === 0 ? (
              <div className="reservas-empty">
                <Calendar className="reservas-empty-icon" />
                <h3 className="reservas-empty-title">No hay reservas</h3>
                <p className="reservas-empty-description">
                  {searchTerm ? 'No se encontraron reservas con ese criterio' : 'Comienza creando tu primera reserva'}
                </p>
                <button
                  onClick={() => setView('new')}
                  className="reservas-empty-btn"
                >
                  Crear Reserva
                </button>
              </div>
            ) : (
              <div className="reservas-grid">
                {filteredReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className={`reservas-card ${
                      reservation.status === 'active' ? 'reservas-card-active' :
                      reservation.status === 'pending' ? 'reservas-card-pending' : 'reservas-card-cancelled'
                    }`}
                  >
                    <div className="reservas-card-header">
                      <h3 className="reservas-card-title">{reservation.location}</h3>
                      <span className={`reservas-status ${getStatusColor(reservation.status)}`}>
                        {getStatusLabel(reservation.status)}
                      </span>
                    </div>
                    
                    <div className="reservas-card-details">
                      <div className="reservas-detail">
                        <MapPin className="reservas-detail-icon" />
                        {reservation.resource}
                      </div>
                      <div className="reservas-detail">
                        <Calendar className="reservas-detail-icon" />
                        {new Date(reservation.date).toLocaleDateString('es-ES')}
                      </div>
                      <div className="reservas-detail">
                        <Clock className="reservas-detail-icon" />
                        {reservation.startTime} - {reservation.endTime}
                      </div>
                    </div>

                    {reservation.status !== 'cancelled' && (
                      <div className="reservas-card-actions">
                        <button
                          onClick={() => handleEditReservation(reservation)}
                          className="reservas-btn reservas-btn-edit"
                        >
                          <Edit className="reservas-btn-icon" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="reservas-btn reservas-btn-cancel"
                        >
                          <Trash2 className="reservas-btn-icon" />
                          Cancelar
                        </button>
                      </div>
                    )}

                    {reservation.status === 'cancelled' && (
                      <button
                        onClick={() => handleDeleteReservation(reservation.id)}
                        className="reservas-btn reservas-btn-delete"
                      >
                        <Trash2 className="reservas-btn-icon" />
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Formulario Nueva Reserva */}
        {view === 'new' && (
          <div className="reservas-form-container">
            <div className="reservas-form-header">
              <h2 className="reservas-form-title">Nueva Reserva</h2>
              <button
                onClick={() => setView('list')}
                className="reservas-form-close"
              >
                <X className="reservas-form-close-icon" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateReservation(); }} className="reservas-form">
              <div className="reservas-form-group">
                <label className="reservas-form-label">Ubicación</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value, resource: '' })}
                  className="reservas-form-select"
                  required
                >
                  <option value="">Selecciona una ubicación</option>
                  <option value="Biblioteca Central">Biblioteca Central</option>
                  <option value="Laboratorio de Computación">Laboratorio de Computación</option>
                  <option value="Sala de Reuniones">Sala de Reuniones</option>
                  <option value="Auditorio">Auditorio</option>
                </select>
              </div>

              <div className="reservas-form-group">
                <label className="reservas-form-label">Recurso</label>
                <input
                  type="text"
                  value={formData.resource}
                  onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                  placeholder="Ej: Mesa #12, PC #08, Sala A"
                  className="reservas-form-input"
                  required
                />
              </div>

              <div className="reservas-form-group">
                <label className="reservas-form-label">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="reservas-form-input"
                  required
                />
              </div>

              <div className="reservas-form-grid">
                <div className="reservas-form-group">
                  <label className="reservas-form-label">Hora Inicio</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="reservas-form-input"
                    required
                  />
                </div>
                <div className="reservas-form-group">
                  <label className="reservas-form-label">Hora Fin</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="reservas-form-input"
                    required
                  />
                </div>
              </div>

              <div className="reservas-form-actions">
                <button
                  type="submit"
                  className="reservas-form-btn reservas-form-btn-primary"
                >
                  <Check className="reservas-form-btn-icon" />
                  Crear Reserva
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="reservas-form-btn reservas-form-btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Formulario Editar Reserva */}
        {view === 'edit' && (
          <div className="reservas-form-container">
            <div className="reservas-form-header">
              <h2 className="reservas-form-title">Editar Reserva</h2>
              <button
                onClick={() => {
                  setView('list');
                  setSelectedReservation(null);
                }}
                className="reservas-form-close"
              >
                <X className="reservas-form-close-icon" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdateReservation(); }} className="reservas-form">
              <div className="reservas-form-group">
                <label className="reservas-form-label">Ubicación</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="reservas-form-select"
                  required
                >
                  <option value="">Selecciona una ubicación</option>
                  <option value="Biblioteca Central">Biblioteca Central</option>
                  <option value="Laboratorio de Computación">Laboratorio de Computación</option>
                  <option value="Sala de Reuniones">Sala de Reuniones</option>
                  <option value="Auditorio">Auditorio</option>
                </select>
              </div>

              <div className="reservas-form-group">
                <label className="reservas-form-label">Recurso</label>
                <input
                  type="text"
                  value={formData.resource}
                  onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                  placeholder="Ej: Mesa #12, PC #08, Sala A"
                  className="reservas-form-input"
                  required
                />
              </div>

              <div className="reservas-form-group">
                <label className="reservas-form-label">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="reservas-form-input"
                  required
                />
              </div>

              <div className="reservas-form-grid">
                <div className="reservas-form-group">
                  <label className="reservas-form-label">Hora Inicio</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="reservas-form-input"
                    required
                  />
                </div>
                <div className="reservas-form-group">
                  <label className="reservas-form-label">Hora Fin</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="reservas-form-input"
                    required
                  />
                </div>
              </div>

              <div className="reservas-form-actions">
                <button
                  type="submit"
                  className="reservas-form-btn reservas-form-btn-edit"
                >
                  <Check className="reservas-form-btn-icon" />
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('list');
                    setSelectedReservation(null);
                  }}
                  className="reservas-form-btn reservas-form-btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Vista de Disponibilidad */}
        {view === 'availability' && (
          <div className="reservas-availability-container">
            <div className="reservas-availability-info">
              <p className="reservas-availability-info-text">
                Consulta la disponibilidad en tiempo real de todos los espacios y recursos
              </p>
            </div>

            {availabilityData.map((location, idx) => (
              <div key={idx} className="reservas-availability-location">
                <h3 className="reservas-availability-location-title">{location.location}</h3>
                <div className="reservas-availability-grid">
                  {location.resources.map((resource, ridx) => (
                    <div
                      key={ridx}
                      className={`reservas-availability-card ${
                        resource.available
                          ? 'reservas-availability-available'
                          : 'reservas-availability-unavailable'
                      }`}
                    >
                      <div className="reservas-availability-card-header">
                        <h4 className="reservas-availability-resource-name">{resource.name}</h4>
                        <span
                          className={`reservas-availability-status ${
                            resource.available
                              ? 'reservas-availability-status-available'
                              : 'reservas-availability-status-unavailable'
                          }`}
                        >
                          {resource.available ? 'Disponible' : 'Ocupado'}
                        </span>
                      </div>
                      <p className="reservas-availability-info">
                        {resource.available
                          ? 'Disponible ahora'
                          : `Próxima disponibilidad: ${resource.nextAvailable}`}
                      </p>
                      {resource.available && (
                        <button
                          onClick={() => {
                            setFormData({
                              location: location.location,
                              resource: resource.name,
                              date: new Date().toISOString().split('T')[0],
                              startTime: '',
                              endTime: ''
                            });
                            setView('new');
                          }}
                          className="reservas-availability-btn"
                        >
                          Reservar Ahora
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};