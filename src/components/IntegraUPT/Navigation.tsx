import React from 'react';
import { GraduationCap, Home, Calendar, User, LogOut, ArrowLeft, Briefcase } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { isBackendLoginType } from '../../utils/apiConfig';
import { requestBackendLogout } from '../../utils/logout';
import './../../styles/Navigation.css';

interface NavigationProps {
  user: {
    id: string;
    email: string;
    user_metadata: {
      name: string;
      avatar_url: string;
      role?: string;
      login_type?: string;
    };
  };
  currentSection: 'home' | 'servicios' | 'eventos' | 'perfil';
  onSectionChange?: (section: 'home' | 'servicios' | 'eventos' | 'perfil') => void;
  onBackToDashboard?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  user, 
  currentSection,
  onSectionChange,
  onBackToDashboard
}) => {
  const handleLogout = async () => {
     const loginType = user.user_metadata.login_type;
        if (isBackendLoginType(loginType)) {
          await requestBackendLogout(user.id);
          localStorage.removeItem('backend_session');
      localStorage.removeItem('admin_session');
      window.location.reload();
      return;
    }
  localStorage.removeItem('backend_session');
    await supabase.auth.signOut();
  };

  const handleSectionClick = (section: 'home' | 'servicios' | 'eventos' | 'perfil') => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'servicios', label: 'Servicios', icon: Briefcase },
    // { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'perfil', label: 'Mi Perfil', icon: User },
  ];

  return (
    <nav className="navigation">
      <div className="navigation-container">
        <div className="navigation-content">
          {/* Logo y título */}
          <div className="navigation-logo">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="navigation-back-btn"
                title="Volver al Dashboard"
              >
                <ArrowLeft className="navigation-back-icon" />
              </button>
            )}
            <div className="navigation-logo-icon">
              <GraduationCap className="navigation-logo-svg" />
            </div>
            <div className="navigation-title">
              <h1 className="navigation-app-name">IntegraUPT</h1>
              <p className="navigation-app-subtitle">PREGRADO</p>
            </div>
          </div>

          {/* Navegación central - Desktop */}
          <div className="navigation-desktop">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id as any)}
                  className={`navigation-item ${isActive ? 'navigation-item-active' : 'navigation-item-inactive'}`}
                >
                  <Icon className="navigation-item-icon" />
                  <span className="navigation-item-label">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Usuario y logout */}
          <div className="navigation-user">
            <div className="navigation-user-info">
              {user.user_metadata.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="navigation-avatar"
                />
              ) : (
                <div className="navigation-avatar-placeholder">
                  <User className="navigation-avatar-icon" />
                </div>
              )}
              <span className="navigation-user-name">
                {user.user_metadata.name || user.email}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="navigation-logout-btn"
            >
              <LogOut className="navigation-logout-icon" />
              <span className="navigation-logout-text">Salir</span>
            </button>
          </div>
        </div>

        {/* Navegación móvil */}
        <div className="navigation-mobile">
          <div className="navigation-mobile-container">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id as any)}
                  className={`navigation-mobile-item ${isActive ? 'navigation-mobile-item-active' : 'navigation-mobile-item-inactive'}`}
                >
                  <Icon className="navigation-mobile-icon" />
                  <span className="navigation-mobile-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};