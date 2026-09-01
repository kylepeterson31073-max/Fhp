import React, { useState } from 'react';
import { SevereWeatherAlert } from '../types';
import { 
  ThermometerSnowflake, 
  SunMedium, 
  Wind, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  ShieldCheck, 
  X,
  Dog,
  Sparkles
} from 'lucide-react';

interface SevereWeatherAlertBannerProps {
  alert?: SevereWeatherAlert;
  onFilterWarmingCooling: () => void;
}

export const DEFAULT_WEATHER_ALERT: SevereWeatherAlert = {
  id: 'swa-freeze-current',
  type: 'freeze',
  title: '❄️ Emergency Cold Weather Surge Active (32°F / Freeze Warning)',
  description: 'Severe weather protocol activated across King County & Puget Sound. Emergency overnight warming shelters are operating with relaxed capacity limits and pet-friendly accommodations.',
  temperature: '32°F',
  protocolActive: true,
  unlockedServices: [
    'Overnight warming centers open 24/7 without intake curfews',
    'Relaxed pet kennel restrictions & free emergency pet blankets',
    'Free Metro transit to designated emergency warming locations',
    'Mobile outreach vans distributing hot soup, hand warmers & zero-degree sleeping bags'
  ],
  expiresAt: 'Active through tomorrow 9:00 AM'
};

export const SevereWeatherAlertBanner: React.FC<SevereWeatherAlertBannerProps> = ({
  alert = DEFAULT_WEATHER_ALERT,
  onFilterWarmingCooling,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !alert.protocolActive) return null;

  return (
    <div className="w-full bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-blue-400/30 shadow-md overflow-hidden transition-all duration-300">
      <div className="p-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Left Icon & Title */}
        <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 border border-blue-400/50 flex items-center justify-center text-blue-300 shrink-0 shadow-xs">
            <ThermometerSnowflake className="w-5 h-5 sm:w-5 sm:h-5 text-blue-300 animate-pulse" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 text-[10px] font-bold tracking-wide uppercase">
                Severe Weather Protocol Active
              </span>
              <span className="text-[11px] text-blue-200 font-semibold hidden sm:inline-block">
                Temp: {alert.temperature}
              </span>
            </div>

            <h3 className="font-heading font-bold text-xs sm:text-sm text-white mt-0.5 truncate">
              {alert.title}
            </h3>
            
            <p className="text-[11px] text-slate-300 line-clamp-1 sm:line-clamp-none mt-0.5 leading-relaxed">
              {alert.description}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-blue-800/50">
          <button
            onClick={onFilterWarmingCooling}
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
            title="View Warming & Cold Relief Centers on Map"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Find Warming Centers</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition flex items-center gap-1 shrink-0"
          >
            <span className="text-[11px]">{isExpanded ? 'Less' : 'Details'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            title="Dismiss Banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Details Drawer */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 bg-slate-950/60 border-t border-blue-900/60 text-xs space-y-2.5 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {alert.unlockedServices.map((srv, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-blue-950/40 p-2 rounded-xl border border-blue-900/40 text-[11px] text-blue-100">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{srv}</span>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-between text-[11px] text-indigo-200">
            <div className="flex items-center gap-2">
              <Dog className="w-4 h-4 text-amber-300 shrink-0" />
              <span><strong>Daisy Pet Cold Safety:</strong> Bring dogs/cats inside immediately. Free straw bedding and insulated pet jackets available at St. Francis & Open Door!</span>
            </div>
            <span className="text-[10px] text-slate-400 shrink-0 ml-2 hidden sm:inline">{alert.expiresAt}</span>
          </div>
        </div>
      )}
    </div>
  );
};
