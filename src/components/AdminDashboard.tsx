import React, { useState, useEffect } from 'react';
import { LogOut, Server, Clock, Users, FileText, BarChart3, ClipboardList } from 'lucide-react';
import './../styles/AdminDashboard.css';
import { AuditoriaReserva, GestionEspacios, GestionHorarios, ReportesEstadisticas } from './GestionAdmin';
import { GestionUsuarios } from './GestionAdmin';
import { GestionReservas } from './GestionAdmin/GestionReservas';
import { requestBackendLogout } from '../utils/logout';
import { isBackendLoginType } from '../utils/apiConfig';

interface User {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    avatar_url: string;
    role?: string;
    login_type?: string;
  };
}

interface AdminDashboardProps {
  user: User;
}

interface AuditLog {
  id: string;
  time: string;
  user: string;
  action: string;
  module: string;
  ip: string;
  status: 'success' | 'failed';
  motivo: string;
}

interface ReservaEspacio {
  id: string;
  type: 'laboratorio' | 'aula';
  resource: string;
  resourceId?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'cancelled';
  motivo?: string;
  ciclo?: string;
  curso?: string;
  solicitante?: string;
  solicitanteEmail?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [activeModule, setActiveModule] = useState<'labs' | 'schedules' | 'users' | 'audit' | 'reports' | 'reservas'>('labs');
  
  // Estado de auditoría
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: '1', time: '10:23:45', user: 'admin', action: 'Login', module: 'Auth', ip: '192.168.1.100', status: 'success', motivo: 'Acceso al sistema' },
    { id: '2', time: '10:22:12', user: '2023077282', action: 'Crear Reserva', module: 'Reservas', ip: '192.168.1.105', status: 'success', motivo: 'Reserva de LAB-01' },
    { id: '3', time: '10:20:03', user: 'unknown', action: 'Login', module: 'Auth', ip: '192.168.1.200', status: 'failed', motivo: 'Credenciales inválidas' },
  ]);

  // Estado de reservas
  const [reservas, setReservas] = useState<ReservaEspacio[]>([]);

  // Cargar reservas desde localStorage
  useEffect(() => {
    const loadReservas = () => {
      const reservasPendientes = JSON.parse(localStorage.getItem('reservas_pendientes') || '[]');
      setReservas(reservasPendientes);
    };
    
    loadReservas();
    const interval = setInterval(loadReservas, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
      if (isBackendLoginType(user.user_metadata.login_type)) {
        await requestBackendLogout(user.id);
        localStorage.removeItem('backend_session');
      }
    localStorage.removeItem('admin_session');
    window.location.reload();
  };

  const addAuditLog = (user: string, action: string, module: string, status: 'success' | 'failed', motivo: string) => {
    const newLog: AuditLog = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('es-ES'),
      user,
      action,
      module,
      ip: '192.168.1.100',
      status,
      motivo
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const modules = [
    { id: 'labs' as const, name: 'Gestión de Espacios', icon: Server, color: 'blue' },
    { id: 'schedules' as const, name: 'Gestión de Horarios', icon: Clock, color: 'green' },
    { id: 'reservas' as const, name: 'Gestión de Reservas', icon: ClipboardList, color: 'indigo' },
    { id: 'users' as const, name: 'Gestión de Usuarios', icon: Users, color: 'purple' },
    { id: 'audit' as const, name: 'Auditoría del Sistema', icon: FileText, color: 'orange' },
    { id: 'reports' as const, name: 'Reportes y Estadísticas', icon: BarChart3, color: 'red' },
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div className="admin-header-left">
            <div className="admin-logo">
              <Server className="admin-logo-icon" />
            </div>
            <div>
              <h1 className="admin-title">Panel de Control Administrativo</h1>
              <p className="admin-subtitle">IntegraUPT - Sistema de Gestión</p>
            </div>
          </div>
          <div className="admin-header-right">
            <div className="admin-user-info">
              <p className="admin-user-name">{user.user_metadata.name}</p>
              <p className="admin-user-role">Administrador del Sistema</p>
            </div>
            <div className="admin-user-avatar">
              <span className="admin-avatar-text">
                {user.user_metadata.name?.charAt(0) || 'A'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="admin-logout-btn"
            >
              <LogOut className="admin-logout-icon" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="admin-main-container">
        {/* Módulos Grid */}
        <div className="admin-modules-grid">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`admin-module-card ${isActive ? 'admin-module-active' : ''}`}
              >
                <div className={`admin-module-icon admin-module-${module.color}`}>
                  <Icon className="admin-module-icon-svg" />
                </div>
                <h3 className="admin-module-title">{module.name}</h3>
                <p className="admin-module-description">
                  {module.id === 'labs' && 'Administrar aulas y laboratorios'}
                  {module.id === 'schedules' && 'Configurar horarios académicos'}
                  {module.id === 'reservas' && 'Aprobar o rechazar reservas'}
                  {module.id === 'users' && 'Gestionar accesos y permisos'}
                  {module.id === 'audit' && 'Revisar logs del sistema'}
                  {module.id === 'reports' && 'Generar informes y análisis'}
                </p>
              </button>
            );
          })}
        </div>

        {/* Contenido del Módulo Activo */}
        <div className="admin-content">
          {/* Gestión de Espacios */}
          {activeModule === 'labs' && (
            <GestionEspacios onAuditLog={addAuditLog} />
          )}

          {/* Gestión de Horarios - Puedes crear GestionHorarios.tsx después */}
          {activeModule === 'schedules' && (              
            <GestionHorarios onAuditLog={addAuditLog} />            
          )}

          {/* Gestión de Reservas - Puedes crear GestionReservas.tsx después */}
          {activeModule === 'reservas' && (
            <div className="admin-content">
             <GestionReservas onAuditLog={addAuditLog} />
           </div>
          )}

          {/* Gestión de Usuarios - Puedes crear GestionUsuarios.tsx después */}
          {activeModule === 'users' && (
            <GestionUsuarios onAuditLog={addAuditLog} />
          )}

          {/* Auditoría del Sistema - Puedes crear AuditoriaSistema.tsx después */}
          {activeModule === 'audit' && (
            <AuditoriaReserva onAuditLog={addAuditLog} />
          )}

          {/* Reportes y Estadísticas - Puedes crear ReportesEstadisticas.tsx después */}
          {activeModule === 'reports' && (
            <ReportesEstadisticas onAuditLog={addAuditLog} />
          )}
        </div>
      </div>
    </div>
  );
};