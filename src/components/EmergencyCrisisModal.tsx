import React from 'react';
import { Phone, AlertTriangle, ShieldAlert, HeartHandshake, X, ExternalLink, Heart, LifeBuoy } from 'lucide-react';

interface EmergencyCrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyCrisisModal: React.FC<EmergencyCrisisModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const hotlines = [
    {
      title: '988 Suicide & Crisis Lifeline',
      number: '988',
      desc: 'Free, confidential 24/7 mental health crisis, emotional distress, and suicide prevention hotline. Call or text.',
      color: 'bg-rose-50 border-rose-200 text-rose-800',
      btnColor: 'bg-rose-600 hover:bg-rose-700 text-white',
      badge: '24/7 Call or Text',
    },
    {
      title: '211 Essential Community Services',
      number: '211',
      desc: 'Connects directly with local shelter beds, emergency food, utility help, and human service caseworkers.',
      color: 'bg-amber-50 border-amber-200 text-amber-900',
      btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
      badge: 'Local Community Navigator',
    },
    {
      title: 'Crisis Text Line',
      number: '741741',
      smsKeyword: 'HOME',
      desc: 'Text HOME to 741741 to connect with a volunteer crisis counselor 24/7 over free confidential SMS.',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      badge: 'Free SMS Texting',
      isText: true,
    },
    {
      title: 'National Domestic Violence Hotline',
      number: '1-800-799-7233',
      desc: 'Confidential support, safety planning, and emergency confidential shelter for DV survivors.',
      color: 'bg-purple-50 border-purple-200 text-purple-900',
      btnColor: 'bg-purple-600 hover:bg-purple-700 text-white',
      badge: '100% Confidential',
    },
    {
      title: 'National Homeless Veterans Hotline',
      number: '1-877-424-3838',
      desc: 'VA 24/7 assistance line for veterans who are homeless or at risk of homelessness and their families.',
      color: 'bg-blue-50 border-blue-200 text-blue-900',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      badge: 'Veterans & Families',
    },
    {
      title: 'National Runaway Safeline (Youth & Young Adults)',
      number: '1-800-786-2929',
      desc: '24/7 crisis support, free bus tickets home (Home Free program), and shelter referrals for unhoused youth.',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badge: 'Youth & Teens',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 p-4 md:p-5">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">Emergency & Crisis Helplines</h2>
              <p className="text-xs text-slate-500">Free, confidential, 24/7 lifelines. You are not alone.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 911 banner for immediate danger */}
        <div className="my-3 p-3 rounded-xl bg-rose-600 text-white flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-xs">Immediate Life-Threatening Emergency?</p>
              <p className="text-[11px] text-rose-100">Call emergency responders directly at 911.</p>
            </div>
          </div>
          <a
            href="tel:911"
            className="px-3 py-1.5 bg-white text-rose-700 font-bold rounded-lg text-xs shadow hover:bg-rose-50 transition shrink-0"
          >
            Call 911
          </a>
        </div>

        {/* Hotlines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-3">
          {hotlines.map((h, i) => (
            <div key={i} className={`p-3 rounded-xl border ${h.color} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-white/80 border border-slate-200/50">
                    {h.badge}
                  </span>
                </div>
                <h3 className="font-bold text-xs mb-0.5">{h.title}</h3>
                <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">{h.desc}</p>
              </div>

              <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200/50">
                {h.isText ? (
                  <a
                    href={`sms:${h.number}?body=${h.smsKeyword}`}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition ${h.btnColor}`}
                  >
                    <span>Text {h.smsKeyword} to {h.number}</span>
                  </a>
                ) : (
                  <a
                    href={`tel:${h.number.replace(/[^0-9]/g, '')}`}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition ${h.btnColor}`}
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call {h.number}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Daisy supportive footer */}
        <div className="mt-3.5 p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-2.5">
          <Heart className="w-5 h-5 text-indigo-600 fill-indigo-600 shrink-0" />
          <p className="text-[11px] text-indigo-950 leading-relaxed">
            <strong className="font-bold">Daisy's Promise:</strong> Everyone deserves safety, warmth, and dignity. If you're feeling scared or cold tonight, please reach out to one of these resources right away.
          </p>
        </div>
      </div>
    </div>
  );
};
