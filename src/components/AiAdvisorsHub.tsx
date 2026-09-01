import React, { useState, useRef, useEffect } from 'react';
import { 
  AiAdvisorRole, 
  AiMessage, 
  UserProfile,
  SavedDocument,
  TrackedApplication,
  DispatchPackage,
  CorrespondenceAnalysis
} from '../types';
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  Heart, 
  Shield, 
  Stethoscope, 
  Scale, 
  Sparkles, 
  Dog, 
  Loader2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Paperclip,
  X,
  Volume2,
  VolumeX,
  Zap,
  Phone,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { DaisyMascotBadge } from './DaisyMascotBadge';
import { AiDispatchCard } from './AiDispatchCard';
import { AiCorrespondenceCard } from './AiCorrespondenceCard';
import confetti from 'canvas-confetti';

interface AiAdvisorsHubProps {
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onNavigateToForm: (formId: string) => void;
  onNavigateToMap: (category?: string) => void;
  onOpenGrounding: () => void;
  onOpenPetHub: () => void;
  onSaveDocument?: (doc: SavedDocument) => void;
  onAddTrackedApplication?: (app: TrackedApplication) => void;
}

interface SpecialistMeta {
  role: AiAdvisorRole;
  name: string;
  badge: string;
  avatarIcon: any;
  color: string;
  activeColor: string;
  textColor: string;
  description: string;
  samplePrompts: string[];
}

const SPECIALISTS: SpecialistMeta[] = [
  {
    role: 'daisy_general',
    name: 'Daisy the Mascot',
    badge: 'Chief Companion & Guide',
    avatarIcon: Dog,
    color: 'bg-teal-50 border-teal-200 text-teal-900',
    activeColor: 'bg-teal-600 text-white border-teal-700 shadow-md',
    textColor: 'text-teal-700',
    description: "Loyal, Disney-styled pit bull with one blue eye and one brown eye! Sniffing out safe shelter, meals, clinics, and hope.",
    samplePrompts: [
      "Where can I find safe emergency shelter tonight with my dog?",
      "I need a hot meal and a place to take a shower today.",
      "Can you give me an encouraging word? Today has been really hard."
    ]
  },
  {
    role: 'caseworker',
    name: 'AI Caseworker',
    badge: 'Autonomous Benefits & Dispatch',
    avatarIcon: FileText,
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    activeColor: 'bg-blue-600 text-white border-blue-700 shadow-md',
    textColor: 'text-blue-700',
    description: "Autonomously prepares & dispatches SNAP (EBT), Medicaid, Section 8, Emergency Housing Vouchers, free phones, and ID fee waivers with email/SMS/call scripts.",
    samplePrompts: [
      "Auto-file an expedited SNAP food stamps application and draft email/call script.",
      "Help me apply for an Emergency Housing Voucher with pet-friendly shelter.",
      "Draft a formal request and IVR phone script for a free replacement State ID."
    ]
  },
  {
    role: 'doctor',
    name: 'Dr. Morgan (AI MD)',
    badge: 'Street Medicine & First Aid',
    avatarIcon: Stethoscope,
    color: 'bg-rose-50 border-rose-200 text-rose-900',
    activeColor: 'bg-rose-600 text-white border-rose-700 shadow-md',
    textColor: 'text-rose-700',
    description: "Street wound care, blister prevention, managing chronic meds without a fridge, hypothermia triage, and free clinic referrals.",
    samplePrompts: [
      "I have a painful infected blister on my foot from wet boots. What should I do?",
      "How do I safely store my diabetes insulin while living in a tent?",
      "What are the warning signs of hypothermia or severe dehydration?"
    ]
  },
  {
    role: 'vet',
    name: 'Dr. Bailey (AI Vet)',
    badge: "Daisy's Pet Health & Safety",
    avatarIcon: Dog,
    color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    activeColor: 'bg-emerald-600 text-white border-emerald-700 shadow-md',
    textColor: 'text-emerald-700',
    description: "Dedicated to companions of unhoused friends! Free pet vaccines, flea/tick relief, paw pad care, and Service Animal / ESA legal rights.",
    samplePrompts: [
      "Draft an emergency vet care assistance request and phone script for my dog.",
      "My cat has fleas and is scratching constantly. What safe remedies can I use?",
      "Is my dog legally allowed in an emergency shelter as an Emotional Support Animal?"
    ]
  },
  {
    role: 'lawyer',
    name: 'Jordan Vance, Esq. (AI Legal)',
    badge: 'Civil Rights & Appeal Dispatch',
    avatarIcon: Scale,
    color: 'bg-purple-50 border-purple-200 text-purple-900',
    activeColor: 'bg-purple-600 text-white border-purple-700 shadow-md',
    textColor: 'text-purple-700',
    description: "4th Amendment encampment property rights, notice of sweeps, clear low-level warrants, and appeal public benefit denials with full legal letters.",
    samplePrompts: [
      "The city posted a notice to sweep our camp. What are my legal property rights?",
      "Draft an urgent appeal letter for a SNAP benefit discontinuance notice.",
      "Can I clear a failure-to-appear court citation without getting arrested?"
    ]
  },
  {
    role: 'therapist',
    name: 'Rowan (AI Supportive Counselor)',
    badge: 'Trauma-Informed Crisis Support',
    avatarIcon: Heart,
    color: 'bg-pink-50 border-pink-200 text-pink-900',
    activeColor: 'bg-pink-600 text-white border-pink-700 shadow-md',
    textColor: 'text-pink-700',
    description: "Gentle, non-judgmental emotional support, PTSD de-escalation, 5-4-3-2-1 sensory grounding, and crisis safety planning.",
    samplePrompts: [
      "I'm feeling overwhelmed by panic and stress. Can you guide me through a calming exercise?",
      "I feel like giving up. Everything feels hopeless right now.",
      "How do I deal with constant hyper-vigilance and sleep anxiety on the street?"
    ]
  }
];

