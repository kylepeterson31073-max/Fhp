import React, { useState, useEffect } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow,
  useMap 
} from '@vis.gl/react-google-maps';
import { Resource } from '../types';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Globe, 
  ShieldCheck, 
  ExternalLink, 
  Plus, 
  Crosshair,
  Layers,
  Dog,
  Bed,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface GoogleMapViewProps {
  resources: Resource[];
  selectedResource: Resource | null;
  onSelectResource: (resource: Resource) => void;
  userCoords: { lat: number; lng: number } | null;
  onGetUserLocation: () => void;
  onOpenAddModal: () => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  filterPetFriendly: boolean;
  onTogglePetFriendly: () => void;
  filterBedsOnly: boolean;
  onToggleBedsOnly: () => void;
  filterVerifiedOnly?: boolean;
  onToggleVerifiedOnly?: () => void;
  onSwitchToOsm?: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; glyph: string }> = {
  shelter: { bg: '#3b82f6', border: '#1d4ed8', glyph: '🛏️' },
  food: { bg: '#f59e0b', border: '#b45309', glyph: '🍱' },
  medical: { bg: '#ef4444', border: '#b91c1c', glyph: '🩺' },
  vet: { bg: '#0d9488', border: '#0f766e', glyph: '🐾' },
  legal: { bg: '#8b5cf6', border: '#6d28d9', glyph: '⚖️' },
  hygiene: { bg: '#06b6d4', border: '#0891b2', glyph: '🚿' },
  warming_cooling: { bg: '#f97316', border: '#c2410c', glyph: '🌡️' },
  mental_health: { bg: '#10b981', border: '#047857', glyph: '💚' },
  id_assistance: { bg: '#64748b', border: '#334155', glyph: '🪪' },
  job_training: { bg: '#475569', border: '#1e293b', glyph: '💼' },
};

