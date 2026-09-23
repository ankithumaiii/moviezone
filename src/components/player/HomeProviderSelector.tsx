import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProviderManager } from '../../services/ProviderManager';
import type { ProviderInfo } from '../../models/media';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Layers, ChevronDown, Check, Shuffle, Ban, PlusCircle } from 'lucide-react';

export const HomeProviderSelector: React.FC = () => {
  const navigate = useNavigate();
  const providerManager = ProviderManager.getInstance();

  const [selectedId, setSelectedId] = useState<string>(() => providerManager.getSelectedProviderId());
  const [installedProviders, setInstalledProviders] = useState<ProviderInfo[]>(() =>
    providerManager.getInstalledProviders()
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateState = () => {
      setSelectedId(providerManager.getSelectedProviderId());
      setInstalledProviders(providerManager.getInstalledProviders());
    };

    updateState();
    const unsub = providerManager.subscribe(updateState);
    return () => unsub();
  }, [providerManager]);

  const handleSelect = (id: string) => {
    providerManager.setSelectedProviderId(id);
    setSelectedId(id);
    setIsOpen(false);
  };

  // Determine current label for button
  const getSelectedLabel = () => {
    if (selectedId === 'none') return 'None';
    if (selectedId === 'random') return 'Random';
    const found = installedProviders.find((p) => p.id === selectedId);
    return found ? found.name : 'None';
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setIsOpen(true)}
        style={{
          height: '34px',
          padding: '0 12px',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: selectedId !== 'none' ? 'var(--accent-surface)' : 'var(--bg-surface)',
          borderColor: selectedId !== 'none' ? 'var(--accent-border)' : 'var(--border-subtle)',
          color: selectedId !== 'none' ? 'var(--accent-primary)' : 'var(--text-secondary)',
        }}
        title="Select active content provider"
        aria-label="Select active content provider"
      >
        <Layers size={14} />
        <span>Provider: <strong>{getSelectedLabel()}</strong></span>
        <ChevronDown size={14} style={{ opacity: 0.7 }} />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Select Content Provider"
        subtitle="Choose which installed provider feeds your Home media catalog"
        maxWidth="440px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
          {/* None Option */}
          <div
            onClick={() => handleSelect('none')}
            role="button"
            tabIndex={0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: selectedId === 'none' ? 'var(--accent-surface)' : 'var(--bg-surface)',
              border: selectedId === 'none' ? '1px solid var(--accent-border)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <Ban size={16} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  None
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Clear active provider and show discovery guide
                </span>
              </div>
            </div>

            {selectedId === 'none' && <Check size={18} color="var(--accent-primary)" />}
          </div>

          {/* Random Option (Appears ONLY when >= 2 providers are installed) */}
          {installedProviders.length >= 2 && (
            <div
              onClick={() => handleSelect('random')}
              role="button"
              tabIndex={0}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: selectedId === 'random' ? 'var(--accent-surface)' : 'var(--bg-surface)',
                border: selectedId === 'random' ? '1px solid var(--accent-border)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#eab308',
                  }}
                >
                  <Shuffle size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    Random
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Shuffle content dynamically from installed providers
                  </span>
                </div>
              </div>

              {selectedId === 'random' && <Check size={18} color="var(--accent-primary)" />}
            </div>
          )}

          {/* Installed Providers List */}
          {installedProviders.map((provider) => {
            const isSelected = selectedId === provider.id;

            return (
              <div
                key={provider.id}
                onClick={() => handleSelect(provider.id)}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    <Layers size={16} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {provider.name}
                      </span>
                      <Badge variant="neutral">v{provider.version}</Badge>
                      {provider.supportsDownload && <Badge variant="ok">Downloadable</Badge>}
                    </div>
                    {provider.description && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                        {provider.description}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && <Check size={18} color="var(--accent-primary)" />}
              </div>
            );
          })}

          {/* If no providers installed */}
          {installedProviders.length === 0 && (
            <div
              style={{
                padding: '16px',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                marginTop: 'var(--space-xs)',
              }}
            >
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                No providers installed yet. Add a repository to discover and install web-compatible providers.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/settings/extensions');
                }}
                style={{ height: '32px', fontSize: '0.78rem', margin: '0 auto' }}
              >
                <PlusCircle size={14} />
                <span>Go to Extensions</span>
              </button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