const NOTICE_SAMPLE_PRESETS = [
  {
    title: 'SNAP Food Stamps Discontinuance Notice',
    agency: 'Department of Social & Health Services (DSHS)',
    text: `STATE OF WASHINGTON - NOTICE OF ACTION
Case #: DSHS-7492019
RE: Notice of Food Assistance Discontinuance
Effective Date: 10 calendar days from notice date
Reason: Client failed to attend mandatory recertification phone interview on 08/15.
Rights: You have the right to request a Fair Hearing and Administrative Appeal within 10 days to maintain Aid Paid Pending.`
  },
  {
    title: 'Notice of Encampment Clean-Up & Sweep',
    agency: 'City Department of Transportation / Encampment Resolution',
    text: `CITY NOTICE: REMOVAL OF PERSONAL PROPERTY
Location: 4th Ave & Madison Underpass
Scheduled Date: Friday at 8:00 AM
Warning: All personal items, tents, and bedding remaining on public property will be removed and stored for 60 days. Personal property can be retrieved at City Central Warehouse.`
  },
  {
    title: 'Medicaid Annual Renewal / Information Request',
    agency: 'State Health Care Authority',
    text: `HEALTH BENEFIT EXCHANGE - URGENT ACTION REQUIRED
To Kyle Peterson:
Your Medicaid / Apple Health coverage is scheduled to expire in 14 days due to unverified address and income documents. 
Submit proof of zero income or statement of homelessness immediately to maintain full continuous health coverage.`
  }
];

