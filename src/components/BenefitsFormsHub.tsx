import React, { useState } from 'react';
import { BenefitFormDefinition, UserProfile, SavedDocument } from '../types';
import { BENEFIT_FORMS } from '../data/formsData';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Copy, 
  Printer, 
  ArrowRight, 
  HelpCircle, 
  ShieldCheck, 
  FileSearch, 
  Loader2,
  Clock,
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BenefitsFormsHubProps {
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onSaveDocument: (doc: SavedDocument) => void;
  preselectedFormId?: string;
}

export const BenefitsFormsHub: React.FC<BenefitsFormsHubProps> = ({
  userProfile,
  onUpdateProfile,
  onSaveDocument,
  preselectedFormId,
}) => {
  const [selectedFormId, setSelectedFormId] = useState<string>(preselectedFormId || BENEFIT_FORMS[0].id);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [filledResult, setFilledResult] = useState<any | null>(null);
  
  // Notice analyzer state
  const [showNoticeAnalyzer, setShowNoticeAnalyzer] = useState(false);
  const [noticeText, setNoticeText] = useState('');
  const [noticeType, setNoticeType] = useState('SNAP / Medicaid Denial or Sanction Notice');
  const [isAnalyzingNotice, setIsAnalyzingNotice] = useState(false);
  const [noticeResult, setNoticeResult] = useState<any | null>(null);

  // Missing field direct input state
  const [missingFieldInputs, setMissingFieldInputs] = useState<Record<string, string>>({});
  const [copiedNotification, setCopiedNotification] = useState(false);

  const currentForm = BENEFIT_FORMS.find((f) => f.id === selectedFormId) || BENEFIT_FORMS[0];

  const handleAutoFill = async () => {
    setIsAutoFilling(true);
    setFilledResult(null);

    try {
      const res = await fetch('/api/gemini/fill-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: currentForm.id,
          formDefinition: currentForm,
          userProfile,
        }),
      });

      if (!res.ok) throw new Error('Failed to auto-fill form');
      const data = await res.json();
      setFilledResult(data);
      confetti({ particleCount: 70, spread: 60 });
    } catch (error: any) {
      console.error(error);
      alert('Error generating form. Please try again.');
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSaveMissingField = (key: string, value: string) => {
    if (!value.trim()) return;

    onUpdateProfile({
      [key]: value.trim(),
    });

    // Update locally in missing inputs
    setMissingFieldInputs((prev) => ({ ...prev, [key]: '' }));

    // Re-trigger auto-fill seamlessly
    setTimeout(() => {
      handleAutoFill();
    }, 400);
  };

  const handleAnalyzeNotice = async () => {
    if (!noticeText.trim()) return;
    setIsAnalyzingNotice(true);
    setNoticeResult(null);

    try {
      const res = await fetch('/api/gemini/analyze-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noticeText,
          noticeType,
          userProfile,
        }),
      });

      if (!res.ok) throw new Error('Failed to analyze notice');
      const data = await res.json();
      setNoticeResult(data);
      confetti({ particleCount: 60, spread: 60 });
    } catch (error: any) {
      console.error(error);
      alert('Error analyzing document. Please try again.');
    } finally {
      setIsAnalyzingNotice(false);
    }
  };

  const handleSaveToDocs = () => {
    if (!filledResult) return;

    const docContent = `
=== ${filledResult.formTitle || currentForm.title} ===
AGENCY: ${filledResult.agency || currentForm.agencyName}
DATE GENERATED: ${new Date().toLocaleDateString()}

--- APPLICANT DETAILS ---
${filledResult.filledFields?.map((f: any) => `${f.label}: ${f.value || '[Pending]'}`).join('\n')}

--- FORMAL HARDSHIP & EXPEDITED PROCESSING STATEMENT ---
${filledResult.coverLetter || ''}

--- SUBMISSION INSTRUCTIONS ---
${filledResult.submissionInstructions?.map((ins: string, i: number) => `${i + 1}. ${ins}`).join('\n')}
    `.trim();

    onSaveDocument({
      id: `doc-${Date.now()}`,
      title: `${currentForm.title} (Draft)`,
      formType: currentForm.id,
      createdAt: new Date().toLocaleDateString(),
      content: docContent,
    });

    alert('Document saved to your profile locker!');
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="w-full space-y-4">
      
      {/* Top Banner with Daisy Tip & Notice Analyzer Switcher */}
      <div className="p-4 rounded-2xl bg-indigo-900 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.2 rounded-md bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-[10px] font-bold uppercase tracking-wider">
              1-Click Smart Form Filler
            </span>
            <span className="text-indigo-200 text-xs">Always Free & Confidential</span>
          </div>
          <h1 className="text-lg md:text-xl font-bold font-heading">Government & Emergency Aid Applications</h1>
          <p className="text-xs text-indigo-100 max-w-xl leading-relaxed">
            Our AI Caseworker fills out complete SNAP, Medicaid, Housing, and ID waiver forms using your saved profile, finds missing fields, and drafts hardship statements.
          </p>
        </div>

        <button
          onClick={() => setShowNoticeAnalyzer(!showNoticeAnalyzer)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs shrink-0 ${
            showNoticeAnalyzer
              ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
          }`}
        >
          <FileSearch className="w-4 h-4 text-amber-300" />
          <span>{showNoticeAnalyzer ? 'Close Letter Analyzer' : 'Analyze Notice / Denial Letter'}</span>
        </button>
      </div>

      {/* NOTICE & CORRESPONDENCE ANALYZER DRAWER */}
      {showNoticeAnalyzer && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 shadow-xs space-y-3 animate-slide-up">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                AI Caseworker & Legal Correspondence Assistant
              </span>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Translate Government Letters & Draft Immediate Appeals
              </h2>
              <p className="text-xs text-slate-600">
                Paste the text from an eviction notice, SNAP sanction, Medicaid denial, or housing letter to see what it means and how to fight it.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Notice Type</label>
              <select
                value={noticeType}
                onChange={(e) => setNoticeType(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="SNAP / Medicaid Denial or Sanction Notice">SNAP / Medicaid Denial</option>
                <option value="Emergency Shelter / Housing Voucher Termination">Housing Voucher Termination</option>
                <option value="Notice to Vacate / Encampment Sweep Notice">Notice to Vacate / Sweep</option>
                <option value="SSI Disability Cessation Notice">SSI Disability Notice</option>
                <option value="General Government Letter">Other Government Letter</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Paste Notice Text or Type Summary</label>
              <textarea
                rows={2}
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                placeholder="e.g., 'Notice of Action: Your food assistance is being reduced because you failed to submit quarterly review form by Aug 15th...'"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAnalyzeNotice}
              disabled={isAnalyzingNotice || !noticeText.trim()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5"
            >
              {isAnalyzingNotice ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Legal Deadlines...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze Letter & Draft Appeal</span>
                </>
              )}
            </button>
          </div>

          {/* Notice Analysis Results */}
          {noticeResult && (
            <div className="p-4 rounded-xl bg-white border border-amber-200 space-y-3 shadow-2xs animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-bold">
                  Urgency: {noticeResult.urgencyLevel?.toUpperCase()}
                </span>
                <span className="text-xs font-semibold text-amber-900">
                  Critical Deadline: {noticeResult.criticalDeadline || 'Immediate'}
                </span>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plain-English Translation</h4>
                <p className="text-xs text-slate-800 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg">
                  {noticeResult.summary}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Recommended Action Steps</h4>
                <ul className="space-y-1">
                  {noticeResult.actionSteps?.map((step: string, i: number) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {noticeResult.draftResponseLetter && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Draft Appeal Letter (Ready to Sign)
                    </h4>
                    <button
                      onClick={() => handleCopyText(noticeResult.draftResponseLetter)}
                      className="text-xs text-indigo-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Letter</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed max-h-52 overflow-y-auto">
                    {noticeResult.draftResponseLetter}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKSPACE: Forms List & Auto-Fill Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: Available Forms Selector */}
        <div className="lg:col-span-5 space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Aid Application</h3>
          
          <div className="space-y-1.5">
            {BENEFIT_FORMS.map((form) => {
              const isSelected = form.id === selectedFormId;
              return (
                <div
                  key={form.id}
                  onClick={() => {
                    setSelectedFormId(form.id);
                    setFilledResult(null);
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-600 shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-tight">{form.title}</h4>
                        <p className="text-[10px] text-slate-500">{form.agencyName}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">{form.timeToComplete}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {form.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Form Workspace & Live AI Engine */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4 flex flex-col justify-between">
          
          <div>
            {/* Selected Form Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  {currentForm.agencyName}
                </span>
                <h2 className="text-base font-bold text-slate-900 font-heading">{currentForm.title}</h2>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{currentForm.description}</p>
              </div>

              {currentForm.officialUrl && (
                <a
                  href={currentForm.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition shrink-0"
                  title="Official State Agency Portal"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Document Checklist & Submission Tips */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Required Documents</span>
                </h4>
                <ul className="space-y-0.5">
                  {currentForm.documentChecklist.map((doc, idx) => (
                    <li key={idx} className="text-[11px] text-slate-600 flex items-start gap-1">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                <h4 className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Approval Tips</span>
                </h4>
                <ul className="space-y-0.5">
                  {currentForm.submissionTips.map((tip, idx) => (
                    <li key={idx} className="text-[11px] text-amber-950 flex items-start gap-1">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* AUTO-FILL BUTTON */}
            {!filledResult && (
              <div className="mt-4 p-5 rounded-xl bg-indigo-50 border border-indigo-200 text-center space-y-2.5">
                <FileText className="w-8 h-8 text-indigo-600 mx-auto" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-indigo-950">Ready to Auto-Fill Application?</h4>
                  <p className="text-xs text-indigo-800 max-w-md mx-auto mt-0.5">
                    AI Caseworker maps your saved profile info into the complete application package with hardship statements.
                  </p>
                </div>
                <button
                  onClick={handleAutoFill}
                  disabled={isAutoFilling}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-xs transition inline-flex items-center gap-1.5"
                >
                  {isAutoFilling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Caseworker Auto-Filling Form & Hardship Statement...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Fill From My Profile</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* AUTO-FILLED RESULT PANEL */}
            {filledResult && (
              <div className="mt-6 space-y-5 animate-fade-in">
                
                {/* Readiness Score Bar */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs md:text-sm">Application Readiness Score</h4>
                    <p className="text-[11px] text-slate-400">Based on required legal fields provided</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-heading text-emerald-400">
                      {filledResult.readinessScore || 85}%
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      {filledResult.readinessScore >= 80 ? 'Ready to File' : 'Needs Info'}
                    </span>
                  </div>
                </div>

                {/* Missing Fields Gap Detector */}
                {filledResult.missingFields && filledResult.missingFields.length > 0 && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Missing Profile Information (Daisy noticed {filledResult.missingFields.length} missing fields):</span>
                    </div>

                    <div className="space-y-2">
                      {filledResult.missingFields.map((field: any, i: number) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white p-2.5 rounded-xl border border-rose-100">
                          <span className="text-xs font-semibold text-slate-800 min-w-[140px]">{field.label}:</span>
                          <input
                            type="text"
                            placeholder={field.prompt || `Enter your ${field.label}`}
                            value={missingFieldInputs[field.fieldKey] || ''}
                            onChange={(e) => setMissingFieldInputs({ ...missingFieldInputs, [field.fieldKey]: e.target.value })}
                            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-teal-500"
                          />
                          <button
                            onClick={() => handleSaveMissingField(field.fieldKey, missingFieldInputs[field.fieldKey] || '')}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shrink-0 transition"
                          >
                            Save to Profile
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mapped Fields Display */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Populated Application Fields</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    {filledResult.filledFields?.map((f: any, i: number) => (
                      <div key={i} className="text-xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">{f.label}</span>
                        <span className="font-semibold text-slate-900">{f.value || '[Not provided]'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hardship & Expedited Processing Cover Statement */}
                {filledResult.coverLetter && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Expedited Emergency Hardship Statement
                      </h4>
                      <button
                        onClick={() => handleCopyText(filledResult.coverLetter)}
                        className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Statement</span>
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
                      {filledResult.coverLetter}
                    </pre>
                  </div>
                )}

                {/* Submission Instructions */}
                {filledResult.submissionInstructions && (
                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100">
                    <h4 className="text-xs font-bold text-teal-900 mb-1.5">Where & How to Submit</h4>
                    <ul className="space-y-1">
                      {filledResult.submissionInstructions.map((ins: string, i: number) => (
                        <li key={i} className="text-xs text-teal-800 flex items-start gap-1.5">
                          <span className="font-bold text-teal-600">{i + 1}.</span>
                          <span>{ins}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Bottom Footer */}
          {filledResult && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => setFilledResult(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Reset / Choose Another Form
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Application</span>
                </button>

                <button
                  onClick={handleSaveToDocs}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save to My Documents</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
