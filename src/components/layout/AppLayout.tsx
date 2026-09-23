import React from 'react';
import { Outlet } from 'react-router-dom';
import { NavigationRail } from './NavigationRail';
import { BottomNav } from './BottomNav';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-shell">
      <NavigationRail />

      <div className="app-main">
        <Outlet />
      </div>

      <BottomNav />
    </div>
  );
};
