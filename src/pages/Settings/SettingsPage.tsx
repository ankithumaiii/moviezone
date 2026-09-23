import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Blocks, ChevronRight } from 'lucide-react';
import { RepositoryManager } from '../../services/RepositoryManager';
import { Badge } from '../../components/common/Badge';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [repoCount, setRepoCount] = useState(0);

  useEffect(() => {
    const repoManager = RepositoryManager.getInstance();
    const update = () => {
      setRepoCount(repoManager.getRepositories().length);
    };
    update();
    return repoManager.subscribe(update);
  }, []);

  return (
    <div className="page-container">
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Settings</h2>
      </div>

      <div className="settings-group">
        <div
          className="settings-item"
          onClick={() => navigate('/settings/extensions')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/settings/extensions');
            }
          }}
          aria-label="Manage Extensions"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                flexShrink: 0,
              }}
            >
              <Blocks size={20} />
            </div>

            <div className="settings-item-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="settings-item-title">Extensions</span>
                {repoCount > 0 && (
                  <Badge variant="neutral">
                    {repoCount}
                  </Badge>
                )}
              </div>
              <span className="settings-item-desc">
                Manage repositories and extensions
              </span>
            </div>
          </div>

          <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
};
