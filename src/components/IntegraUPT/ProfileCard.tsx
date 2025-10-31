import React from 'react';
import { MapPin, Star, Users, Award } from 'lucide-react';
import type { Profile } from './types';
import './../../styles/ProfileCard.css';

interface ProfileCardProps {
  profile: Profile;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <div className="profile-card-container">
      {/* Header con foto de perfil */}
      <div className="profile-card-header">
        <div className="profile-card-header-content">
          <div className="profile-card-avatar-section">
            <div className="profile-card-avatar-container">
              <img
                src={profile.profileImage}
                alt={profile.name}
                className="profile-card-avatar"
              />
              {profile.isOnline && (
                <div className="profile-card-online-indicator"></div>
              )}
            </div>
            <div className="profile-card-user-info">
              <h3 className="profile-card-user-name">{profile.name}</h3>
              <p className="profile-card-career">{profile.career}</p>
              <div className="profile-card-location">
                <MapPin className="profile-card-location-icon" />
                <span>{profile.semester}° Semestre</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="profile-card-content">
        {/* Habilidades */}
        <div className="profile-card-section">
          <h4 className="profile-card-section-title">
            <Star className="profile-card-section-icon profile-card-skills-icon" />
            Habilidades
          </h4>
          <div className="profile-card-skills-container">
            {profile.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="profile-card-skill"
              >
                {skill}
              </span>
            ))}
            {profile.skills.length > 3 && (
              <span className="profile-card-skill-more">
                +{profile.skills.length - 3} más
              </span>
            )}
          </div>
        </div>

        {/* Intereses */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="profile-card-section">
            <h4 className="profile-card-section-title">Intereses</h4>
            <p className="profile-card-interests">{profile.interests.join(', ')}</p>
          </div>
        )}

        {/* Logros */}
        {profile.achievements && profile.achievements.length > 0 && (
          <div className="profile-card-section">
            <h4 className="profile-card-section-title">
              <Award className="profile-card-section-icon profile-card-achievements-icon" />
              Logros Destacados
            </h4>
            <ul className="profile-card-achievements-list">
              {profile.achievements.slice(0, 2).map((achievement, index) => (
                <li key={index} className="profile-card-achievement-item">
                  <span className="profile-card-achievement-bullet"></span>
                  <span className="profile-card-achievement-text">{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Equipos/Clubes */}
        {profile.teams && profile.teams.length > 0 && (
          <div className="profile-card-section">
            <h4 className="profile-card-section-title">
              <Users className="profile-card-section-icon profile-card-teams-icon" />
              Equipos/Clubes
            </h4>
            <div className="profile-card-teams-container">
              {profile.teams.slice(0, 2).map((team, index) => (
                <span
                  key={index}
                  className="profile-card-team"
                >
                  {team}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Botón de contacto */}
        <div className="profile-card-footer">
          <button className="profile-card-button">
            Ver Perfil Completo
          </button>
        </div>
      </div>
    </div>
  );
};