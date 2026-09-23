import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? 'active' : ''}`
        }
        end
      >
        <Home size={22} />
        <span className="bottom-nav-label">Home</span>
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? 'active' : ''}`
        }
      >
        <Settings size={22} />
        <span className="bottom-nav-label">Settings</span>
      </NavLink>
    </nav>
  );
};
