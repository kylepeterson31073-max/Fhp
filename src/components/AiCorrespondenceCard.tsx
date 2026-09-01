import React, { useState } from 'react';
import { CorrespondenceAnalysis, SavedDocument, UserProfile } from '../types';
import { 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  Mail, 
  Bookmark, 
  Send,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AiCorrespondenceCardProps {
  analysis: CorrespondenceAnalysis;
  userProfile: UserProfile;
  onSaveDocument?: (doc: SavedDocument) => void;
}

export const AiCorrespondenceCard: React.FC<AiCorrespondenceCardProps> = ({
  analysis,
  userProfile,
  onSaveDocument,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [expandedLetter, setExpandedLetter] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis.draftResponseLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveToVault = () => {
    if (onSaveDocument) {
      const doc: SavedDocument = {
        id: `doc-appeal-${Date.now()}`,
        title: `Official Response & Appeal: ${analysis.criticalDeadline ? 'Deadline Notice' : 'Notice Defense'}`,
        formType: 'benefit_denial_appeal',
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        content: analysis.draftResponseLetter,
        metadata: {
          urgencyLevel: analysis.urgencyLevel,
          criticalDeadline: analysis.criticalDeadline,
          rightsAsserted: analysis.recommendedRightsToAssert,
        },
      };
      onSaveDocument(doc);
      setIsSaved(true);
      confetti({ particleCount: 40, spread: 60 });
    }
  };

  const emailSubject = `URGENT APPEAL & FAIR HEARING REQUEST - ${userProfile.preferredName || userProfile.fullName || 'Appellant'}`;
  const mailtoHref = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(analysis.draftResponseLetter)}`;

  return (
    <div className="mt-2.5 rounded-xl border border-rose-200 bg-white overflow-hidden shadow-xs text-xs">
      {/* Urgency Header */}
      <div className={`p-3 text-white flex items-center justify-between gap-2 ${
        analysis.urgencyLevel === 'high'
          ? 'bg-gradient-to-r from-rose-900 to-rose-700'
          : analysis.urgencyLevel === 'medium'
          ? 'bg-gradient-to-r from-amber-800 to-amber-600'
          : 'bg-gradient-to-r from-slate-800 to-slate-700'
      }`}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
          <div>
            <span className="font-bold text-xs">Notice Analysis & Autonomous Appeal</span>
            <span className="block text-[10px] opacity-90">
              Urgency: {analysis.urgencyLevel.toUpperCase()}
            </span>
          </div>
        </div>

        {analysis.criticalDeadline && (
          <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded text-[10px] font-bold text-amber-200">
            <Clock className="w-3 h-3" />
            <span>{analysis.criticalDeadline}</span>
          </div>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Plain-English Summary */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 mb-1">
            📄 What This Notice Means (In Plain English):
          </h5>
          <p className="text-slate-800 leading-relaxed text-xs">
            {analysis.summary}
          </p>
        </div>

        {/* Action Steps Checklist */}
        {analysis.actionSteps && analysis.actionSteps.length > 0 && (
          <div className="space-y-1">
            <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
              Immediate Action Steps:
            </h5>
            <div className="space-y-1">
              {analysis.actionSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Legal Rights */}
        {analysis.recommendedRightsToAssert && analysis.recommendedRightsToAssert.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Rights Asserted:</span>
            {analysis.recommendedRightsToAssert.map((right, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-md text-[10px] font-semibold">
                ⚖️ {right}
              </span>
            ))}
          </div>
        )}

        {/* Drafted Formal Letter */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div 
            onClick={() => setExpandedLetter(!expandedLetter)}
            className="p-2 bg-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-200 transition"
          >
            <span className="font-bold text-[11px] text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ready-to-Submit Appeal & Defense Letter</span>
            </span>
            <button className="text-slate-500">
              {expandedLetter ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {expandedLetter && (
            <div className="p-2.5 bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
              {analysis.draftResponseLetter}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg font-semibold flex items-center justify-center gap-1 transition text-xs"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied Appeal Letter!' : 'Copy Letter'}</span>
          </button>

          <a
            href={mailtoHref}
            className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1 transition shadow-2xs text-xs text-center"
          >
            <Mail className="w-3 h-3" />
            <span>Send via Email</span>
          </a>

          <button
            onClick={handleSaveToVault}
            disabled={isSaved}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition text-xs ${
              isSaved
                ? 'bg-slate-200 text-slate-600'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
            }`}
          >
            <Bookmark className="w-3 h-3" />
            <span>{isSaved ? 'Saved to Vault ✓' : 'Save to Vault'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
