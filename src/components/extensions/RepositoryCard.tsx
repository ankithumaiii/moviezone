import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Repository } from '../../models/repository';
import { LazyImage } from '../common/LazyImage';
import { Badge } from '../common/Badge';
import { FolderGit2, Trash2, RefreshCw, ChevronRight, AlertCircle } from 'lucide-react';

interface RepositoryCardProps {
  repository: Repository;
  onRefresh: (repo: Repository) => Promise<void>;
  onDelete: (repo: Repository) => void;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repository,
  onRefresh,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh(repository);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(repository);
  };

  const handleCardClick = () => {
    navigate(`/settings/extensions/${repository.id}`);
  };

  const extensionCount = repository.extensions.length;

  return (
    <div className="repo-card" role="article" aria-label={repository.name}>
      <div className="repo-card-header" onClick={handleCardClick}>
        <div className="repo-icon-box">
          <LazyImage
            src={repository.iconUrl}
            alt={repository.name}
            fallbackIcon={FolderGit2}
            width={44}
            height={44}
          />
        </div>

        <div className="repo-text-box">
          <div className="repo-name-row">
            <h3 className="repo-title">{repository.name}</h3>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </div>

          {repository.description && (
            <p className="repo-desc">{repository.description}</p>
          )}

          <div className="repo-url-display" title={repository.url}>
            {repository.url}
          </div>
        </div>
      </div>

      <div className="repo-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Badge variant="accent">
            {extensionCount} {extensionCount === 1 ? 'extension' : 'extensions'}
          </Badge>

          {repository.status === 'error' && (
            <Badge variant="danger" icon={<AlertCircle size={11} />}>
              Sync error
            </Badge>
          )}
        </div>

        <div className="repo-card-actions">
          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: '32px', padding: '0 10px', fontSize: '0.78rem' }}
            title="Refresh repository"
            onClick={handleRefresh}
            disabled={isRefreshing || repository.status === 'syncing'}
            aria-label={`Refresh ${repository.name}`}
          >
            <RefreshCw
              size={13}
              className={isRefreshing || repository.status === 'syncing' ? 'spinner' : ''}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-danger-ghost"
            style={{ height: '32px', padding: '0 10px', fontSize: '0.78rem' }}
            title="Delete repository"
            onClick={handleDelete}
            aria-label={`Delete ${repository.name}`}
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
