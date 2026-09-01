import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Resource, ResourceCategory } from '../types';
import { 
  Navigation, 
  MapPin, 
  Filter, 
  Search, 
  Dog, 
  Bed, 
  Clock, 
  Layers, 
  ShieldCheck,
  Plus,
  Crosshair,
  ExternalLink,
  Phone,
  X
} from 'lucide-react';

interface MapViewProps {
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

const CATEGORY_EMOJIS: Record<string, string> = {
  shelter: '🛏️',
  food: '🍱',
  medical: '🩺',
  vet: '🐾',
  legal: '⚖️',
  hygiene: '🚿',
  warming_cooling: '🌡️',
  mental_health: '💚',
  id_assistance: '🪪',
  job_training: '💼',
};

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  shelter: { bg: '#3b82f6', border: '#1d4ed8', text: '#ffffff' },
  food: { bg: '#f59e0b', border: '#b45309', text: '#ffffff' },
  medical: { bg: '#ef4444', border: '#b91c1c', text: '#ffffff' },
  vet: { bg: '#0d9488', border: '#0f766e', text: '#ffffff' }, // Teal for Daisy's vet
  legal: { bg: '#8b5cf6', border: '#6d28d9', text: '#ffffff' },
  hygiene: { bg: '#06b6d4', border: '#0891b2', text: '#ffffff' },
  warming_cooling: { bg: '#f97316', border: '#c2410c', text: '#ffffff' },
  mental_health: { bg: '#10b981', border: '#047857', text: '#ffffff' },
  id_assistance: { bg: '#64748b', border: '#334155', text: '#ffffff' },
  job_training: { bg: '#475569', border: '#1e293b', text: '#ffffff' },
};

