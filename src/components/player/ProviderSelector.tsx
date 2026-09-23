import React, { useState } from 'react';
import { ProviderManager } from '../../services/ProviderManager';
import { Layers, Check, ChevronDown } from 'lucide-react';
import { Modal } from '../common/Modal';

interface ProviderSelectorProps {
  selectedProviderId?: string;
  onSelectProvider?: (providerId: string) => void;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  selectedProviderId,
  onSelectProvider,
}) => {
  const providerManager = ProviderManager.getInstance();
  const providers = providerManager.getAvailableProviders();
  const activeId = selectedProviderId || providerManager.getActiveProviderId();
  const currentProvider = providers.find((p) => p.id === activeId) || providers[0];

  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: string) => {
    providerManager.setActiveProvider(id);
    if (onSelectProvider) {
      onSelectProvider(id);
    }
    setIsOpen(false);
  };

  return (
    <>
      <div
        className="details-provider-box card-interactive"
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsOpen(true);
          }
        }}
        aria-label="Select playback provider"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}
          >
            <Layers size={16} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Playback Provider</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentProvider?.name || 'Default Provider'}
            </span>
          </div>
        </div>

        <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Select Media Provider"
        subtitle="Choose which provider will resolve and play video streams"
        maxWidth="420px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
          {providers.map((p) => {
            const isSelected = p.id === activeId;
            return (
              <div
                key={p.id}
                onClick={() => handleSelect(p.id)}
                role="button"
                tabIndex={0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--accent-surface)' : 'var(--bg-surface)',
                  border: isSelected ? '1px solid var(--accent-border)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {p.name}
                    </span>
                    {p.isDefault && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-surface-subtle)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        Default
                      </span>
                    )}
                  </div>
                  {p.description && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {p.description}
                    </span>
                  )}
                </div>

                {isSelected && <Check size={18} color="var(--accent-primary)" />}
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
};
