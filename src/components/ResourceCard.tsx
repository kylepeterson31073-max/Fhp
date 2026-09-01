import React from 'react';
import { Resource } from '../types';
import { 
  Star, 
  MapPin, 
  Clock, 
  Dog, 
  Bed, 
  ShieldCheck, 
  MessageSquare, 
  Navigation, 
  Phone, 
  ChevronRight,
  Activity,
  Heart,
  Zap,
  Footprints
} from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onSelect: (resource: Resource) => void;
  isSelected?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (resourceId: string) => void;
  onQuickCheckIn?: (resource: Resource) => void;
}

const CATEGORY_TAGS: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  shelter: { label: 'Shelter', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: '🛏️' },
  food: { label: 'Food & Meals', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: '🍱' },
  medical: { label: 'Medical Clinic', bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: '🩺' },
  vet: { label: "Daisy's Pet Care", bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700', icon: '🐾' },
  legal: { label: 'Legal Aid', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: '⚖️' },
  hygiene: { label: 'Showers & Laundry', bg: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-700', icon: '🚿' },
  warming_cooling: { label: 'Warming / Cooling', bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', icon: '🌡️' },
  mental_health: { label: 'Crisis & Mental Health', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: '💚' },
  id_assistance: { label: 'ID & Records', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', icon: '🪪' },
  job_training: { label: 'Employment Lab', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', icon: '💼' },
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onSelect,
  isSelected = false,
  isFavorite = false,
  onToggleFavorite,
  onQuickCheckIn,
}) => {
  const cat = CATEGORY_TAGS[resource.category] || CATEGORY_TAGS.shelter;

  // Calculate walking time if distance is known (average 3.0 mph = 20 mins per mile)
  const walkingMinutes = resource.distanceMiles 
    ? Math.max(1, Math.round(resource.distanceMiles * 20))
    : null;

  return (
    <div
      onClick={() => onSelect(resource)}
      className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer bg-white hover:shadow-xs w-full min-w-0 ${
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs bg-indigo-50/15'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border flex items-center gap-1 ${cat.bg} ${cat.text}`}>
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </span>

          {resource.verificationTier === 'verified' || resource.verified ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
            </span>
          ) : resource.verificationTier === 'community_verified' ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
              👥 Community Verified
            </span>
          ) : resource.verificationTier === 'flagged_inaccurate' ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold">
              ⚠️ Flagged Info
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
              ⏳ Crowd-Sourced
            </span>
          )}

          {resource.petFriendly && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-bold">
              <Dog className="w-3 h-3" /> Pets OK
            </span>
          )}
        </div>

        {/* Favorite Star / Heart & Rating */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{resource.rating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal text-[10px]">({resource.reviewCount})</span>
          </div>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(resource.id);
              }}
              className={`p-1 rounded-full transition ${
                isFavorite 
                  ? 'text-rose-500 bg-rose-50 hover:bg-rose-100' 
                  : 'text-slate-300 hover:text-rose-500 hover:bg-slate-100'
              }`}
              title={isFavorite ? 'Remove from Saved' : 'Save to My Vault'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Resource Title & Description */}
      <h3 className="font-bold text-slate-900 text-sm mb-1 font-heading">{resource.name}</h3>
      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2.5">{resource.description}</p>

      {/* Key Real-time Badges */}
      <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
        <div className="flex items-center gap-1 text-slate-600 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-[11px]">{resource.address}, {resource.city}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-600 min-w-0">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-[11px]">{resource.hours}</span>
        </div>
      </div>

      {/* Distance & Walking Time Pill */}
      {walkingMinutes !== null && (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-semibold mb-2">
          <Footprints className="w-3 h-3 text-indigo-600" />
          <span>~{walkingMinutes} min walk ({resource.distanceMiles} mi away)</span>
        </div>
      )}

      {/* Bed Tracker or Live Status Notice */}
      {resource.bedsAvailable !== undefined && (
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 mb-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-[11px]">
            <Bed className="w-3.5 h-3.5 text-indigo-600" />
            <span>Open Beds Tonight:</span>
          </div>
          <span className={`font-bold px-2 py-0.5 rounded-lg text-[11px] ${
            resource.bedsAvailable > 8
              ? 'bg-emerald-600 text-white'
              : resource.bedsAvailable > 0
              ? 'bg-amber-500 text-white'
              : 'bg-rose-600 text-white'
          }`}>
            {resource.bedsAvailable > 0 ? `${resource.bedsAvailable} of ${resource.totalBeds || 65} Open` : 'At Capacity (Waitlist)'}
          </span>
        </div>
      )}

      {resource.recentStatus && (
        <div className="p-1.5 rounded-xl bg-emerald-50/80 border border-emerald-100 mb-2 text-xs flex items-center gap-1.5 text-emerald-900">
          <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-pulse" />
          <span className="truncate font-medium text-[11px]">{resource.recentStatus}</span>
        </div>
      )}

      {/* Card Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> {resource.checkInsCount} updates
          </span>

          {onQuickCheckIn && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickCheckIn(resource);
              }}
              className="px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200/70 flex items-center gap-1 transition"
              title="Post quick status or bed update"
            >
              <Zap className="w-3 h-3 text-indigo-600" />
              <span>Update</span>
            </button>
          )}
        </div>

        <span className="text-indigo-700 font-semibold text-[11px] flex items-center gap-0.5 group">
          <span>Details & Reviews</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
};
