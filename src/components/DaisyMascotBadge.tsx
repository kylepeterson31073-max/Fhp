import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import daisyImage from '../assets/images/daisy_mascot_1787539451378.jpg';

interface DaisyMascotBadgeProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSpeech?: boolean;
  speechText?: string;
  className?: string;
  animate?: boolean;
}

export const DaisyMascotBadge: React.FC<DaisyMascotBadgeProps> = ({
  size = 'md',
  showSpeech = false,
  speechText = "Hi friend! I'm Daisy, your loyal companion with one blue eye and one brown eye. I'm here to help you sniff out safe shelter, food, legal aid, pet care, and benefits!",
  className = '',
  animate = true,
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  return (
    <div className={`relative inline-flex items-center gap-3 ${className}`}>
      <div className="relative group">
        {/* Outer gentle glowing halo */}
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-300 rounded-full blur-sm opacity-60 group-hover:opacity-100 transition duration-300"></div>
        
        {/* Mascot Avatar Container */}
        <div className={`relative ${sizeMap[size]} rounded-full overflow-hidden border-2 border-indigo-500 shadow-sm bg-slate-100 flex items-center justify-center`}>
          <img
            src={daisyImage}
            alt="Daisy the Pitbull Mascot (One blue eye, one brown eye, white and black coat)"
            className={`w-full h-full object-cover ${animate ? 'transition-transform duration-300 hover:scale-105' : ''}`}
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Heterochromia indicator badge */}
        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-xs border border-slate-200 flex items-center gap-0.5" title="Daisy's Signature: One Blue Eye, One Brown Eye">
          <span className="w-2 h-2 rounded-full bg-sky-500 ring-1 ring-sky-300" title="Blue Eye"></span>
          <span className="w-2 h-2 rounded-full bg-amber-800 ring-1 ring-amber-600" title="Brown Eye"></span>
        </div>
      </div>

      {showSpeech && (
        <div className="relative bg-white text-slate-800 p-3 rounded-xl shadow-sm border border-slate-200 text-xs max-w-sm">
          <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-6 border-r-white"></div>
          <div className="flex items-center gap-1.5 font-bold text-indigo-700 text-[10px] uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Daisy Says</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 ml-auto" />
          </div>
          <p className="text-slate-700 leading-relaxed text-xs">{speechText}</p>
        </div>
      )}
    </div>
  );
};