// Sub-component to manage map pan/zoom dynamically
const MapController: React.FC<{
  center: { lat: number; lng: number };
  zoom: number;
}> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [center, zoom, map]);
  return null;
};

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  resources,
  selectedResource,
  onSelectResource,
  userCoords,
  onGetUserLocation,
  onOpenAddModal,
  activeCategory,
  onSelectCategory,
  filterPetFriendly,
  onTogglePetFriendly,
  filterBedsOnly,
  onToggleBedsOnly,
  filterVerifiedOnly = false,
  onToggleVerifiedOnly,
  onSwitchToOsm,
}) => {
  const [activeMarkerResource, setActiveMarkerResource] = useState<Resource | null>(null);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [customKey, setCustomKey] = useState<string>(() => {
    return (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || localStorage.getItem('daisy_gmaps_key') || '';
  });
  const [keyInput, setKeyInput] = useState('');
  const [hasMapError, setHasMapError] = useState(false);

  // Listen for Google Maps auth or project errors on window
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps auth failure detected. Please check API Key & Map ID.');
      setHasMapError(true);
    };
  }, []);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput.trim()) {
      localStorage.setItem('daisy_gmaps_key', keyInput.trim());
      setCustomKey(keyInput.trim());
      setHasMapError(false);
    }
  };

  // Center coordinate
  const defaultCenter = userCoords || { lat: 47.6062, lng: -122.3321 }; // Seattle default
  const currentCenter = selectedResource 
    ? { lat: selectedResource.lat, lng: selectedResource.lng }
    : defaultCenter;

  const displayedResources = filterVerifiedOnly
    ? resources.filter((r) => r.verificationTier === 'verified' || r.verificationTier === 'community_verified' || r.verified)
    : resources;

  const effectiveApiKey = customKey.trim();

  // If no API key is provided or if an auth error occurred, show helpful fallback screen
  if (!effectiveApiKey || hasMapError) {
    return (
      <div className="relative w-full h-full min-h-[340px] flex-1 overflow-hidden flex flex-col items-center justify-center bg-slate-900 text-white p-4 sm:p-6 text-center">
        <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <MapPin className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Google Maps Platform Setup</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {hasMapError 
                ? 'Google Maps encountered an authorization or project configuration error (ApiProjectMapError).'
                : 'To render Google Maps (Satellite, Advanced Markers & Traffic), provide a Google Maps API Key or free Maps Demo Key.'}
            </p>
          </div>

          {/* Quick Fallback to OpenStreetMap */}
          <div className="pt-1">
            <button
              onClick={() => {
                if (onSwitchToOsm) {
                  onSwitchToOsm();
                }
              }}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Use Free OpenStreetMap (No Key Needed)</span>
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-slate-400">or connect your Google Maps key</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          {/* Key Input Form */}
          <form onSubmit={handleSaveKey} className="space-y-2">
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Paste API Key (AIzaSy...)"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!keyInput.trim()}
                className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition"
              >
                Apply
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-left">
              Get a zero-cost prototyping key:{' '}
              <a 
                href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio" 
                target="_blank" 
                rel="noreferrer" 
                className="text-indigo-400 hover:underline inline-flex items-center gap-0.5"
              >
                Maps Demo Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[340px] flex-1 overflow-hidden flex flex-col">
      
      {/* Floating Filter Bar */}
      <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-1.5 pointer-events-auto flex-wrap min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-xs p-1 sm:p-1.5 rounded-xl border border-slate-200 shadow-xs flex-wrap">
            <button
              onClick={onGetUserLocation}
              className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition"
              title="Locate Me (GPS)"
            >
              <Crosshair className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="hidden xs:inline">My GPS</span>
            </button>

            <button
              onClick={onTogglePetFriendly}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition ${
                filterPetFriendly
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Dog className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">Pet Friendly</span>
              <span className="xs:hidden">Pets</span>
            </button>

            <button
              onClick={onToggleBedsOnly}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition ${
                filterBedsOnly
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Bed className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">Open Beds</span>
              <span className="xs:hidden">Beds</span>
            </button>

            {onToggleVerifiedOnly && (
              <button
                onClick={onToggleVerifiedOnly}
                className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition ${
                  filterVerifiedOnly
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Verified</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 sm:p-1.5 rounded-xl border border-slate-200 shadow-xs shrink-0">
            <button
              onClick={onOpenAddModal}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Report Spot</span>
              <span className="sm:hidden">Report</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="pointer-events-auto flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar bg-white/90 backdrop-blur-xs p-1 sm:p-1.5 rounded-xl border border-slate-200 shadow-xs max-w-full">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({resources.length})
          </button>
          {Object.entries(CATEGORY_COLORS).map(([cat, config]) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 transition shrink-0 ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{config.glyph}</span>
              <span className="capitalize">{cat.replace('_', ' ')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Google Maps View via @vis.gl/react-google-maps */}
      <APIProvider apiKey={effectiveApiKey}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
        >
          <MapController center={currentCenter} zoom={selectedResource ? 15 : 13} />

          {/* User Location Marker */}
          {userCoords && (
            <AdvancedMarker position={userCoords} title="Your GPS Location">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-8 h-8 bg-indigo-500 rounded-full animate-ping opacity-40"></span>
                <div className="w-5 h-5 bg-indigo-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* Resource Markers */}
          {displayedResources.map((res) => {
            const colors = CATEGORY_COLORS[res.category] || { bg: '#0d9488', border: '#0f766e', glyph: '📍' };
            const isSelected = selectedResource?.id === res.id;

            return (
              <AdvancedMarker
                key={res.id}
                position={{ lat: res.lat, lng: res.lng }}
                onClick={() => {
                  setActiveMarkerResource(res);
                  onSelectResource(res);
                }}
                title={res.name}
              >
                <div className={`cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-40' : 'hover:scale-110'}`}>
                  <Pin
                    background={colors.bg}
                    borderColor={isSelected ? '#fbbf24' : colors.border}
                    glyphColor="#ffffff"
                    scale={isSelected ? 1.2 : 1.0}
                  >
                    <span className="text-xs leading-none">{colors.glyph}</span>
                  </Pin>
                  {res.bedsAvailable !== undefined && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-slate-900 text-amber-300 font-bold text-[9px] rounded-full border border-amber-300/40 shadow-xs whitespace-nowrap">
                      {res.bedsAvailable} beds
                    </div>
                  )}
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Info Window on Selected Pin */}
          {activeMarkerResource && (
            <InfoWindow
              position={{ lat: activeMarkerResource.lat, lng: activeMarkerResource.lng }}
              onCloseClick={() => setActiveMarkerResource(null)}
            >
              <div className="p-1 max-w-xs space-y-1.5 text-slate-900 font-sans">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="text-xs font-bold leading-tight">{activeMarkerResource.name}</h4>
                  {activeMarkerResource.petFriendly && (
                    <span className="px-1.5 py-0.5 bg-teal-100 text-teal-800 text-[9px] font-bold rounded shrink-0">
                      🐾 Pets OK
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2">{activeMarkerResource.description}</p>

                <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                  <p className="truncate">📍 {activeMarkerResource.address}</p>
                  {activeMarkerResource.phone && <p>📞 {activeMarkerResource.phone}</p>}
                  {activeMarkerResource.hours && <p>🕒 {activeMarkerResource.hours}</p>}
                </div>

                <div className="flex items-center gap-1 pt-1.5">
                  <button
                    onClick={() => onSelectResource(activeMarkerResource)}
                    className="w-full px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-semibold text-center shadow-2xs"
                  >
                    View Full Details & AI Dispatch
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Bottom attribution and status */}
      <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] text-slate-600 flex items-center gap-2 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Google Maps Platform Active ({displayedResources.length} locations)</span>
      </div>
    </div>
  );
};
