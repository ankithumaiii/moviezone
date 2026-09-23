import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { RepositoryManager } from '../../services/RepositoryManager';
import { isValidHttpUrl } from '../../utils/url';
import { AlertCircle, Plus } from 'lucide-react';

interface AddRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (repoName: string) => void;
}

export const AddRepositoryModal: React.FC<AddRepositoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a repository URL.');
      return;
    }

    if (!isValidHttpUrl(trimmed)) {
      setError('Please enter a valid repository URL (must start with http:// or https://).');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const repoManager = RepositoryManager.getInstance();
      const repo = await repoManager.addRepository(trimmed);
      setUrl('');
      setIsLoading(false);
      onSuccess(repo.name);
      onClose();
    } catch (err) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : 'Failed to add repository.';
      setError(message);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setError(null);
    setUrl('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Repository"
      subtitle="Enter the URL of a compatible repository."
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSubmit()}
            disabled={isLoading || !url.trim()}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                <span>Adding repository...</span>
              </>
            ) : (
              <>
                <Plus size={15} />
                <span>Add Repository</span>
              </>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="repo-url-input" className="form-label">
            Repository URL
          </label>
          <input
            id="repo-url-input"
            type="url"
            className="input-text"
            placeholder="https://..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          {error && (
            <div className="input-error-msg" role="alert">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
