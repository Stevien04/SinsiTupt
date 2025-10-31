import React from 'react';
import { supabase } from '../utils/supabase/client';
import { IntegraUPTApp } from './IntegraUPT/IntegraUPTApp';
import { AdminDashboard } from './AdminDashboard';

interface User {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    avatar_url: string;
    role?: string;
    login_type?: string;
    codigo?: string;
  };
}

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const isAcademic = user.user_metadata.login_type === 'academic';
  const isAdministrative = user.user_metadata.login_type === 'administrative';

  // Si es usuario académico, ir directo a IntegraUPT Home
  if (isAcademic) {
    return <IntegraUPTApp user={user} initialSection="home" />;
  }

  // Si es usuario administrativo, mostrar solo el panel administrativo
  if (isAdministrative) {
    return <AdminDashboard user={user} />;
  }

  // Fallback para otros tipos de usuarios
  return <IntegraUPTApp user={user} initialSection="home" />;
};