export const AiAdvisorsHub: React.FC<AiAdvisorsHubProps> = ({
  userProfile,
  onUpdateProfile,
  onNavigateToForm,
  onNavigateToMap,
  onOpenGrounding,
  onOpenPetHub,
  onSaveDocument,
  onAddTrackedApplication,
}) => {
  const [selectedRole, setSelectedRole] = useState<AiAdvisorRole>('daisy_general');
  const [messagesByRole, setMessagesByRole] = useState<Record<AiAdvisorRole, AiMessage[]>>({
    daisy_general: [
      {
        id: 'msg-daisy-init',
        sender: 'assistant',
        role: 'daisy_general',
        text: "Tail wag and warm hello! I'm Daisy, your Disney-styled pit bull companion with one crystal blue eye and one warm brown eye. I'm here by your side 24/7. How can my team and I support you today?",
        timestamp: 'Just now',
        suggestedActions: [
          { label: '🛏️ Find Open Beds', actionType: 'search_map', payload: { category: 'shelter' } },
          { label: '🍱 Free Hot Meals', actionType: 'search_map', payload: { category: 'food' } },
          { label: '🐾 Daisy Pet Clinic', actionType: 'search_map', payload: { category: 'vet' } }
        ]
      }
    ],
    caseworker: [
      {
        id: 'msg-case-init',
        sender: 'assistant',
        role: 'caseworker',
        text: "Hello! I am your AI Caseworker with full Autonomous Dispatch capability. I can directly prepare and e-file applications for SNAP food stamps, Medicaid, Housing Vouchers, and free phones, complete with ready-to-send emails, SMS text alerts, and live phone/IVR call scripts. What benefit shall we dispatch for you?",
        timestamp: 'Just now',
        suggestedActions: [
          { label: '📝 Auto-File Expedited SNAP', actionType: 'auto_dispatch', payload: { prompt: 'Auto-file an expedited SNAP application for me with zero income declarations and full email/SMS/call script dispatch package.' } },
          { label: '🛏️ Emergency Housing Voucher', actionType: 'auto_dispatch', payload: { prompt: 'File an Emergency Housing Voucher packet with coordinated entry assistance.' } },
          { label: '🪪 Free State ID Fee Waiver', actionType: 'fill_form', payload: { formId: 'id_replacement_affidavit' } }
        ]
      }
    ],
    doctor: [
      {
        id: 'msg-doc-init',
        sender: 'assistant',
        role: 'doctor',
        text: "Hi there, I'm Dr. Morgan, your street medicine medical assistant. If you have a cut, foot pain, chronic illness questions, or need to locate a free walk-in clinic, let me know. What symptoms are you experiencing?",
        timestamp: 'Just now',
        suggestedActions: [
          { label: '🩺 Free Mobile Health Clinics', actionType: 'search_map', payload: { category: 'medical' } },
          { label: '🏥 Medicaid Enrollment Form', actionType: 'fill_form', payload: { formId: 'medicaid' } }
        ]
      }
    ],
    vet: [
      {
        id: 'msg-vet-init',
        sender: 'assistant',
        role: 'vet',
        text: "Welcome to Daisy's Pet Clinic! I am Dr. Bailey. Your pets are family, and we are committed to keeping them healthy, fed, and by your side. I can also generate emergency veterinary voucher requests and clinic outreach scripts. How can I help your dog, cat, or companion today?",
        timestamp: 'Just now',
        suggestedActions: [
          { label: '🐕 Open Pet Wellness Hub', actionType: 'view_pet_care' },
          { label: '🐾 Free Pet Vaccines & Food', actionType: 'search_map', payload: { category: 'vet' } }
        ]
      }
    ],
    lawyer: [
      {
        id: 'msg-law-init',
        sender: 'assistant',
        role: 'lawyer',
        text: "Greetings. I am Jordan Vance, Esq., your legal advocate. You have constitutional rights regardless of housing status. Click '📎 Review / Appeal Notice' below to upload any eviction notice, benefit denial, or sweep warning, and I will generate an autonomous legal appeal and response package immediately.",
        timestamp: 'Just now',
        suggestedActions: [
          { label: '📜 Appeal Benefit / Housing Denial', actionType: 'fill_form', payload: { formId: 'benefit_denial_appeal' } }
        ]
      }
    ],
    therapist: [
      {
        id: 'msg-ther-init',
        sender: 'assistant',
        role: 'therapist',
        text: "Take a gentle breath. You are in a safe, judgment-free space with me and Daisy. Living with uncertainty takes an enormous emotional toll. I'm here to listen, support you, or walk through a grounding exercise whenever you're ready.",
        timestamp: 'Just now',
        suggestedActions: [
          { label: '🌿 5-4-3-2-1 Calming Exercise', actionType: 'grounding_exercise' },
          { label: '📞 Call 988 Crisis Line', actionType: 'call_hotline', payload: { number: '988' } }
        ]
      }
    ]
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeText, setNoticeText] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSpecialist = SPECIALISTS.find((s) => s.role === selectedRole) || SPECIALISTS[0];
  const activeMessages = messagesByRole[selectedRole] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, selectedRole, isSending]);

  const handleSendMessage = async (textToSend?: string, attachedNoticeContent?: string) => {
    const messageText = (textToSend || inputPrompt).trim();
    if (!messageText && !attachedNoticeContent) return;
    if (isSending) return;

    setInputPrompt('');
    setIsSending(true);

    const userMsg: AiMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      role: selectedRole,
      text: attachedNoticeContent 
        ? `${messageText || 'Please analyze this attached notice and generate an autonomous appeal/response packet.'}\n\n📄 [Attached Notice]:\n${attachedNoticeContent.slice(0, 300)}...`
        : messageText,
      timestamp: 'Just now',
    };

    // Optimistically append user message
    setMessagesByRole((prev) => ({
      ...prev,
      [selectedRole]: [...(prev[selectedRole] || []), userMsg],
    }));

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          message: messageText || 'Please analyze this attached notice and draft an autonomous multi-channel response package.',
          history: activeMessages,
          userProfile,
          attachedNotice: attachedNoticeContent || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get advisor response');
      }

      const data = await res.json();

      const botMsg: AiMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        role: selectedRole,
        text: data.reply || "I'm right here with you!",
        timestamp: 'Just now',
        dispatchPackage: data.dispatchPackage || undefined,
        correspondenceAnalysis: data.correspondenceAnalysis || undefined,
        suggestedActions: data.suggestedActions || [],
      };

      setMessagesByRole((prev) => ({
        ...prev,
        [selectedRole]: [...(prev[selectedRole] || []), botMsg],
      }));

      // If a dispatch package was returned with confirmation, cheer user up
      if (data.dispatchPackage?.confirmationNumber) {
        confetti({ particleCount: 30, spread: 50 });
      }
    } catch (error: any) {
      const errorMsg: AiMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        role: selectedRole,
        text: "I'm having a brief connection hitch, but Daisy and I are still right here! Please try sending your question once more.",
        timestamp: 'Just now',
      };
      setMessagesByRole((prev) => ({
        ...prev,
        [selectedRole]: [...(prev[selectedRole] || []), errorMsg],
      }));
    } finally {
      setIsSending(false);
    }
  };

  const handleActionClick = (action: { label: string; actionType: string; payload?: any }) => {
    if (action.actionType === 'search_map') {
      onNavigateToMap(action.payload?.category);
    } else if (action.actionType === 'fill_form') {
      onNavigateToForm(action.payload?.formId || 'snap_ebt');
    } else if (action.actionType === 'view_pet_care') {
      onOpenPetHub();
    } else if (action.actionType === 'grounding_exercise') {
      onOpenGrounding();
    } else if (action.actionType === 'call_hotline') {
      window.location.href = `tel:${action.payload?.number || '988'}`;
    } else if (action.actionType === 'auto_dispatch') {
      handleSendMessage(action.payload?.prompt || 'Auto-file this benefit application for me.');
    }
  };

  const handleSpeakBotMessage = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingMessageId(msgId);
    }
  };

  const handleApplyPresetNotice = (preset: { title: string; text: string }) => {
    setNoticeText(preset.text);
  };

  const handleSubmitNoticeModal = () => {
    if (!noticeText.trim()) return;
    const text = noticeText.trim();
    setShowNoticeModal(false);
    setNoticeText('');
    handleSendMessage('Please review this notice and draft an autonomous multi-channel appeal and response package for me.', text);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden min-h-[640px] relative">
      
      {/* LEFT SIDEBAR: Specialists Selector */}
      <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/70 p-3 flex flex-col justify-between shrink-0">
        <div>
          {/* Top Brand Greeting */}
          <div className="flex items-center gap-2.5 mb-3 p-1.5">
            <DaisyMascotBadge size="sm" animate={true} />
            <div>
              <h2 className="text-xs font-bold text-slate-900 font-heading">Daisy's Care Team</h2>
              <p className="text-[10px] text-slate-500 font-medium">6 Specialized AI Advocates</p>
            </div>
          </div>

          {/* Specialists List */}
          <div className="space-y-1">
            {SPECIALISTS.map((s) => {
              const Icon = s.avatarIcon;
              const isSelected = selectedRole === s.role;
              return (
                <button
                  key={s.role}
                  onClick={() => setSelectedRole(s.role)}
                  className={`w-full p-2 rounded-xl text-left transition flex items-center gap-2.5 border ${
                    isSelected ? s.activeColor : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {s.role === 'daisy_general' ? (
                      <span className="text-sm">🐾</span>
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate">{s.name}</span>
                    </div>
                    <p className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                      {s.badge}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Autonomous Dispatch Banner in Sidebar */}
        <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/70 text-indigo-950 text-xs">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[11px] font-heading font-bold">Autonomous E-Filing</span>
          </div>
          <p className="text-[10px] text-indigo-900 leading-relaxed">
            Our AI can draft complete Email, SMS, and IVR Phone scripts to directly contact caseworkers and intake desks for you.
          </p>
        </div>
      </div>

      {/* RIGHT MAIN PANEL: Active Chat with Specialist */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        
        {/* Chat Header */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/40">
          <div className="flex items-center gap-2.5 min-w-0">
            {selectedRole === 'daisy_general' ? (
              <DaisyMascotBadge size="sm" animate={false} />
            ) : (
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${currentSpecialist.color}`}>
                <currentSpecialist.avatarIcon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm font-heading truncate">{currentSpecialist.name}</h3>
                <span className="px-1.5 py-0.2 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-800 text-[10px] font-bold shrink-0">
                  {currentSpecialist.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">{currentSpecialist.description}</p>
            </div>
          </div>

          {/* Quick Notice Review Button */}
          <button
            onClick={() => setShowNoticeModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition shrink-0 shadow-2xs"
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Review / Appeal Notice</span>
            <span className="sm:hidden">Notice</span>
          </button>
        </div>

        {/* Chat Scrollable Message List */}
        <div className="flex-1 p-3 md:p-4 overflow-y-auto space-y-3">
          {activeMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="shrink-0 mt-0.5">
                  {selectedRole === 'daisy_general' ? (
                    <DaisyMascotBadge size="sm" animate={false} />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                      <currentSpecialist.avatarIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              )}

              <div className={`max-w-[90%] sm:max-w-[85%] md:max-w-[78%] space-y-1.5`}>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed relative ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Audio Read-Aloud for Assistant Messages */}
                  {msg.sender === 'assistant' && (
                    <div className="pt-1.5 flex justify-end">
                      <button
                        onClick={() => handleSpeakBotMessage(msg.id, msg.text)}
                        className="text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 font-semibold transition"
                      >
                        {speakingMessageId === msg.id ? (
                          <>
                            <VolumeX className="w-3 h-3 text-rose-500 animate-pulse" />
                            <span className="text-rose-500">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* AUTONOMOUS DISPATCH PACKAGE CARD */}
                {msg.dispatchPackage && (
                  <AiDispatchCard
                    dispatch={msg.dispatchPackage}
                    userProfile={userProfile}
                    onSaveDocument={onSaveDocument}
                    onAddTrackedApplication={onAddTrackedApplication}
                  />
                )}

                {/* CORRESPONDENCE / NOTICE ANALYSIS & APPEAL CARD */}
                {msg.correspondenceAnalysis && (
                  <AiCorrespondenceCard
                    analysis={msg.correspondenceAnalysis}
                    userProfile={userProfile}
                    onSaveDocument={onSaveDocument}
                  />
                )}

                {/* Suggested Action Buttons if attached */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {msg.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleActionClick(act)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1 shadow-2xs transition"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3 text-indigo-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2.5 text-slate-400 text-xs py-1.5">
              <DaisyMascotBadge size="sm" animate={true} />
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span className="text-xs">{currentSpecialist.name} is preparing your dispatch packet & resources...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Sample Questions Pills */}
        <div className="px-3 py-1.5 bg-slate-50/70 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">Try asking:</span>
          {currentSpecialist.samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-[11px] whitespace-nowrap transition shadow-2xs font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* 1-Click Autonomous Action Bar */}
        <div className="px-3 py-1.5 bg-indigo-50/40 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold uppercase text-indigo-800 flex items-center gap-1 shrink-0">
            <Zap className="w-3 h-3 text-indigo-600" /> 1-Click Dispatch:
          </span>

          <button
            onClick={() => handleSendMessage('Auto-file an expedited SNAP / EBT food stamps application and generate complete email, text, and phone call IVR scripts for me.')}
            className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-md text-[10px] font-bold whitespace-nowrap transition shadow-2xs"
          >
            🍱 E-File SNAP (EBT)
          </button>

          <button
            onClick={() => handleSendMessage('Auto-file an Emergency Housing Voucher application for me with pet-friendly shelter intake instructions.')}
            className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-md text-[10px] font-bold whitespace-nowrap transition shadow-2xs"
          >
            🛏️ Housing Voucher
          </button>

          <button
            onClick={() => handleSendMessage('Help me claim a free Lifeline government smartphone and tablet with zero income.')}
            className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-md text-[10px] font-bold whitespace-nowrap transition shadow-2xs"
          >
            📱 Free Phone & Data
          </button>

          <button
            onClick={() => handleSendMessage('Draft a Washington State DMV homeless ID fee waiver affidavit and birth certificate request package.')}
            className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-md text-[10px] font-bold whitespace-nowrap transition shadow-2xs"
          >
            🪪 Free ID Waiver
          </button>

          <button
            onClick={() => handleSendMessage('Draft an emergency veterinary care assistance voucher and clinic outreach script for my pet.')}
            className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-md text-[10px] font-bold whitespace-nowrap transition shadow-2xs"
          >
            🐾 Pet Clinic Voucher
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-2.5 md:p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setShowNoticeModal(true)}
              title="Upload / Paste Agency Notice to Appeal"
              className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 rounded-xl transition shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={`Ask ${currentSpecialist.name} or say "File for food stamps / vouchers / phone"...`}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
            />
            
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isSending}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* NOTICE & CORRESPONDENCE REVIEW MODAL */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-xs">
            
            {/* Modal Header */}
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span className="font-bold font-heading text-sm">Notice & Correspondence Analyzer</span>
              </div>
              <button
                onClick={() => setShowNoticeModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto">
              <p className="text-slate-600 text-xs leading-relaxed">
                Paste any letter, notice of action, benefit denial, sanction, eviction warning, or sweep flyer. Our AI will analyze the legal deadlines, explain it in simple English, and generate a complete formal response packet.
              </p>

              {/* Sample Presets */}
              <div>
                <span className="font-bold text-[10px] uppercase text-slate-400 block mb-1.5">
                  Or Test with a Sample Notice:
                </span>
                <div className="space-y-1.5">
                  {NOTICE_SAMPLE_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => handleApplyPresetNotice(preset)}
                      className="w-full p-2 text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition"
                    >
                      <span className="font-bold text-slate-900 block text-xs">{preset.title}</span>
                      <span className="text-[10px] text-slate-500">{preset.agency}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label className="font-bold text-[10px] uppercase text-slate-500 block mb-1">
                  Notice Text / Letter Content:
                </label>
                <textarea
                  rows={6}
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  placeholder="Paste the text of the letter, email, text message, or notice here..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowNoticeModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitNoticeModal}
                disabled={!noticeText.trim()}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Analyze & Generate Appeal</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
