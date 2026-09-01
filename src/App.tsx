import React, { useState, useEffect } from 'react';
import { 
  Resource, 
  UserProfile, 
  SavedDocument, 
  TrackedApplication,
  Review, 
  CheckIn, 
  AiAdvisorRole 
} from './types';
import { INITIAL_RESOURCES } from './data/initialResources';
import { MapView } from './components/MapView';
import { GoogleMapView } from './components/GoogleMapView';
import { GoogleWorkspaceHub } from './components/GoogleWorkspaceHub';
import { ResourceCard } from './components/ResourceCard';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { AddResourceModal } from './components/AddResourceModal';
import { AiAdvisorsHub } from './components/AiAdvisorsHub';
import { BenefitsFormsHub } from './components/BenefitsFormsHub';
import { PetCareHub } from './components/PetCareHub';
import { UserProfileLocker } from './components/UserProfileLocker';
import { EmergencyCrisisModal } from './components/EmergencyCrisisModal';
import { GroundingExerciseModal } from './components/GroundingExerciseModal';
import { AndroidApkModal } from './components/AndroidApkModal';
import { DaisyMascotBadge } from './components/DaisyMascotBadge';
import { 
  MapPin, 
  Bot, 
  FileText, 
  Dog, 
  User, 
  AlertCircle, 
  Heart, 
  Search, 
  Plus, 
  Phone, 
  ShieldCheck, 
  Menu, 
  X,
  Layers,
  Sparkles,
  LifeBuoy,
  Smartphone,
  Download,
  Mail,
  HardDrive,
  Calendar as CalendarIcon,
  CheckSquare,
  MessageSquare,
  Users
} from 'lucide-react';

const LOCAL_STORAGE_PROFILE_KEY = 'daisy_helping_paws_user_profile_v1';

