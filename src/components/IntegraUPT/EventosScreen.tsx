import React from 'react';
import { Navigation } from './Navigation';
import { Calendar, Clock, MapPin, Users, Star } from 'lucide-react';
import './../../styles/EventosScreen.css';

interface EventosScreenProps {
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
  onSectionChange?: (section: 'home' | 'servicios' | 'eventos' | 'perfil', servicio?: 'espacios' | 'citas') => void;
  onBackToDashboard?: () => void;
}

export const EventosScreen: React.FC<EventosScreenProps> = ({ 
  user, 
  currentSection = 'eventos', 
  onSectionChange,
  onBackToDashboard 
}) => {
  const eventos = [
    {
      id: 1,
      titulo: 'Hackathon UPT 2024',
      descripcion: 'Competencia de programación de 24 horas para resolver problemas reales de la comunidad',
      fecha: '2024-04-15',
      hora: '09:00 - 18:00',
      ubicacion: 'Laboratorios de Sistemas',
      participantes: 45,
      maxParticipantes: 60,
      categoria: 'Tecnología',
      destacado: true
    },
    {
      id: 2,
      titulo: 'Feria de Proyectos de Ingeniería',
      descripcion: 'Exposición de proyectos finales de estudiantes de todas las carreras de ingeniería',
      fecha: '2024-04-20',
      hora: '10:00 - 16:00',
      ubicacion: 'Patio Central',
      participantes: 120,
      maxParticipantes: 200,
      categoria: 'Académico',
      destacado: false
    },
    {
      id: 3,
      titulo: 'Conferencia de Emprendimiento',
      descripcion: 'Charla magistral sobre startups y emprendimiento en el Perú',
      fecha: '2024-04-25',
      hora: '14:00 - 17:00',
      ubicacion: 'Auditorio Principal',
      participantes: 80,
      maxParticipantes: 150,
      categoria: 'Emprendimiento',
      destacado: true
    }
  ];

  return (
    <div className="eventos-container">
      <Navigation 
        user={user} 
        currentSection={currentSection} 
        onSectionChange={onSectionChange} 
        onBackToDashboard={onBackToDashboard}
      />
      
      <main className="eventos-main">
        <div className="eventos-header">
          <h1 className="eventos-title">
            Eventos Universitarios
          </h1>
          <p className="eventos-subtitle">
            Descubre y participa en los eventos de la Universidad Privada de Tacna
          </p>
        </div>

        {/* Filtros de eventos */}
        <div className="eventos-filters">
          <div className="eventos-filters-container">
            <select className="eventos-filter-select">
              <option>Todas las categorías</option>
              <option>Tecnología</option>
              <option>Académico</option>
              <option>Emprendimiento</option>
              <option>Cultural</option>
            </select>
            
            <select className="eventos-filter-select">
              <option>Todos los eventos</option>
              <option>Esta semana</option>
              <option>Este mes</option>
              <option>Próximamente</option>
            </select>

            <button className="eventos-filter-btn">
              Filtrar
            </button>
          </div>
        </div>

        {/* Lista de eventos */}
        <div className="eventos-list">
          {eventos.map((evento) => (
            <div 
              key={evento.id} 
              className={`eventos-card ${evento.destacado ? 'eventos-card-destacado' : ''}`}
            >
              {evento.destacado && (
                <div className="eventos-destacado-banner">
                  <div className="eventos-destacado-content">
                    <Star className="eventos-destacado-icon" />
                    <span className="eventos-destacado-text">Evento Destacado</span>
                  </div>
                </div>
              )}
              
              <div className="eventos-card-content">
                <div className="eventos-card-layout">
                  <div className="eventos-card-info">
                    <div className="eventos-card-header">
                      <h3 className="eventos-card-title">
                        {evento.titulo}
                      </h3>
                      <span className="eventos-categoria">
                        {evento.categoria}
                      </span>
                    </div>
                    
                    <p className="eventos-descripcion">{evento.descripcion}</p>
                    
                    <div className="eventos-details-grid">
                      <div className="eventos-detail">
                        <Calendar className="eventos-detail-icon" />
                        <span>{evento.fecha}</span>
                      </div>
                      <div className="eventos-detail">
                        <Clock className="eventos-detail-icon" />
                        <span>{evento.hora}</span>
                      </div>
                      <div className="eventos-detail">
                        <MapPin className="eventos-detail-icon" />
                        <span>{evento.ubicacion}</span>
                      </div>
                    </div>

                    <div className="eventos-participantes">
                      <Users className="eventos-participantes-icon" />
                      <span className="eventos-participantes-text">
                        {evento.participantes}/{evento.maxParticipantes} participantes
                      </span>
                      <div className="eventos-progress-container">
                        <div 
                          className="eventos-progress-bar"
                          style={{ 
                            width: `${(evento.participantes / evento.maxParticipantes) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="eventos-actions">
                    <button className="eventos-btn eventos-btn-primary">
                      Inscribirse
                    </button>
                    <button className="eventos-btn eventos-btn-secondary">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mis eventos */}
        <div className="eventos-mis-eventos">
          <h2 className="eventos-mis-eventos-title">Mis Eventos</h2>
          
          <div className="eventos-mis-eventos-grid">
            <div className="eventos-mis-evento-card">
              <h3 className="eventos-mis-evento-title">Hackathon UPT 2024</h3>
              <div className="eventos-mis-evento-fecha">
                <Calendar className="eventos-mis-evento-icon" />
                <span>15 Abr - 09:00</span>
              </div>
              <div className="eventos-mis-evento-status">
                <span className="eventos-status-badge eventos-status-inscrito">
                  Inscrito
                </span>
              </div>
            </div>

            <div className="eventos-mis-evento-card">
              <h3 className="eventos-mis-evento-title">Conferencia de Emprendimiento</h3>
              <div className="eventos-mis-evento-fecha">
                <Calendar className="eventos-mis-evento-icon" />
                <span>25 Abr - 14:00</span>
              </div>
              <div className="eventos-mis-evento-status">
                <span className="eventos-status-badge eventos-status-lista-espera">
                  En Lista de Espera
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};