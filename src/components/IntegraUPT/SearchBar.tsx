import React from 'react';
import { Search, X } from 'lucide-react';
import './../../styles/SearchBar.css';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar-wrapper">
        <Search className="search-bar-icon" />
        <input
          type="text"
          placeholder="Buscar por nombre, carrera o habilidades..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-bar-input"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="search-bar-clear-button"
          >
            <X className="search-bar-clear-icon" />
          </button>
        )}
      </div>
    </div>
  );
};