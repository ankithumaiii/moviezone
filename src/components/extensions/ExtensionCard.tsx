import React, { useState, useEffect } from 'react';
import type { Extension } from '../../models/repository';
import { ProviderManager } from '../../services/ProviderManager';
import { LazyImage } from '../common/LazyImage';
import { Badge } from '../common/Badge';
import { Layers, DownloadCloud, Check } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

interface ExtensionCardProps {
  extension: Extension;
  onStatusChange?: () => void;
}

export const ExtensionCard: React.FC<ExtensionCardProps> = ({ extension, onStatusChange }) => {
  const providerManager = ProviderManager.getInstance();

  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    return extension.isWebCompatible &&
      (providerManager.isInstalled(extension.internalName) || providerManager.isInstalled(extension.name));
  });

  useEffect(() => {
    const updateStatus = () => {
      setIsInstalled(
        extension.isWebCompatible &&
        (providerManager.isInstalled(extension.internalName) || providerManager.isInstalled(extension.name))
      );
    };

    updateStatus();
    const unsub = providerManager.subscribe(updateStatus);
    return () => unsub();
  }, [extension, providerManager]);

  const handleInstallToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isInstalled) {
      providerManager.uninstallProvider(extension.internalName || extension.name);
      setIsInstalled(false);
    } else {
      const success = providerManager.installProvider(extension.internalName || extension.name);
      if (success) {
        setIsInstalled(true);
      }
    }

    if (onStatusChange) {
      onStatusChange();
    }
  };

  const getStatusBadge = () => {
    switch (extension.status) {
      case 'ok':
        return <Badge variant="ok">Active</Badge>;
      case 'slow':
        return <Badge variant="slow">Slow</Badge>;
      case 'beta':
        return <Badge variant="beta">Beta</Badge>;
      case 'down':
        return <Badge variant="danger">Down</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="extension-card" role="article" aria-label={extension.name}>
      <div className="extension-icon-box">
        <LazyImage
          src={extension.iconUrl}
          alt={extension.name}
          fallbackIcon={Layers}
          width={42}
          height={42}
        />
      </div>

      <div className="extension-details" style={{ flex: 1 }}>
        <div
          className="extension-title-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <h4 className="extension-name" style={{ margin: 0 }}>
              {extension.name}
            </h4>
            <Badge variant="neutral">v{extension.version}</Badge>
            <Badge variant="accent">{extension.language}</Badge>
            {getStatusBadge()}
          </div>

          {/* Web Compatibility & Install Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!extension.isWebCompatible ? (
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                  whiteSpace: 'nowrap',
                }}
              >
                Web implementation unavailable
              </span>
            ) : (
              <>
                <Badge variant="ok">Web Compatible</Badge>
                {isInstalled ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleInstallToggle}
                    style={{
                      height: '30px',
                      padding: '0 10px',
                      fontSize: '0.75rem',
                      gap: '5px',
                      borderColor: 'var(--accent-border)',
                    }}
                    title="Click to uninstall"
                  >
                    <Check size={13} color="var(--accent-primary)" />
                    <span>Installed</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleInstallToggle}
                    style={{ height: '30px', padding: '0 12px', fontSize: '0.75rem', gap: '5px' }}
                  >
                    <DownloadCloud size={13} />
                    <span>Install</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {extension.description && (
          <p className="extension-desc">{extension.description}</p>
        )}

        <div className="extension-tags">
          {extension.tvTypes.map((type) => (
            <Badge key={type} variant="neutral">
              {type}
            </Badge>
          ))}

          {extension.fileSize && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {formatBytes(extension.fileSize)}
            </span>
          )}

          {extension.authors.length > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              by {extension.authors.join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
