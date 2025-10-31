import React from 'react';
import { ProfileCard } from './ProfileCard';
import type { Profile } from './types';
import './../../styles/ProfileGrid.css';

interface ProfileGridProps {
  profiles: Profile[];
}

export const ProfileGrid: React.FC<ProfileGridProps> = ({ profiles }) => {
  if (profiles.length === 0) {
    return (
      <div className="profile-grid-empty">
        <div className="profile-grid-empty-icon">
          <svg className="profile-grid-empty-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <h3 className="profile-grid-empty-title">No se encontraron perfiles</h3>
        <p className="profile-grid-empty-message">Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="profile-grid-container">
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
};