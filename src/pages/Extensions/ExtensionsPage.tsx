import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Repository } from '../../models/repository';
import { RepositoryManager } from '../../services/RepositoryManager';
import { RepositoryCard } from '../../components/extensions/RepositoryCard';
import { AddRepositoryModal } from '../../components/extensions/AddRepositoryModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ToastContainer } from '../../components/common/Toast';
import type { ToastMessage } from '../../components/common/Toast';
import { Plus, ArrowLeft, FolderGit2 } from 'lucide-react';

export const ExtensionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [repoToDelete, setRepoToDelete] = useState<Repository | null>(null);
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
      setRepositories(repoManager.getRepositories());
    };
    update();
    return repoManager.subscribe(update);
  }, []);

  const handleRefreshRepo = async (repo: Repository) => {
    const repoManager = RepositoryManager.getInstance();
    try {
      await repoManager.refreshRepository(repo.id);
      addToast('success', `"${repo.name}" refreshed successfully.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Refresh failed';
      addToast('error', `Failed to refresh "${repo.name}": ${msg}`);
    }
  };

  const handleConfirmDelete = () => {
    if (!repoToDelete) return;
    const repoManager = RepositoryManager.getInstance();
    const name = repoToDelete.name;
    const success = repoManager.deleteRepository(repoToDelete.id);
    if (success) {
      addToast('info', `Removed "${name}".`);
    }
    setRepoToDelete(null);
  };

  return (
    <div className="page-container">
      {/* Top Header with Back button, Title, Subtitle, and Add Action */}
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
            onClick={() => navigate('/settings')}
            aria-label="Back to Settings"
            style={{ marginRight: '2px' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Extensions</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Manage your provider repositories
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
          id="add-repository-btn"
        >
          <Plus size={15} />
          <span>Add Repository</span>
        </button>
      </div>

      {/* Repositories List or Tasteful Empty State */}
      {repositories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FolderGit2 size={24} />
          </div>
          <h3 className="empty-state-title">No repositories yet</h3>
          <p className="empty-state-text">
            Add a compatible repository to get started.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsAddModalOpen(true)}
            style={{ marginTop: 'var(--space-sm)' }}
          >
            <Plus size={15} />
            <span>Add Repository</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {repositories.map((repo) => (
            <RepositoryCard
              key={repo.id}
              repository={repo}
              onRefresh={handleRefreshRepo}
              onDelete={(r) => setRepoToDelete(r)}
            />
          ))}
        </div>
      )}

      {/* Add Repository Modal */}
      <AddRepositoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(name) => {
          addToast('success', `Repository "${name}" added successfully.`);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={repoToDelete !== null}
        onClose={() => setRepoToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Repository"
        message={`Are you sure you want to remove "${repoToDelete?.name}"? Its metadata and cached extensions will be deleted. You can re-add it at any time.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDestructive={true}
      />

      {/* Toast Feedback Messages */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
