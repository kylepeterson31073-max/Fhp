import React, { useState } from 'react';
import { Resource, CheckIn } from '../types';
import { 
  X, 
  Activity, 
  Bed, 
  Utensils, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Dog 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuickCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  onPostCheckIn: (resourceId: string, checkIn: Partial<CheckIn>) => void;
}

export const QuickCheckInModal: React.FC<QuickCheckInModalProps> = ({
  isOpen,
  onClose,
  resource,
  onPostCheckIn,
}) => {
  const [authorName, setAuthorName] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [bedsNow, setBedsNow] = useState<number | ''>('');
  const [foodServing, setFoodServing] = useState(false);
  const [lineLength, setLineLength] = useState<'none' | 'short' | 'moderate' | 'long'>('short');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !resource) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusNote.trim()) return;

    setIsSubmitting(true);
    const newCheckIn: Partial<CheckIn> = {
      authorName: authorName.trim() || 'Community Neighbor',
      statusNote: statusNote.trim(),
      bedsAvailableNow: bedsNow !== '' ? Number(bedsNow) : undefined,
      foodServingNow: foodServing,
      lineLength,
    };

    onPostCheckIn(resource.id, newCheckIn);
    confetti({ particleCount: 50, spread: 50 });
    setStatusNote('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-3.5 bg-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-sm">
              ⚡
            </div>
            <div>
              <h3 className="font-heading font-bold text-xs sm:text-sm leading-tight">
                Quick 10-Second Check-In
              </h3>
              <p className="text-[11px] text-indigo-200 truncate max-w-[240px]">
                {resource.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Current Live Status / Update <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g., Hot chili serving now, 8 beds open, fast line!"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => setStatusNote('10+ emergency beds available right now.')}
              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-[10px] font-semibold border border-indigo-200"
            >
              🛏️ Beds Open
            </button>
            <button
              type="button"
              onClick={() => setStatusNote('Hot dinner currently serving. Line moving fast.')}
              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[10px] font-semibold border border-amber-200"
            >
              🍱 Food Serving
            </button>
            <button
              type="button"
              onClick={() => setStatusNote('Showers are open with hot water and clean towels.')}
              className="px-2 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg text-[10px] font-semibold border border-cyan-200"
            >
              🚿 Showers Open
            </button>
            <button
              type="button"
              onClick={() => setStatusNote('Pet food kibble bags available in the courtyard.')}
              className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-[10px] font-semibold border border-teal-200"
            >
              🐾 Pet Food Ready
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {resource.category === 'shelter' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Bed className="w-3 h-3 text-indigo-600" />
                  <span>Open Beds (Approx)</span>
                </label>
                <input
                  type="number"
                  value={bedsNow}
                  onChange={(e) => setBedsNow(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 14"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Line Wait Time</span>
              </label>
              <select
                value={lineLength}
                onChange={(e) => setLineLength(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="none">No line (0 min)</option>
                <option value="short">Short (5-10 min)</option>
                <option value="moderate">Moderate (15-30 min)</option>
                <option value="long">Long (30+ min)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Your Name / Nickname (Optional)
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Marcus & Dog Buster"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              Submit Check-In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