export const MapView: React.FC<MapViewProps> = ({
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to Seattle coordinates or user coords
      let initialLat = 47.6062;
      let initialLng = -122.3321;
      if (userCoords && Number.isFinite(Number(userCoords.lat)) && Number.isFinite(Number(userCoords.lng))) {
        initialLat = Number(userCoords.lat);
        initialLng = Number(userCoords.lng);
      }

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Clean up map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update User GPS Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCoords && Number.isFinite(Number(userCoords.lat)) && Number.isFinite(Number(userCoords.lng))) {
      const uLat = Number(userCoords.lat);
      const uLng = Number(userCoords.lng);

      const customUserIcon = L.divIcon({
        className: 'user-gps-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 bg-teal-500 rounded-full animate-ping opacity-40"></span>
            <div class="w-5 h-5 bg-teal-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white">
              <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([uLat, uLng]);
      } else {
        userMarkerRef.current = L.marker([uLat, uLng], {
          icon: customUserIcon,
          zIndexOffset: 1000,
        }).addTo(map);
      }

      // Fly to user location smoothly
      try {
        map.flyTo([uLat, uLng], 14, { duration: 1.2 });
      } catch (err) {
        console.warn('Map flyTo failed:', err);
      }
    }
  }, [userCoords]);

  // Render resource markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markerGroup = markersGroupRef.current;
    if (!map || !markerGroup) return;

    markerGroup.clearLayers();

    // Filter resources based on verifiedOnly toggle
    const displayedResources = filterVerifiedOnly
      ? resources.filter((r) => r.verificationTier === 'verified' || r.verificationTier === 'community_verified' || r.verified)
      : resources;

    displayedResources.forEach((res) => {
      const lat = Number(res.lat);
      const lng = Number(res.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const emoji = CATEGORY_EMOJIS[res.category] || '📍';
      const colors = CATEGORY_COLORS[res.category] || { bg: '#0d9488', border: '#0f766e', text: '#fff' };
      const isSelected = selectedResource?.id === res.id;
      const isFlagged = res.verificationTier === 'flagged_inaccurate';
      const isOfficial = res.verificationTier === 'verified';
      const isCommunity = res.verificationTier === 'community_verified';

      const markerBorder = isSelected ? '#fbbf24' : isFlagged ? '#ef4444' : isOfficial ? '#10b981' : isCommunity ? '#3b82f6' : '#ffffff';

      const markerHtml = `
        <div class="custom-map-pin flex flex-col items-center cursor-pointer ${isSelected ? 'scale-125 z-50' : ''}">
          <div class="flex items-center justify-center w-9 h-9 rounded-2xl shadow-lg border-2" 
               style="background-color: ${colors.bg}; border-color: ${markerBorder};">
            <span class="text-base leading-none">${emoji}</span>
          </div>
          ${res.bedsAvailable !== undefined ? `
            <span class="mt-0.5 px-1.5 py-0.2 bg-slate-900 text-amber-300 font-bold text-[9px] rounded-full border border-amber-300/40 shadow-sm">
              ${res.bedsAvailable} beds
            </span>
          ` : ''}
          ${isOfficial ? `
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold border border-white shadow-xs" title="Official Agency Verified">
              ✓
            </span>
          ` : isCommunity ? `
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold border border-white shadow-xs" title="Community Verified">
              👥
            </span>
          ` : isFlagged ? `
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold border border-white shadow-xs" title="Flagged for Verification">
              ⚠️
            </span>
          ` : res.petFriendly ? `
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold border border-white" title="Pet Friendly">
              🐾
            </span>
          ` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: markerHtml,
        iconSize: [36, 42],
        iconAnchor: [18, 38],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.on('click', () => {
        onSelectResource(res);
        try {
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            map.flyTo([lat, lng], 15, { duration: 0.8 });
          }
        } catch (err) {
          console.warn('FlyTo on marker click error:', err);
        }
      });

      markerGroup.addLayer(marker);
    });
  }, [resources, selectedResource, onSelectResource, filterVerifiedOnly]);

  // Fly to selected resource if changed from outside
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && selectedResource) {
      const lat = Number(selectedResource.lat);
      const lng = Number(selectedResource.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        try {
          map.flyTo([lat, lng], 15, { duration: 0.8 });
        } catch (err) {
          console.warn('FlyTo selectedResource error:', err);
        }
      }
    }
  }, [selectedResource]);

  const categories = [
    { id: 'all', label: 'All Resources', icon: '📍' },
    { id: 'shelter', label: 'Shelters & Beds', icon: '🛏️' },
    { id: 'food', label: 'Food & Pantries', icon: '🍱' },
    { id: 'vet', label: "Daisy's Pet Care", icon: '🐾' },
    { id: 'medical', label: 'Free Clinics', icon: '🩺' },
    { id: 'legal', label: 'Legal Aid & Rights', icon: '⚖️' },
    { id: 'hygiene', label: 'Showers & Laundry', icon: '🚿' },
    { id: 'warming_cooling', label: 'Warming / Respite', icon: '🌡️' },
    { id: 'mental_health', label: 'Crisis Support', icon: '💚' },
  ];

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Top Floating Filter Bar */}
      <div className="absolute top-1.5 sm:top-2.5 left-1.5 sm:left-2.5 right-1.5 sm:right-2.5 z-[1000] flex flex-col gap-1.5 pointer-events-none">
        
        {/* Category Pills Slider */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar pointer-events-auto bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-xl shadow-xs border border-slate-200">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Attribute Badges & Actions */}
        <div className="flex items-center justify-between gap-1.5 pointer-events-auto flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={onTogglePetFriendly}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1 shadow-xs border transition backdrop-blur-md ${
                filterPetFriendly
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-white'
              }`}
            >
              <Dog className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Pets OK</span>
            </button>

            <button
              onClick={onToggleBedsOnly}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1 shadow-xs border transition backdrop-blur-md ${
                filterBedsOnly
                  ? 'bg-indigo-600 text-white border-indigo-700'
                  : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-white'
              }`}
            >
              <Bed className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Beds</span>
            </button>

            {onToggleVerifiedOnly && (
              <button
                onClick={onToggleVerifiedOnly}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1 shadow-xs border transition backdrop-blur-md ${
                  filterVerifiedOnly
                    ? 'bg-emerald-700 text-white border-emerald-800'
                    : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-white'
                }`}
              >
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
                <span>Verified</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onGetUserLocation}
              title="Locate My GPS Position"
              className="p-1 sm:p-1.5 bg-white text-indigo-700 rounded-lg shadow-xs border border-slate-200 hover:bg-indigo-50 transition flex items-center justify-center"
            >
              <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={onOpenAddModal}
              className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs font-semibold text-[10px] sm:text-xs flex items-center gap-1 transition"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[200px] sm:min-h-[360px] rounded-xl overflow-hidden" />

      {/* Location Floating HUD (Compact on Mobile) */}
      {!selectedResource && (
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-[900] bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-md flex items-center gap-2 sm:gap-4 max-w-[95%]">
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-bold tracking-wider">GPS Area</span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-800 truncate">
              {userCoords ? `${userCoords.lat.toFixed(3)}, ${userCoords.lng.toFixed(3)}` : 'Seattle Metro'}
            </span>
          </div>
          <div className="h-4 sm:h-6 w-[1px] bg-slate-200"></div>
          <button
            onClick={onGetUserLocation}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold transition whitespace-nowrap"
          >
            Near Me
          </button>
        </div>
      )}

      {/* Selected Resource Bottom Preview Banner (Mobile Optimized) */}
      {selectedResource && (
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 z-[1000] bg-white rounded-xl shadow-xl border border-indigo-200 p-2.5 sm:p-3 animate-slide-up flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-3 max-h-[60vh] overflow-y-auto">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-base sm:text-lg shrink-0">
              {CATEGORY_EMOJIS[selectedResource.category] || '📍'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 font-heading truncate">{selectedResource.name}</h3>
                
                {selectedResource.verificationTier === 'verified' || selectedResource.verified ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] sm:text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                  </span>
                ) : null}
              </div>

              <p className="text-[11px] text-slate-600 truncate mt-0.5">{selectedResource.address}</p>

              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-medium">
                {selectedResource.bedsAvailable !== undefined && (
                  <span className="font-bold text-indigo-700">🛏️ {selectedResource.bedsAvailable} Beds</span>
                )}
                {selectedResource.petFriendly && (
                  <span className="font-bold text-emerald-700">🐾 Pets OK</span>
                )}
                <span>⏱️ {selectedResource.hours}</span>
              </div>
            </div>

            <button
              onClick={() => onSelectResource(null as any)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 shrink-0"
              title="Close card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 justify-end pt-1 md:pt-0 border-t md:border-t-0 border-slate-100">
            {selectedResource.phone && (
              <a
                href={`tel:${selectedResource.phone}`}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
              >
                <Phone className="w-3 h-3 text-slate-600" />
                <span>Call</span>
              </a>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                selectedResource.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
            >
              <Navigation className="w-3 h-3" />
              <span>Directions</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
