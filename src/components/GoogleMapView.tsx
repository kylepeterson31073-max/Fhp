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
}) => {
  const [activeMarkerResource, setActiveMarkerResource] = useState<Resource | null>(null);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

  // Center coordinate
  const defaultCenter = userCoords || { lat: 47.6062, lng: -122.3321 }; // Seattle default
  const currentCenter = selectedResource 
    ? { lat: selectedResource.lat, lng: selectedResource.lng }
    : defaultCenter;

  const displayedResources = filterVerifiedOnly
    ? resources.filter((r) => r.verificationTier === 'verified' || r.verificationTier === 'community_verified' || r.verified)
    : resources;

  // Google Maps API Key from environment or public Maps Demo Key
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  return (
    <div className="relative w-full h-[550px] sm:h-[650px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex flex-col">
      
      {/* Floating Filter Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-col gap-2 pointer-events-none">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-2 pointer-events-auto flex-wrap">
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={onGetUserLocation}
              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              title="Locate Me (GPS)"
            >
              <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">My Location</span>
            </button>

            <button
              onClick={onTogglePetFriendly}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                filterPetFriendly
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Dog className="w-3.5 h-3.5" />
              <span>Pet-Friendly</span>
            </button>

            <button
              onClick={onToggleBedsOnly}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                filterBedsOnly
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Bed className="w-3.5 h-3.5" />
              <span>Open Beds</span>
            </button>

            {onToggleVerifiedOnly && (
              <button
                onClick={onToggleVerifiedOnly}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  filterVerifiedOnly
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Verified</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Spot</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="pointer-events-auto flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar bg-white/90 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Resources ({resources.length})
          </button>
          {Object.entries(CATEGORY_COLORS).map(([cat, config]) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 transition ${
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
      <APIProvider apiKey={apiKey}>
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
