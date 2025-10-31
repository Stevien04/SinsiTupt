import React, { useState } from 'react';
import { HomeScreen } from './HomeScreen';
import { ServiciosScreen } from './ServiciosScreen';
import { EventosScreen } from './EventosScreen';
import { PerfilScreen } from './PerfilScreen';
import './../../styles/IntegraUPTApp.css';

interface IntegraUPTAppProps {
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
  initialSection?: 'home' | 'servicios' | 'eventos' | 'perfil';
  onBackToDashboard?: () => void;
}

export const IntegraUPTApp: React.FC<IntegraUPTAppProps> = ({ 
  user, 
  initialSection = 'home',
  onBackToDashboard 
}) => {
  const [currentSection, setCurrentSection] = useState<'home' | 'servicios' | 'eventos' | 'perfil'>(initialSection);

  const handleSectionChange = (section: 'home' | 'servicios' | 'eventos' | 'perfil') => {
    setCurrentSection(section);
  };

  const renderCurrentSection = () => {
    const commonProps = {
      user,
      currentSection,
      onSectionChange: handleSectionChange,
      onBackToDashboard
    };

    switch (currentSection) {
      case 'home':
        return <HomeScreen {...commonProps} />;
      case 'servicios':
        return <ServiciosScreen {...commonProps} />;
      case 'eventos':
        return <EventosScreen {...commonProps} />;
      case 'perfil':
        return <PerfilScreen {...commonProps} />;
      default:
        return <HomeScreen {...commonProps} />;
    }
  };

  return (
    <div className="integra-app">
      {renderCurrentSection()}
    </div>
  );
};