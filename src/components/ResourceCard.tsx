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
  Activity
} from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onSelect: (resource: Resource) => void;
  isSelected?: boolean;
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
}) => {
  const cat = CATEGORY_TAGS[resource.category] || CATEGORY_TAGS.shelter;

  return (
    <div
      onClick={() => onSelect(resource)}
      className={`p-3 rounded-xl border transition-all cursor-pointer bg-white hover:shadow-xs ${
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs bg-indigo-50/10'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border flex items-center gap-1 ${cat.bg} ${cat.text}`}>
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </span>

          {resource.verificationTier === 'verified' || resource.verified ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Agency Verified
            </span>
          ) : resource.verificationTier === 'community_verified' ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
              👥 Community Verified
            </span>
          ) : resource.verificationTier === 'flagged_inaccurate' ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold">
              ⚠️ Flagged Info
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
              ⏳ Crowd-Sourced
            </span>
          )}

          {resource.petFriendly && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-bold">
              <Dog className="w-3 h-3" /> Pets OK
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold shrink-0">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{resource.rating.toFixed(1)}</span>
          <span className="text-slate-400 font-normal text-[11px]">({resource.reviewCount})</span>
        </div>
      </div>

      {/* Resource Title & Description */}
      <h3 className="font-bold text-slate-900 text-sm mb-0.5 font-heading">{resource.name}</h3>
      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">{resource.description}</p>

      {/* Key Real-time Badges */}
      <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
        <div className="flex items-center gap-1 text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-[11px]">{resource.address}, {resource.city}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-[11px]">{resource.hours}</span>
        </div>
      </div>

      {/* Bed Tracker or Live Status Notice */}
      {resource.bedsAvailable !== undefined && (
        <div className="p-1.5 rounded-lg bg-indigo-50/70 border border-indigo-100 mb-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-indigo-900 font-semibold text-[11px]">
            <Bed className="w-3.5 h-3.5 text-indigo-600" />
            <span>Open Beds Tonight:</span>
          </div>
          <span className="font-bold px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[11px]">
            {resource.bedsAvailable} of {resource.totalBeds || 65}
          </span>
        </div>
      )}

      {resource.recentStatus && (
        <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 mb-2 text-xs flex items-center gap-1.5 text-emerald-900">
          <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate font-medium text-[11px]">{resource.recentStatus}</span>
        </div>
      )}

      {/* Card Action Footer */}
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
        <span className="text-slate-400 text-[11px] flex items-center gap-1">
          <MessageSquare className="w-3 h-3" /> {resource.checkInsCount} updates
        </span>

        <span className="text-indigo-700 font-semibold text-[11px] flex items-center gap-0.5 group">
          <span>View Details & Reviews</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
};
