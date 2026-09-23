import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Settings, Compass } from 'lucide-react';

export const NavigationRail: React.FC = () => {
  return (
    <aside className="nav-rail" aria-label="Desktop navigation">
      <div className="nav-rail-brand" title="Ankit's World">
        <Compass size={24} />
      </div>

      <nav className="nav-rail-links">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `nav-rail-item ${isActive ? 'active' : ''}`
          }
          title="Home"
          end
        >
          <Home size={20} />
          <span className="nav-rail-label">Home</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-rail-item ${isActive ? 'active' : ''}`
          }
          title="Settings"
        >
          <Settings size={20} />
          <span className="nav-rail-label">Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
};
