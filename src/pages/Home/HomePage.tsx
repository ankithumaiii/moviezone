import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProviderManager } from '../../services/ProviderManager';
import { WatchProgressManager } from '../../services/WatchProgressManager';
import type { MediaItem, CatalogSection, WatchProgress, ProviderInfo } from '../../models/media';
import { HeroBanner } from '../../components/media/HeroBanner';
import { MediaRail } from '../../components/media/MediaRail';
import { SearchBar } from '../../components/search/SearchBar';
import { HomeProviderSelector } from '../../components/player/HomeProviderSelector';
import { History, Flame, Film, Sparkles, Compass, PlusCircle, Layers, PlayCircle } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const providerManager = ProviderManager.getInstance();
  const progressManager = WatchProgressManager.getInstance();

  const [selectedProviderId, setSelectedProviderId] = useState<string>(() =>
    providerManager.getSelectedProviderId()
  );
  const [installedProviders, setInstalledProviders] = useState<ProviderInfo[]>(() =>
    providerManager.getInstalledProviders()
  );
  const [featured, setFeatured] = useState<MediaItem | undefined>(undefined);
  const [sections, setSections] = useState<CatalogSection[]>([]);
  const [continueWatching, setContinueWatching] = useState<MediaItem[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, WatchProgress>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const effectiveProvider = providerManager.getEffectiveProvider();

  useEffect(() => {
    const loadData = async () => {
      const currentSelected = providerManager.getSelectedProviderId();
      const currentInstalled = providerManager.getInstalledProviders();
      setSelectedProviderId(currentSelected);
      setInstalledProviders(currentInstalled);

      if (currentSelected === 'none') {
        setFeatured(undefined);
        setSections([]);
        setContinueWatching([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const feat = await providerManager.getFeatured();
        const catalog = await providerManager.getCatalog();
        setFeatured(feat);
        setSections(catalog);

        // Load Continue Watching
        const progressList = progressManager.getAll();
        const pMap = new Map<string, WatchProgress>();
        progressList.forEach((p) => pMap.set(p.mediaId, p));
        setProgressMap(pMap);

        const items: MediaItem[] = [];
        for (const p of progressList) {
          const details = await providerManager.getDetails(p.mediaId);
          if (details) {
            items.push(details);
          }
        }
        setContinueWatching(items);
      } catch (err) {
        console.error('[HomePage] Failed to load media catalog:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    const unsubProviders = providerManager.subscribe(loadData);
    const unsubProgress = progressManager.subscribe(loadData);

    return () => {
      unsubProviders();
      unsubProgress();
    };
  }, []);

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      const providerParam = selectedProviderId !== 'none' && selectedProviderId !== 'random' ? `&provider=${selectedProviderId}` : '';
      navigate(`/search?q=${encodeURIComponent(query.trim())}${providerParam}`);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1080px' }}>
      {/* Top Header Row with App Title & HomeProviderSelector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-md)',
          flexWrap: 'wrap',
          gap: 'var(--space-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-surface)',
              border: '1px solid var(--accent-border)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Compass size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
              ANKIT'S WORLD
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Your media world starts here.
            </p>
          </div>
        </div>

        {/* Home Provider Selector */}
        <HomeProviderSelector />
      </div>

      {/* When None is selected: Empty / Discovery prompt */}
      {selectedProviderId === 'none' ? (
        <div
          className="card"
          style={{
            padding: 'var(--space-2xl) var(--space-xl)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-md)',
            marginTop: 'var(--space-lg)',
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              backgroundColor: 'var(--accent-surface)',
              border: '1px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}
          >
            <Layers size={26} />
          </div>

          <div style={{ maxWidth: 460 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {installedProviders.length > 0
                ? 'Select a Provider to Start Watching'
                : 'No Media Provider Installed'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {installedProviders.length > 0
                ? 'You have web-compatible providers installed. Choose one using the provider selector above, or pick one below to explore movies and streams.'
                : 'Ankit’s World begins with zero repositories. Add a repository in Settings → Extensions and install a web-compatible provider to stream video.'}
            </p>
          </div>

          {installedProviders.length > 0 ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {installedProviders.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="btn btn-primary"
                  onClick={() => providerManager.setSelectedProviderId(p.id)}
                  style={{ gap: '6px' }}
                >
                  <PlayCircle size={15} />
                  <span>Use {p.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/settings/extensions')}
              style={{ gap: '6px' }}
            >
              <PlusCircle size={16} />
              <span>Go to Settings → Extensions</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Quick Search */}
          {effectiveProvider?.supportsSearch !== false && (
            <div onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(searchQuery)}>
              <SearchBar
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val);
                }}
                placeholder={`Search in ${effectiveProvider?.name || 'catalog'} (Press Enter)...`}
              />
            </div>
          )}

          {isLoading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-3xl) 0',
                gap: '12px',
              }}
            >
              <div className="spinner" style={{ width: 28, height: 28 }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Loading {effectiveProvider?.name || 'media'} catalog...
              </span>
            </div>
          ) : (
            <>
              {/* Featured Hero Banner */}
              {featured && <HeroBanner item={featured} />}

              {/* Continue Watching Rail (if any) */}
              {continueWatching.length > 0 && (
                <MediaRail
                  title="Continue Watching"
                  items={continueWatching}
                  progressMap={progressMap}
                  icon={<History size={18} color="var(--accent-primary)" />}
                />
              )}

              {/* Catalog Sections */}
              {sections.length === 0 && !featured ? (
                <div className="empty-state" style={{ padding: 'var(--space-2xl) 0' }}>
                  <Film size={28} color="var(--text-muted)" />
                  <h4 className="empty-state-title">No content available</h4>
                  <p className="empty-state-text">
                    This provider does not have any playable media items available right now.
                  </p>
                </div>
              ) : (
                sections.map((section, idx) => {
                  const icons = [
                    <Flame key="flame" size={18} color="var(--status-slow)" />,
                    <Film key="film" size={18} color="var(--accent-primary)" />,
                    <Sparkles key="sparkles" size={18} color="var(--status-beta)" />,
                  ];

                  return (
                    <MediaRail
                      key={section.id}
                      title={section.title}
                      items={section.items}
                      progressMap={progressMap}
                      icon={icons[idx % icons.length]}
                    />
                  );
                })
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
