import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search movies, trailers, and open cinema...',
  autoFocus = false,
}) => {
  return (
    <div className="search-bar-box">
      <Search size={18} className="search-icon-left" />

      <input
        type="text"
        className="search-input-field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        spellCheck={false}
        autoComplete="off"
      />

      {value && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};