export const App: React.FC = () => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'map' | 'workspace' | 'advisors' | 'forms' | 'pets' | 'profile'>('map');
  const [mapEngine, setMapEngine] = useState<'google' | 'osm'>('google');
  
  // Modals
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showGroundingModal, setShowGroundingModal] = useState(false);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [preselectedFormId, setPreselectedFormId] = useState<string | undefined>(undefined);

  // Map and Resources State
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [filterPetFriendly, setFilterPetFriendly] = useState(false);
  const [filterBedsOnly, setFilterBedsOnly] = useState(false);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mapMobileViewMode, setMapMobileViewMode] = useState<'split' | 'map' | 'list'>('split');

  // User Profile State with local persistence
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      id: 'local-user-1',
      fullName: '',
      preferredName: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      ssnLast4: '',
      monthlyIncome: 0,
      housingStatus: 'unsheltered',
      veteranStatus: false,
      hasDisability: false,
      hasPets: true,
      pets: [
        {
          id: 'pet-1',
          name: 'Buddy',
          species: 'dog',
          breed: 'Pitbull Terrier Mix',
          age: '3 years',
          isServiceOrESA: true,
          vaccinated: true,
        }
      ],
      savedDocuments: [],
    };
  });

  // Save profile changes to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(userProfile));
    } catch (e) {
      console.error(e);
    }
  }, [userProfile]);

  // Fetch live resources from backend API
  useEffect(() => {
    fetch('/api/resources')
      .then((res) => res.json())
      .then((data) => {
        if (data.resources && data.resources.length > 0) {
          setResources(data.resources);
        }
      })
      .catch((err) => {
        console.warn('Using local fallback resources:', err);
      });
  }, []);

  // Get User GPS Location
  const handleGetUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, centering on Seattle default.', err);
          setUserCoords({ lat: 47.6062, lng: -122.3321 });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setUserCoords({ lat: 47.6062, lng: -122.3321 });
    }
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveDocument = (doc: SavedDocument) => {
    setUserProfile((prev) => ({
      ...prev,
      savedDocuments: [doc, ...(prev.savedDocuments || [])],
    }));
  };

  const handleAddTrackedApplication = (app: TrackedApplication) => {
    setUserProfile((prev) => ({
      ...prev,
      trackedApplications: [app, ...(prev.trackedApplications || [])],
    }));
  };

  const handleDeleteDocument = (docId: string) => {
    setUserProfile((prev) => ({
      ...prev,
      savedDocuments: (prev.savedDocuments || []).filter((d) => d.id !== docId),
    }));
  };

  // Filter resources based on search and active filters
  const filteredResources = resources.filter((res) => {
    if (activeCategory !== 'all' && res.category !== activeCategory) return false;
    if (filterPetFriendly && !res.petFriendly) return false;
    if (filterBedsOnly && (!res.bedsAvailable || res.bedsAvailable <= 0)) return false;
    if (filterVerifiedOnly && !(res.verificationTier === 'verified' || res.verificationTier === 'community_verified' || res.verified)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = res.name.toLowerCase().includes(q);
      const matchDesc = res.description.toLowerCase().includes(q);
      const matchAddr = res.address.toLowerCase().includes(q);
      const matchSrv = res.servicesOffered?.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchAddr && !matchSrv) return false;
    }
    return true;
  });

  const handleVerifyResource = async (resourceId: string, action: 'confirm' | 'flag', reason?: string) => {
    try {
      const res = await fetch(`/api/resources/${resourceId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          authorName: userProfile.preferredName || userProfile.fullName || 'Community Peer',
          reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResources((prev) =>
          prev.map((r) => {
            if (r.id === resourceId) {
              return {
                ...r,
                verificationTier: data.verificationTier,
                upvotesCount: data.upvotesCount,
                downvotesCount: data.downvotesCount,
                verificationLogs: data.verificationLogs,
                verified: data.verificationTier === 'verified' || data.verificationTier === 'community_verified',
              };
            }
            return r;
          })
        );
        if (selectedResource?.id === resourceId) {
          setSelectedResource((prev) =>
            prev
              ? {
                  ...prev,
                  verificationTier: data.verificationTier,
                  upvotesCount: data.upvotesCount,
                  downvotesCount: data.downvotesCount,
                  verificationLogs: data.verificationLogs,
                  verified: data.verificationTier === 'verified' || data.verificationTier === 'community_verified',
                }
              : null
          );
        }
      }
    } catch (e) {
      console.error('Error submitting verification vote:', e);
    }
  };

  const handlePostReview = async (resourceId: string, review: Partial<Review>) => {
    try {
      const res = await fetch(`/api/resources/${resourceId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      const data = await res.json();
      if (data.resource) {
        setResources((prev) => prev.map((r) => (r.id === resourceId ? data.resource : r)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostCheckIn = async (resourceId: string, checkIn: Partial<CheckIn>) => {
    try {
      const res = await fetch(`/api/resources/${resourceId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkIn),
      });
      const data = await res.json();
      if (data.resource) {
        setResources((prev) => prev.map((r) => (r.id === resourceId ? data.resource : r)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddResource = async (newResData: Partial<Resource>) => {
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResData),
      });
      const data = await res.json();
      if (data.resource) {
        setResources((prev) => [data.resource, ...prev]);
        setSelectedResource(data.resource);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* TOP GLOBAL NAVBAR (Mobile-First Compact Header) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-2">
          
          {/* Logo & Mascot Brand */}
          <div 
            onClick={() => setActiveTab('map')} 
            className="flex items-center gap-2 cursor-pointer group shrink min-w-0"
          >
            <DaisyMascotBadge size="sm" animate={true} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-heading font-bold text-indigo-700 text-sm sm:text-base md:text-lg tracking-tight truncate">
                  Daisy's Helping Paws
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold">
                  24/7 Care Hub
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block truncate">
                Homeless Resources, Medical, Pet Care & Legal Advocacy
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-white text-indigo-900 shadow-xs border border-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Google Maps & Shelters</span>
            </button>

            <button
              onClick={() => setActiveTab('workspace')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'workspace'
                  ? 'bg-white text-indigo-900 shadow-xs border border-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-rose-600" />
              <span>Google Workspace Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('advisors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'advisors'
                  ? 'bg-white text-indigo-900 shadow-xs border border-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Care Team (6 Experts)</span>
            </button>

            <button
              onClick={() => {
                setPreselectedFormId(undefined);
                setActiveTab('forms');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'forms'
                  ? 'bg-white text-indigo-900 shadow-xs border border-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>Benefits & Forms</span>
            </button>

            <button
              onClick={() => setActiveTab('pets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'pets'
                  ? 'bg-white text-indigo-900 shadow-xs border border-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Dog className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pet Care & ESA Rights</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-white text-indigo-900 shadow-xs border border-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>My Vault & Docs</span>
            </button>
          </nav>

          {/* Header Action Buttons & Emergency Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick specialist avatar cluster on large screens */}
            <div className="hidden xl:flex -space-x-1.5 items-center">
              <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600" title="Dr. Morgan (Medical MD)">DR</div>
              <div className="w-7 h-7 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-green-600" title="Dr. Bailey (Daisy Vet)">VT</div>
              <div className="w-7 h-7 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-purple-600" title="Jordan Vance (Legal Defense)">LW</div>
              <div className="w-7 h-7 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-pink-600" title="Rowan (Therapy & Calm)">TH</div>
            </div>

            <button
              onClick={() => setShowApkModal(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold hidden md:flex items-center gap-1.5 transition shadow-2xs"
              title="Android APK download & autonomous phone calling/texting"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Android APK</span>
            </button>

            <button
              onClick={() => setShowGroundingModal(true)}
              className="px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-semibold hidden sm:flex items-center gap-1.5 transition"
              title="Calm panic or acute anxiety"
            >
              <Heart className="w-3.5 h-3.5 text-pink-600 fill-pink-600" />
              <span>Calm (5-4-3-2-1)</span>
            </button>

            {/* Emergency Help Button */}
            <button
              onClick={() => setShowCrisisModal(true)}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold shadow-xs flex items-center gap-1 transition shrink-0"
              title="Emergency Help & Crisis Lines"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Emergency</span>
            </button>

            {/* Mobile quick more menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MODAL DRAWER OVERLAY (Non-Intrusive, Never Pushes Content Down) */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="bg-white rounded-t-2xl p-4 space-y-2 border-t border-slate-200 max-h-[85vh] overflow-y-auto shadow-2xl animate-slide-up safe-bottom-padding"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <DaisyMascotBadge size="sm" animate={false} />
                <span className="font-heading font-bold text-sm text-slate-900">Daisy's Care Tools</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => {
                  setActiveTab('map');
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-800 border border-slate-200/60"
              >
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-900">🗺️ Google Maps & Shelters</div>
                  <div className="text-[10px] text-slate-500">Live bed counter, pantries & hygiene</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('workspace');
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-800 border border-slate-200/60"
              >
                <HardDrive className="w-4 h-4 text-rose-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-900">💼 Google Workspace Suite</div>
                  <div className="text-[10px] text-slate-500">Gmail, Calendar, Tasks, Chat, Contacts & Drive</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('advisors');
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-800 border border-slate-200/60"
              >
                <Bot className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-900">🤖 AI Care Team (6 Experts)</div>
                  <div className="text-[10px] text-slate-500">Daisy, Doctor, Vet, Lawyer & Counselor</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setPreselectedFormId(undefined);
                  setActiveTab('forms');
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-800 border border-slate-200/60"
              >
                <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-900">📝 Benefits & E-Filing</div>
                  <div className="text-[10px] text-slate-500">SNAP food, Medicaid, Housing & ID docs</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('pets');
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-800 border border-slate-200/60"
              >
                <Dog className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-900">🐾 Pet Care & Service Animals</div>
                  <div className="text-[10px] text-slate-500">Food banks, mobile vets & legal rights</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-800 border border-slate-200/60"
              >
                <User className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-900">🗄️ Private Vault & Documents</div>
                  <div className="text-[10px] text-slate-500">Encrypted offline ID & medical locker</div>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowApkModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl text-left text-xs font-semibold flex flex-col gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200"
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                    <span>Android APK</span>
                  </div>
                  <span className="text-[10px] text-emerald-700">Native Telephony & Offline GPS</span>
                </button>

                <button
                  onClick={() => {
                    setShowGroundingModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl text-left text-xs font-semibold flex flex-col gap-1 bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200"
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <Heart className="w-4 h-4 text-pink-600 fill-pink-600" />
                    <span>Calm (5-4-3-2-1)</span>
                  </div>
                  <span className="text-[10px] text-pink-700">De-escalate panic & stress</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 lg:p-6 pb-20 md:pb-6 flex flex-col min-w-0">
        
        {/* TAB 1: GPS MAP & RESOURCES DIRECTORY */}
        {activeTab === 'map' && (
          <div className="flex-1 flex flex-col space-y-3 w-full min-w-0">
            
            {/* Search & Mobile View Switcher Bar (Responsive CSS Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-xs w-full min-w-0 items-center">
              <div className="sm:col-span-7 lg:col-span-7 relative w-full min-w-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shelters, pantries, clinics, showers..."
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Mobile Map / List / Split Segmented Control */}
              <div className="sm:col-span-5 lg:hidden flex w-full items-center justify-between gap-1.5 min-w-0">
                <div className="grid grid-cols-3 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold flex-1 min-w-0">
                  <button
                    onClick={() => setMapMobileViewMode('map')}
                    className={`px-1.5 py-1 rounded-md transition text-center truncate ${
                      mapMobileViewMode === 'map'
                        ? 'bg-white text-indigo-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🗺️ Map
                  </button>
                  <button
                    onClick={() => setMapMobileViewMode('split')}
                    className={`px-1.5 py-1 rounded-md transition text-center truncate ${
                      mapMobileViewMode === 'split'
                        ? 'bg-white text-indigo-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⚡ Split
                  </button>
                  <button
                    onClick={() => setMapMobileViewMode('list')}
                    className={`px-1.5 py-1 rounded-md transition text-center truncate ${
                      mapMobileViewMode === 'list'
                        ? 'bg-white text-indigo-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📋 List ({filteredResources.length})
                  </button>
                </div>

                <button
                  onClick={() => setShowAddResourceModal(true)}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>
              </div>

              {/* Desktop Showing Count & Report Button */}
              <div className="hidden lg:flex lg:col-span-5 items-center justify-end gap-3 min-w-0">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                  Showing <span className="font-bold text-slate-800">{filteredResources.length}</span> resources
                </span>

                <button
                  onClick={() => setShowAddResourceModal(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Report Resource</span>
                </button>
              </div>
            </div>

            {/* Responsive Map & List CSS Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 flex-1 w-full min-w-0">
              
              {/* Interactive Map Column with Engine Selector */}
              <div className={`lg:col-span-7 min-w-0 relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 transition-all flex flex-col ${
                mapMobileViewMode === 'list' ? 'hidden lg:block' : ''
              } ${
                mapMobileViewMode === 'map' ? 'h-[72vh] lg:h-[620px]' : 'h-[280px] sm:h-[380px] lg:h-[620px]'
              }`}>
                
                {/* Engine Selector Pill */}
                <div className="absolute top-3 right-3 z-20 flex items-center bg-white/95 backdrop-blur-xs p-1 rounded-xl border border-slate-200 shadow-xs text-[10px] font-bold">
                  <button
                    onClick={() => setMapEngine('google')}
                    className={`px-2 py-1 rounded-lg transition ${
                      mapEngine === 'google'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Google Maps
                  </button>
                  <button
                    onClick={() => setMapEngine('osm')}
                    className={`px-2 py-1 rounded-lg transition ${
                      mapEngine === 'osm'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    OpenStreet
                  </button>
                </div>

                {mapEngine === 'google' ? (
                  <GoogleMapView
                    resources={filteredResources}
                    selectedResource={selectedResource}
                    onSelectResource={(res) => setSelectedResource(res)}
                    userCoords={userCoords}
                    onGetUserLocation={handleGetUserLocation}
                    onOpenAddModal={() => setShowAddResourceModal(true)}
                    activeCategory={activeCategory}
                    onSelectCategory={(cat) => setActiveCategory(cat)}
                    filterPetFriendly={filterPetFriendly}
                    onTogglePetFriendly={() => setFilterPetFriendly(!filterPetFriendly)}
                    filterBedsOnly={filterBedsOnly}
                    onToggleBedsOnly={() => setFilterBedsOnly(!filterBedsOnly)}
                    filterVerifiedOnly={filterVerifiedOnly}
                    onToggleVerifiedOnly={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
                  />
                ) : (
                  <MapView
                    resources={filteredResources}
                    selectedResource={selectedResource}
                    onSelectResource={(res) => setSelectedResource(res)}
                    userCoords={userCoords}
                    onGetUserLocation={handleGetUserLocation}
                    onOpenAddModal={() => setShowAddResourceModal(true)}
                    activeCategory={activeCategory}
                    onSelectCategory={(cat) => setActiveCategory(cat)}
                    filterPetFriendly={filterPetFriendly}
                    onTogglePetFriendly={() => setFilterPetFriendly(!filterPetFriendly)}
                    filterBedsOnly={filterBedsOnly}
                    onToggleBedsOnly={() => setFilterBedsOnly(!filterBedsOnly)}
                    filterVerifiedOnly={filterVerifiedOnly}
                    onToggleVerifiedOnly={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
                  />
                )}
              </div>

              {/* Resources List Column */}
              <div className={`lg:col-span-5 min-w-0 flex flex-col space-y-2 max-h-[60vh] lg:max-h-[620px] overflow-y-auto pr-1 ${
                mapMobileViewMode === 'map' ? 'hidden lg:flex' : 'flex'
              }`}>
                <div className="flex items-center justify-between pb-1 min-w-0">
                  <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                    Community Resources List
                  </h2>
                  <span className="text-[11px] text-indigo-700 font-semibold shrink-0">
                    {filteredResources.length} Results
                  </span>
                </div>

                {filteredResources.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
                    <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                    <h3 className="font-bold text-slate-800 text-sm">No Matching Resources Found</h3>
                    <p className="text-xs text-slate-500">
                      Try clearing your search query or removing active category filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('all');
                        setFilterPetFriendly(false);
                        setFilterBedsOnly(false);
                        setFilterVerifiedOnly(false);
                      }}
                      className="mt-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  filteredResources.map((res) => (
                    <ResourceCard
                      key={res.id}
                      resource={res}
                      onSelect={(r) => setSelectedResource(r)}
                      isSelected={selectedResource?.id === res.id}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: GOOGLE WORKSPACE SUITE */}
        {activeTab === 'workspace' && (
          <GoogleWorkspaceHub
            userProfile={userProfile}
            onSaveProfile={handleUpdateProfile}
          />
        )}

        {/* TAB 2: AI ADVISORS HUB */}
        {activeTab === 'advisors' && (
          <AiAdvisorsHub
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onNavigateToForm={(formId) => {
              setPreselectedFormId(formId);
              setActiveTab('forms');
            }}
            onNavigateToMap={(category) => {
              if (category) setActiveCategory(category);
              setActiveTab('map');
            }}
            onOpenGrounding={() => setShowGroundingModal(true)}
            onOpenPetHub={() => setActiveTab('pets')}
            onSaveDocument={handleSaveDocument}
            onAddTrackedApplication={handleAddTrackedApplication}
          />
        )}

        {/* TAB 3: BENEFITS & FORMS AUTO-FILLER */}
        {activeTab === 'forms' && (
          <BenefitsFormsHub
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onSaveDocument={handleSaveDocument}
            preselectedFormId={preselectedFormId}
          />
        )}

        {/* TAB 4: PET SANCTUARY & CARE */}
        {activeTab === 'pets' && (
          <PetCareHub
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onNavigateToMap={(cat) => {
              if (cat) setActiveCategory(cat);
              setActiveTab('map');
            }}
            onAskVet={() => {
              setActiveTab('advisors');
            }}
          />
        )}

        {/* TAB 5: PROFILE LOCKER & SAVED DOCUMENTS */}
        {activeTab === 'profile' && (
          <UserProfileLocker
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onDeleteDocument={handleDeleteDocument}
          />
        )}
      </main>

      {/* MODALS */}
      <ResourceDetailModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
        onPostReview={handlePostReview}
        onPostCheckIn={handlePostCheckIn}
        onVerifyResource={handleVerifyResource}
      />

      <AddResourceModal
        isOpen={showAddResourceModal}
        onClose={() => setShowAddResourceModal(false)}
        onAddResource={handleAddResource}
        userCoords={userCoords}
      />

      <EmergencyCrisisModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
      />

      <GroundingExerciseModal
        isOpen={showGroundingModal}
        onClose={() => setShowGroundingModal(false)}
      />

      <AndroidApkModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
      />

      {/* FLOATING ACTION PILL: DAISY COMPANION QUICK ACCESS */}
      {activeTab !== 'advisors' && (
        <div className="fixed bottom-16 sm:bottom-12 right-3 sm:right-5 z-30">
          <button
            onClick={() => setActiveTab('advisors')}
            className="px-3 py-2 sm:px-3.5 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg border border-indigo-400/30 flex items-center gap-2 transition transform hover:scale-105"
            title="Chat with Daisy & AI Specialists"
          >
            <DaisyMascotBadge size="sm" animate={true} />
            <div className="text-left">
              <span className="block text-xs font-bold leading-none">Ask Daisy</span>
              <span className="text-[9px] sm:text-[10px] text-indigo-200 leading-none">6 AI Specialists</span>
            </div>
          </button>
        </div>
      )}

      {/* MOBILE PERSISTENT BOTTOM NAVIGATION BAR (Responsive 5-Column Grid) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1 grid grid-cols-5 gap-0.5 shadow-lg safe-bottom-padding">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition min-w-0 ${
            activeTab === 'map' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="text-[10px] mt-0.5 truncate max-w-full">Map & Beds</span>
        </button>

        <button
          onClick={() => setActiveTab('advisors')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition min-w-0 ${
            activeTab === 'advisors' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bot className="w-4 h-4 shrink-0" />
          <span className="text-[10px] mt-0.5 truncate max-w-full">Care Team</span>
        </button>

        <button
          onClick={() => {
            setPreselectedFormId(undefined);
            setActiveTab('forms');
          }}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition min-w-0 ${
            activeTab === 'forms' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="text-[10px] mt-0.5 truncate max-w-full">Benefits</span>
        </button>

        <button
          onClick={() => setActiveTab('pets')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition min-w-0 ${
            activeTab === 'pets' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Dog className="w-4 h-4 shrink-0" />
          <span className="text-[10px] mt-0.5 truncate max-w-full">Pet Care</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition min-w-0 ${
            activeTab === 'profile' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4 shrink-0" />
          <span className="text-[10px] mt-0.5 truncate max-w-full">Vault</span>
        </button>
      </nav>

      {/* HIGH DENSITY STATUS FOOTER (DESKTOP) */}
      <footer className="hidden lg:flex h-8 bg-indigo-900 text-white items-center px-4 justify-between text-[10px] font-medium shrink-0 z-30">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Status: All Systems Online</span>
          </span>
          <span className="hidden sm:inline-block opacity-40">|</span>
          <span className="hidden sm:inline-block opacity-90">Active Resources & Check-ins Nearby: 124</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="opacity-80 italic hidden md:inline-block">"Daisy's Helping Paws: Every neighbor deserves dignity, shelter, and care."</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
