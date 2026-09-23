import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Repository } from '../../models/repository';
import { RepositoryManager } from '../../services/RepositoryManager';
import { ExtensionCard } from '../../components/extensions/ExtensionCard';
import { LazyImage } from '../../components/common/LazyImage';
import { Badge } from '../../components/common/Badge';
import { ToastContainer } from '../../components/common/Toast';
import type { ToastMessage } from '../../components/common/Toast';
import {
  FolderGit2,
  RefreshCw,
  Search,
  Layers,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

export const RepositoryDetailsPage: React.FC = () => {
  const { repoId } = useParams<{ repoId: string }>();
  const navigate = useNavigate();

  const [repository, setRepository] = useState<Repository | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 7);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const repoManager = RepositoryManager.getInstance();
    const update = () => {
      if (repoId) {
        setRepository(repoManager.getRepository(repoId));
      }
    };
    update();
    return repoManager.subscribe(update);
  }, [repoId]);

  const handleRefresh = async () => {
    if (!repository || isRefreshing) return;
    setIsRefreshing(true);
    const repoManager = RepositoryManager.getInstance();
    try {
      await repoManager.refreshRepository(repository.id);
      addToast('success', `"${repository.name}" refreshed.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Refresh failed';
      addToast('error', `Failed to refresh: ${msg}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const availableLanguages = useMemo(() => {
    if (!repository) return [];
    const set = new Set<string>();
    for (const ext of repository.extensions) {
      if (ext.language) set.add(ext.language);
    }
    return Array.from(set).sort();
  }, [repository]);

  const filteredExtensions = useMemo(() => {
    if (!repository) return [];
    let list = repository.extensions;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (ext) =>
          ext.name.toLowerCase().includes(q) ||
          ext.internalName.toLowerCase().includes(q) ||
          ext.description.toLowerCase().includes(q) ||
          ext.authors.some((author) => author.toLowerCase().includes(q))
      );
    }

    if (selectedLanguage !== 'ALL') {
      list = list.filter((ext) => ext.language === selectedLanguage);
    }

    return list;
  }, [repository, searchQuery, selectedLanguage]);

  if (!repository) {
    return (
      <div className="page-container">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => navigate('/settings/extensions')}
          style={{ alignSelf: 'flex-start', marginBottom: 'var(--space-md)' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Extensions</span>
        </button>

        <div className="empty-state">
          <div className="empty-state-icon">
            <AlertCircle size={24} />
          </div>
          <h3 className="empty-state-title">Repository Not Found</h3>
          <p className="empty-state-text">
            The requested repository does not exist or may have been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header: ← Repository Name */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-lg)',
          flexWrap: 'wrap',
          gap: 'var(--space-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
          <button
            type="button"
            className="btn-icon"
            onClick={() => navigate('/settings/extensions')}
            aria-label="Back to Extensions"
            style={{ marginRight: '2px' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{repository.name}</h2>
            <div className="repo-url-display" style={{ maxWidth: '380px' }} title={repository.url}>
              {repository.url}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleRefresh}
          disabled={isRefreshing || repository.status === 'syncing'}
          title="Refresh repository"
        >
          <RefreshCw
            size={14}
            className={isRefreshing || repository.status === 'syncing' ? 'spinner' : ''}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Repository Meta Box */}
      <div
        className="card"
        style={{
          marginBottom: 'var(--space-xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
          <div className="repo-icon-box" style={{ width: 48, height: 48 }}>
            <LazyImage
              src={repository.iconUrl}
              alt={repository.name}
              fallbackIcon={FolderGit2}
              width={48}
              height={48}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            {repository.description ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.45 }}>
                {repository.description}
              </p>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No description provided by repository.
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              <Badge variant="accent">
                {repository.extensions.length}{' '}
                {repository.extensions.length === 1 ? 'extension' : 'extensions'}
              </Badge>

              <Badge variant="neutral">Manifest v{repository.manifestVersion}</Badge>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Updated {formatRelativeTime(repository.lastSyncedAt)}
              </span>

              {repository.error && (
                <Badge variant="danger" icon={<AlertCircle size={11} />}>
                  {repository.error}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Available Extensions Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-xs)',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Available Extensions</h3>

          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Showing {filteredExtensions.length} of {repository.extensions.length}
          </span>
        </div>

        {/* Search & Filter */}
        {repository.extensions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-text"
                placeholder="Search extensions by name or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px' }}
              />
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {availableLanguages.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  overflowX: 'auto',
                  paddingBottom: '2px',
                }}
              >
                <button
                  type="button"
                  className={`btn ${selectedLanguage === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ height: '28px', padding: '0 10px', fontSize: '0.72rem' }}
                  onClick={() => setSelectedLanguage('ALL')}
                >
                  All
                </button>
                {availableLanguages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    className={`btn ${selectedLanguage === lang ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ height: '28px', padding: '0 10px', fontSize: '0.72rem' }}
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Extensions List */}
        {filteredExtensions.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-2xl) var(--space-md)' }}>
            <div className="empty-state-icon">
              <Layers size={22} />
            </div>
            <h4 className="empty-state-title">
              {repository.extensions.length === 0
                ? 'No extensions found'
                : 'No matching extensions'}
            </h4>
            <p className="empty-state-text">
              {repository.extensions.length === 0
                ? 'This repository does not contain any extensions.'
                : 'Try adjusting your search query or language filter.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {filteredExtensions.map((ext) => (
              <ExtensionCard key={ext.id} extension={ext} />
            ))}
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
