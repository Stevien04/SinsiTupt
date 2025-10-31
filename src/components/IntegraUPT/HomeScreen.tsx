import React from 'react';
import { Navigation } from './Navigation';
import { Calendar, Clock, BookOpen, Bell } from 'lucide-react';
import './../../styles/HomeScreen.css';

interface HomeScreenProps {
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
  currentSection?: 'home' | 'servicios' | 'eventos' | 'perfil';
  onSectionChange?: (section: 'home' | 'servicios' | 'eventos' | 'perfil') => void;
  onBackToDashboard?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  user, 
  currentSection = 'home', 
  onSectionChange,
  onBackToDashboard 
}) => {
  const isAcademic = user.user_metadata.login_type === 'academic';

  // Horario de ejemplo para estudiantes
  const scheduleData = [
    { day: 'Lunes', time: '08:00 - 10:00', course: 'Matemáticas III', classroom: 'A-301', professor: 'Dr. García' },
    { day: 'Lunes', time: '10:00 - 12:00', course: 'Física II', classroom: 'B-205', professor: 'Dra. Martínez' },
    { day: 'Martes', time: '08:00 - 10:00', course: 'Programación Avanzada', classroom: 'LAB-02', professor: 'Ing. López' },
    { day: 'Miércoles', time: '14:00 - 16:00', course: 'Base de Datos', classroom: 'C-401', professor: 'Ing. Rodríguez' },
    { day: 'Jueves', time: '10:00 - 12:00', course: 'Algoritmos', classroom: 'LAB-01', professor: 'Dr. Fernández' },
    { day: 'Viernes', time: '08:00 - 10:00', course: 'Inglés Técnico', classroom: 'D-102', professor: 'Prof. Smith' },
  ];

  // Próximos eventos
  const upcomingEvents = [
    { title: 'Hackathon UPT 2025', date: '15 Oct', type: 'Competencia' },
    { title: 'Charla: IA en la Educación', date: '18 Oct', type: 'Conferencia' },
    { title: 'Torneo Deportivo', date: '22 Oct', type: 'Deportes' },
  ];

  return (
    <div className="home-container">
      <Navigation 
        user={user} 
        currentSection={currentSection} 
        onSectionChange={onSectionChange}
        onBackToDashboard={onBackToDashboard}
      />
      
      <main className="home-main">
        {/* Header */}
        <div className="home-header">
          <h1 className="home-title">
            Bienvenido{isAcademic ? ', ' + user.user_metadata.name : ''}
          </h1>
          <p className="home-subtitle">
            {isAcademic 
              ? `Código: ${user.user_metadata.codigo || 'N/A'} | ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
              : 'Panel de administración del sistema IntegraUPT'
            }
          </p>
        </div>

        {/* Notificaciones Rápidas */}
        <div className="home-notification">
          <div className="home-notification-content">
            <Bell className="home-notification-icon" />
            <div>
              <h3 className="home-notification-title">Recordatorio</h3>
              <p className="home-notification-text">
                Tienes una clase de Programación Avanzada mañana a las 08:00 AM en LAB-02
              </p>
            </div>
          </div>
        </div>

        <div className="home-grid">
          {/* Columna Principal - Horario */}
          <div className="home-main-column">
            {/* Horario Semanal */}
            <div className="home-card">
              <div className="home-card-header">
                <Calendar className="home-card-icon home-card-icon-blue" />
                <h2 className="home-card-title">Horario de Clases</h2>
              </div>
              
              <div className="home-schedule-list">
                {scheduleData.map((item, index) => (
                  <div 
                    key={index} 
                    className="home-schedule-item"
                  >
                    <div className="home-schedule-content">
                      <div className="home-schedule-time">
                        <Clock className="home-schedule-time-icon" />
                        <span className="home-schedule-time-text">{item.day} | {item.time}</span>
                      </div>
                      <h3 className="home-schedule-course">{item.course}</h3>
                      <p className="home-schedule-details">
                        {item.professor} • Aula: {item.classroom}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Lateral - Resumen */}
          <div className="home-sidebar">
            {/* Próximos Eventos */}
            {/* <div className="home-card">
              <div className="home-card-header">
                <Calendar className="home-card-icon home-card-icon-purple" />
                <h2 className="home-card-title">Próximos Eventos</h2>
              </div>
              
              <div className="home-events-list">
                {upcomingEvents.map((event, index) => (
                  <div 
                    key={index}
                    className="home-event-item"
                  >
                    <div className="home-event-header">
                      <h4 className="home-event-title">{event.title}</h4>
                      <span className="home-event-date">
                        {event.date}
                      </span>
                    </div>
                    <p className="home-event-type">{event.type}</p>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => onSectionChange?.('eventos')}
                className="home-action-btn home-action-btn-purple"
              >
                Ver Todos los Eventos
              </button>
            </div> */}

            {/* Reservas Activas */}
            <div className="home-card">
              <div className="home-card-header">
                <BookOpen className="home-card-icon home-card-icon-green" />
                <h2 className="home-card-title">Reservas Activas</h2>
              </div>
              
              <div className="home-reservas-list">
                <div className="home-reserva-item">
                  <h4 className="home-reserva-title">Biblioteca Central</h4>
                  <p className="home-reserva-detail">Hoy, 14:00 - 16:00</p>
                  <p className="home-reserva-detail">Mesa #12</p>
                </div>
                
                <div className="home-reserva-item">
                  <h4 className="home-reserva-title">Lab. Computación</h4>
                  <p className="home-reserva-detail">Mañana, 10:00 - 12:00</p>
                  <p className="home-reserva-detail">PC #08</p>
                </div>
              </div>
              
              <button 
                onClick={() => onSectionChange?.('servicios', 'espacios')}
                className="home-action-btn home-action-btn-green"
              >
                Gestionar Reservas
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};