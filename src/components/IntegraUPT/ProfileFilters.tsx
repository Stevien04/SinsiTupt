import React from 'react';
import { Filter } from 'lucide-react';
import './../../styles/ProfileFilters.css';

interface ProfileFiltersProps {
  careers: string[];
  skills: string[];
  selectedCareer: string;
  selectedSkill: string;
  onCareerChange: (career: string) => void;
  onSkillChange: (skill: string) => void;
}

export const ProfileFilters: React.FC<ProfileFiltersProps> = ({
  careers,
  skills,
  selectedCareer,
  selectedSkill,
  onCareerChange,
  onSkillChange,
}) => {
  return (
    <div className="profile-filters-container">
      <div className="profile-filters-header">
        <Filter className="profile-filters-icon" />
        <h3 className="profile-filters-title">Filtros</h3>
      </div>
      
      <div className="profile-filters-grid">
        {/* Filtro por carrera */}
        <div className="profile-filters-field">
          <label className="profile-filters-label">
            Carrera
          </label>
          <select
            value={selectedCareer}
            onChange={(e) => onCareerChange(e.target.value)}
            className="profile-filters-select"
          >
            <option value="all">Todas las carreras</option>
            {careers.map((career) => (
              <option key={career} value={career}>
                {career}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por habilidad */}
        <div className="profile-filters-field">
          <label className="profile-filters-label">
            Habilidad
          </label>
          <select
            value={selectedSkill}
            onChange={(e) => onSkillChange(e.target.value)}
            className="profile-filters-select"
          >
            <option value="all">Todas las habilidades</option>
            {skills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botón para limpiar filtros */}
      {(selectedCareer !== 'all' || selectedSkill !== 'all') && (
        <div className="profile-filters-clear-section">
          <button
            onClick={() => {
              onCareerChange('all');
              onSkillChange('all');
            }}
            className="profile-filters-clear-button"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};