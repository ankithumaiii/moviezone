import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/Home/HomePage';
import { SearchPage } from './pages/Search/SearchPage';
import { MediaDetailsPage } from './pages/Details/MediaDetailsPage';
import { WatchPage } from './pages/Watch/WatchPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { ExtensionsPage } from './pages/Extensions/ExtensionsPage';
import { RepositoryDetailsPage } from './pages/RepositoryDetails/RepositoryDetailsPage';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="media/:id" element={<MediaDetailsPage />} />
          <Route path="watch/:id" element={<WatchPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/extensions" element={<ExtensionsPage />} />
          <Route path="settings/extensions/:repoId" element={<RepositoryDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
