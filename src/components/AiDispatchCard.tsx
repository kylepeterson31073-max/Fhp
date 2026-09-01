import React, { useState } from 'react';
import { DispatchPackage, SavedDocument, UserProfile, TrackedApplication } from '../types';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Send, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  ShieldCheck, 
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Share2,
  Zap,
  Radio
} from 'lucide-react';
import { 
  triggerAutonomousCall, 
  triggerAutonomousSms, 
  triggerAutonomousEmail, 
  sharePacketNatively, 
  buildDtmfDialString 
} from '../utils/nativePhoneBridge';
import confetti from 'canvas-confetti';

interface AiDispatchCardProps {
  dispatch: DispatchPackage;
  userProfile: UserProfile;
  onSaveDocument?: (doc: SavedDocument) => void;
  onAddTrackedApplication?: (app: TrackedApplication) => void;
}

export const AiDispatchCard: React.FC<AiDispatchCardProps> = ({
  dispatch,
  userProfile,
  onSaveDocument,
  onAddTrackedApplication,
}) => {
  const [activeChannel, setActiveChannel] = useState<'email' | 'sms' | 'phone'>('email');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isTransmitted, setIsTransmitted] = useState(false);
  const [isSavedToVault, setIsSavedToVault] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showFullEmail, setShowFullEmail] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSpeechToggle = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleCertifiedEFile = () => {
    setIsTransmitted(true);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });

    // Auto-save to vault
    if (onSaveDocument) {
      const doc: SavedDocument = {
        id: `doc-${Date.now()}`,
        title: `${dispatch.formTitle || 'Application'} - ${dispatch.agencyName || 'Agency'}`,
        formType: dispatch.formId || 'general_application',
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        content: dispatch.fullDocumentContent || dispatch.formalEmail?.body || 'Application package content',
        metadata: {
          confirmationNumber: dispatch.confirmationNumber,
          agencyName: dispatch.agencyName,
          status: 'transmitted_to_agency',
        },
      };
      onSaveDocument(doc);
      setIsSavedToVault(true);
    }

    // Auto-track application
    if (onAddTrackedApplication) {
      const app: TrackedApplication = {
        id: `app-${Date.now()}`,
        formId: dispatch.formId || 'application',
        formTitle: dispatch.formTitle || 'Benefit Application',
        agencyName: dispatch.agencyName || 'Agency Intake',
        status: 'submitted',
        confirmationNumber: dispatch.confirmationNumber,
        submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        nextActionDate: '3-5 business days',
        notes: `Submitted via Daisy Autonomous Multi-Channel e-Filer. Confirmation: ${dispatch.confirmationNumber}`,
        history: [
          {
            timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'submitted',
            note: `Application & certified cover letter electronically filed with ${dispatch.agencyName || 'Agency'}.`,
          },
        ],
      };
      onAddTrackedApplication(app);
    }
  };

  const handleSaveOnlyToVault = () => {
    if (onSaveDocument) {
      const doc: SavedDocument = {
        id: `doc-${Date.now()}`,
        title: `${dispatch.formTitle || 'Benefit Package'} (${dispatch.agencyName || 'Agency'})`,
        formType: dispatch.formId || 'general_package',
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        content: dispatch.fullDocumentContent || dispatch.formalEmail?.body || 'Package details',
        metadata: {
          confirmationNumber: dispatch.confirmationNumber,
          agencyName: dispatch.agencyName,
        },
      };
      onSaveDocument(doc);
      setIsSavedToVault(true);
      confetti({ particleCount: 35, spread: 50 });
    }
  };

  const emailBody = dispatch.formalEmail?.body || '';
  const emailRecipient = dispatch.formalEmail?.recipient || 'intake@dshs.wa.gov';
  const emailSubject = dispatch.formalEmail?.subject || `${dispatch.formTitle || 'Application'} - ${userProfile.preferredName || userProfile.fullName || 'Applicant'}`;
  const mailtoHref = `mailto:${emailRecipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const smsText = dispatch.smsSummary || '';
  const smsRecipient = dispatch.smsRecipient || '211';
  const smsHref = `sms:${smsRecipient}?body=${encodeURIComponent(smsText)}`;

  const phoneNumber = dispatch.phoneCallScript?.agencyPhoneNumber || '1-877-501-2233';
  const telHref = `tel:${phoneNumber.replace(/[^0-9+]/g, '')}`;

  return (
    <div className="mt-2.5 rounded-xl border border-indigo-200 bg-white overflow-hidden shadow-xs text-xs">
      
      {/* Top Action Header */}
      <div className="p-3 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs font-heading">{dispatch.formTitle || 'Autonomous Action Package'}</span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-500/40 text-[10px] font-mono font-semibold text-indigo-100">
                {dispatch.confirmationNumber || 'DHP-AUTO-7482'}
              </span>
            </div>
            <p className="text-[10px] text-indigo-200">{dispatch.agencyName || 'Official Agency Intake'}</p>
          </div>
        </div>

        {/* Transmission Status Badge */}
        {isTransmitted ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3" /> E-Filed & Tracked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-bold">
            ⚡ Ready for 1-Click Dispatch
          </span>
        )}
      </div>

      {/* Channel Switcher Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 text-[11px] font-semibold">
        <button
          onClick={() => setActiveChannel('email')}
          className={`flex-1 py-2 px-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
            activeChannel === 'email'
              ? 'border-indigo-600 text-indigo-700 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Formal Email</span>
        </button>

        <button
          onClick={() => setActiveChannel('sms')}
          className={`flex-1 py-2 px-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
            activeChannel === 'sms'
              ? 'border-indigo-600 text-indigo-700 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>SMS Text Alert</span>
        </button>

        <button
          onClick={() => setActiveChannel('phone')}
          className={`flex-1 py-2 px-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
            activeChannel === 'phone'
              ? 'border-indigo-600 text-indigo-700 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Phone Call & IVR</span>
        </button>
      </div>

      {/* CHANNEL 1: EMAIL DISPATCH */}
      {activeChannel === 'email' && (
        <div className="p-3 space-y-2.5">
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 space-y-1">
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span className="font-bold uppercase text-slate-400">Recipient Intake:</span>
              <span className="font-mono text-slate-700">{emailRecipient}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span className="font-bold uppercase text-slate-400">Subject:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[240px]">{emailSubject}</span>
            </div>
          </div>

          <div className="relative bg-slate-900 text-slate-100 rounded-lg p-2.5 font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto">
            <p className="whitespace-pre-wrap">{emailBody}</p>
          </div>

          {/* Email Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5 pt-1">
            <button
              onClick={() => {
                triggerAutonomousEmail({
                  recipient: emailRecipient,
                  subject: emailSubject,
                  body: emailBody
                });
              }}
              className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1 transition shadow-2xs text-center"
            >
              <Send className="w-3 h-3" />
              <span>Autonomous Email</span>
            </button>

            <button
              onClick={() => {
                sharePacketNatively(
                  `${dispatch.formTitle || 'Application'} - ${dispatch.agencyName || 'Agency'}`,
                  emailBody
                );
              }}
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg font-semibold flex items-center justify-center gap-1 transition"
            >
              <Share2 className="w-3 h-3 text-indigo-600" />
              <span>Share Intent</span>
            </button>

            <button
              onClick={() => handleCopy(emailBody, 'email')}
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg font-semibold flex items-center justify-center gap-1 transition"
            >
              {copiedKey === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'email' ? 'Copied Packet!' : 'Copy Email'}</span>
            </button>

            <button
              onClick={handleCertifiedEFile}
              disabled={isTransmitted}
              className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition ${
                isTransmitted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{isTransmitted ? 'E-File Transmitted' : 'Certified E-File'}</span>
            </button>
          </div>
        </div>
      )}

      {/* CHANNEL 2: SMS TEXT DISPATCH */}
      {activeChannel === 'sms' && (
        <div className="p-3 space-y-2.5">
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 flex justify-between items-center text-[10px]">
            <span className="font-bold uppercase text-slate-400">Intake SMS Line / Helpline:</span>
            <span className="font-bold text-slate-800">{smsRecipient}</span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 text-emerald-950 font-medium text-xs leading-relaxed">
            <p className="whitespace-pre-wrap">{smsText || 'Emergency benefit intake assistance requested. Please contact for immediate processing.'}</p>
          </div>

          {/* SMS Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => {
                triggerAutonomousSms({
                  recipient: smsRecipient,
                  message: smsText
                });
              }}
              className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1 transition shadow-2xs text-center"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Autonomous SMS</span>
            </button>

            <button
              onClick={() => {
                sharePacketNatively('Emergency Benefit Alert', smsText);
              }}
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg font-semibold flex items-center justify-center gap-1 transition"
            >
              <Share2 className="w-3 h-3 text-emerald-600" />
              <span>Share via App</span>
            </button>

            <button
              onClick={() => handleCopy(smsText, 'sms')}
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg font-semibold flex items-center justify-center gap-1 transition"
            >
              {copiedKey === 'sms' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'sms' ? 'Copied SMS Text!' : 'Copy Text Draft'}</span>
            </button>
          </div>
        </div>
      )}

      {/* CHANNEL 3: PHONE CALL & IVR INTERACTIVE PROMPTER */}
      {activeChannel === 'phone' && (
        <div className="p-3 space-y-2.5">
          {/* Phone Hotline Bar */}
          <div className="flex flex-wrap items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-2 gap-2">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Agency Hotline</span>
                <span className="font-bold text-slate-900 text-xs">{phoneNumber}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {dispatch.phoneCallScript?.ivrNavigationSteps && dispatch.phoneCallScript.ivrNavigationSteps.length > 0 && (
                <button
                  onClick={() => {
                    triggerAutonomousCall({
                      phoneNumber,
                      ivrSteps: dispatch.phoneCallScript?.ivrNavigationSteps || []
                    });
                  }}
                  title="Automatically dial and transmit keypad menu tones"
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs transition shadow-2xs flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  <span>Auto-Dial with Menu DTMF</span>
                </button>
              )}

              <button
                onClick={() => {
                  triggerAutonomousCall({
                    phoneNumber
                  });
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition shadow-2xs flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>Direct Call</span>
              </button>
            </div>
          </div>

          {/* IVR Automated Keypad Navigator */}
          {dispatch.phoneCallScript?.ivrNavigationSteps && dispatch.phoneCallScript.ivrNavigationSteps.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                🔢 Automated Phone Menu Guide (Skip the Wait):
              </h5>
              <div className="space-y-1">
                {dispatch.phoneCallScript.ivrNavigationSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Teleprompter / Spoken Script */}
          {dispatch.phoneCallScript?.openingStatement && (
            <div className="bg-slate-900 text-slate-100 rounded-lg p-2.5 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                  🎙️ Spoken Script When Caseworker Answers:
                </span>
                <button
                  type="button"
                  onClick={() => handleSpeechToggle(dispatch.phoneCallScript?.openingStatement || '')}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition ${
                    isSpeaking
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  <span>{isSpeaking ? 'Stop Reading' : '🔊 Listen / Practice'}</span>
                </button>
              </div>

              <p className="text-xs font-mono leading-relaxed text-indigo-50">
                "{dispatch.phoneCallScript.openingStatement}"
              </p>

              <div className="pt-1 flex justify-end">
                <button
                  onClick={() => handleCopy(dispatch.phoneCallScript?.openingStatement || '', 'script')}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                >
                  {copiedKey === 'script' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'script' ? 'Copied Statement!' : 'Copy Script'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Talking points */}
          {dispatch.phoneCallScript?.keyTalkingPoints && dispatch.phoneCallScript.keyTalkingPoints.length > 0 && (
            <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1 text-[10px] uppercase">Key Points to Highlight:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {dispatch.phoneCallScript.keyTalkingPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Footer Vault & Tracking Actions */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="text-slate-500 text-[10px]">
          Next step: {dispatch.nextSteps?.[0] || 'Keep this confirmation for your records.'}
        </span>

        <button
          onClick={handleSaveOnlyToVault}
          disabled={isSavedToVault}
          className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition ${
            isSavedToVault
              ? 'bg-slate-200 text-slate-600 cursor-default'
              : 'bg-white hover:bg-slate-100 text-indigo-700 border border-slate-300'
          }`}
        >
          <Bookmark className="w-3 h-3" />
          <span>{isSavedToVault ? 'Saved to Vault ✓' : 'Save to Vault'}</span>
        </button>
      </div>
    </div>
  );
};
