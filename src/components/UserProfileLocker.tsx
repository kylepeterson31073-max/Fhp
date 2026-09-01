import React, { useState } from 'react';
import { UserProfile, SavedDocument, Resource } from '../types';
import { 
  User, 
  ShieldCheck, 
  Lock, 
  Save, 
  Trash2, 
  FileText, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Download, 
  Copy, 
  Sparkles, 
  Dog, 
  Phone, 
  MapPin,
  HelpCircle,
  Heart,
  Printer,
  Navigation,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UserProfileLockerProps {
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onDeleteDocument: (docId: string) => void;
  resources?: Resource[];
  onSelectResource?: (resource: Resource) => void;
  onToggleFavorite?: (resourceId: string) => void;
}

export const UserProfileLocker: React.FC<UserProfileLockerProps> = ({
  userProfile,
  onUpdateProfile,
  onDeleteDocument,
  resources = [],
  onSelectResource,
  onToggleFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'saved_places' | 'documents' | 'privacy'>('profile');
  
  // Profile fields state
  const [fullName, setFullName] = useState(userProfile.fullName || '');
  const [preferredName, setPreferredName] = useState(userProfile.preferredName || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [dateOfBirth, setDateOfBirth] = useState(userProfile.dateOfBirth || '');
  const [ssnLast4, setSsnLast4] = useState(userProfile.ssnLast4 || '');
  const [monthlyIncome, setMonthlyIncome] = useState<number | ''>(
    typeof userProfile.monthlyIncome === 'number' 
      ? userProfile.monthlyIncome 
      : (userProfile.monthlyIncome ? Number(userProfile.monthlyIncome) || 0 : 0)
  );
  const [housingStatus, setHousingStatus] = useState(userProfile.housingStatus || 'unsheltered');
  const [veteranStatus, setVeteranStatus] = useState(userProfile.veteranStatus || false);
  const [hasDisability, setHasDisability] = useState(userProfile.hasDisability || false);
  const [hasPets, setHasPets] = useState(userProfile.hasPets || false);
  const [emergencyContactName, setEmergencyContactName] = useState(userProfile.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(userProfile.emergencyContactPhone || '');

  const [showSensitive, setShowSensitive] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<SavedDocument | null>(null);
  const [showEmergencyCard, setShowEmergencyCard] = useState(false);

  const favoriteIds = userProfile.favoriteResourceIds || [];
  const savedResourcesList = resources.filter((r) => favoriteIds.includes(r.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    onUpdateProfile({
      fullName: fullName.trim(),
      preferredName: preferredName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      dateOfBirth: dateOfBirth.trim(),
      ssnLast4: ssnLast4.trim(),
      monthlyIncome: monthlyIncome !== '' ? Number(monthlyIncome) : 0,
      housingStatus: housingStatus as any,
      veteranStatus,
      hasDisability,
      hasPets,
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
    });

    confetti({ particleCount: 50, spread: 50 });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear your local locker data? This action cannot be undone.')) {
      onUpdateProfile({
        fullName: '',
        preferredName: '',
        phone: '',
        email: '',
        dateOfBirth: '',
        ssnLast4: '',
        monthlyIncome: 0,
        savedDocuments: [],
        favoriteResourceIds: [],
      });
      alert('Local locker reset.');
    }
  };

  return (
    <div className="w-full space-y-4">
      
      {/* Top Banner */}
      <div className="p-4 md:p-5 rounded-2xl bg-slate-900 text-white shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 border border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.2 rounded-md bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider">
              Private Offline Locker
            </span>
            <span className="text-slate-400 text-xs flex items-center gap-1">
              <Lock className="w-3 h-3 text-indigo-400" /> Stored Only on This Device
            </span>
          </div>
          <h1 className="text-base md:text-lg font-bold font-heading">
            My Caseworker Vault & Lifeline Records
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Fill your details once, and our AI Caseworker will pre-populate SNAP food stamps, Medicaid, housing vouchers, and legal declarations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setShowEmergencyCard(true)}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Emergency Wallet Card</span>
          </button>

          <button
            onClick={() => setShowSensitive(!showSensitive)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
          >
            {showSensitive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showSensitive ? 'Hide Sensitive' : 'Show Sensitive'}</span>
          </button>
        </div>
      </div>

      {/* Tabs (Responsive CSS Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 border-b border-slate-200 pb-2.5 w-full min-w-0">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 w-full min-w-0 text-center ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">My Profile & Info</span>
        </button>

        <button
          onClick={() => setActiveTab('saved_places')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 w-full min-w-0 text-center ${
            activeTab === 'saved_places'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Saved Places ({savedResourcesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 w-full min-w-0 text-center ${
            activeTab === 'documents'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Saved Drafts ({userProfile.savedDocuments?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 w-full min-w-0 text-center ${
            activeTab === 'privacy'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Privacy & Dignity</span>
        </button>
      </div>

      {/* TAB 1: PROFILE FORM */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs">
          
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 font-semibold text-xs animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Profile information successfully saved to your private device locker!</span>
            </div>
          )}

          {/* Section: Names & Identity */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 font-heading mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Identity & Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Legal Full Name (For Applications)</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Jonathan David Doe"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Preferred Name / Nickname</label>
                <input
                  type="text"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  placeholder="e.g., JD"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Date of Birth</label>
                <input
                  type={showSensitive ? 'date' : 'text'}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  placeholder="MM/DD/YYYY"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">SSN (Last 4 Digits or Full)</label>
                <input
                  type={showSensitive ? 'text' : 'password'}
                  value={ssnLast4}
                  onChange={(e) => setSsnLast4(e.target.value)}
                  placeholder="1234"
                  maxLength={9}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Phone Number (For Case Calls)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(206) 555-0199"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section: Housing & Demographics */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-heading mb-2">Housing & Benefits Eligibility</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Current Living Situation</label>
                <select
                  value={housingStatus}
                  onChange={(e) => setHousingStatus(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                >
                  <option value="unsheltered">Unsheltered (Street, Tent, Vehicle, Outdoors)</option>
                  <option value="emergency_shelter">Emergency Night Shelter / Mat Placement</option>
                  <option value="transitional">Transitional Housing / Tiny House Village</option>
                  <option value="couch_surfing">Couch Surfing / Doubled Up with Friends</option>
                  <option value="housed_at_risk">Housed but Facing Eviction</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Monthly Income ($USD)</label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={veteranStatus}
                  onChange={(e) => setVeteranStatus(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700 text-xs">Military Veteran (VA Benefits)</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDisability}
                  onChange={(e) => setHasDisability(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700 text-xs">Disability / Medical Need</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPets}
                  onChange={(e) => setHasPets(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700 text-xs">Has Pets / Service Animal</span>
              </label>
            </div>
          </div>

          {/* Section: Emergency Contact */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-heading mb-2">Emergency Contact Person</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Contact Name & Relationship</label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="e.g., Sarah Doe (Sister)"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Contact Phone Number</label>
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="(206) 555-0144"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">All data stored locally on your device only.</span>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Vault Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SAVED PLACES */}
      {activeTab === 'saved_places' && (
        <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-heading flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>My Saved Lifeline Places</span>
              </h3>
              <p className="text-[11px] text-slate-500">Quick access to your favorite shelters, free meal spots, and clinics.</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
              {savedResourcesList.length} saved
            </span>
          </div>

          {savedResourcesList.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl p-6">
              <Heart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-semibold">No saved places yet</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                Tap the heart icon on any resource card in the map or directory to bookmark your essential locations here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedResourcesList.map((res) => (
                <div
                  key={res.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-xs transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                        {res.category}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 font-heading">{res.name}</h4>
                    </div>

                    {onToggleFavorite && (
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(res.id)}
                        className="text-rose-500 hover:text-slate-400 p-1 rounded-full transition"
                        title="Remove from saved"
                      >
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2">{res.description}</p>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{res.address}, {res.city}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${res.lat},${res.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Directions</span>
                    </a>

                    {onSelectResource && (
                      <button
                        onClick={() => onSelectResource(res)}
                        className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-0.5"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-heading">Auto-Generated Applications & Letters</h3>
              <p className="text-[11px] text-slate-500">Legal appeals, benefits filings, and caseworker letters saved from AI Advisor sessions.</p>
            </div>
          </div>

          {!userProfile.savedDocuments || userProfile.savedDocuments.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl p-6">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-semibold">No documents saved yet</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                When you generate a SNAP appeal, housing application, or vet aid request in the AI Caseworker, you can save it here with 1-click.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userProfile.savedDocuments.map((doc) => (
                <div key={doc.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 font-heading">{doc.title}</h4>
                        <p className="text-[10px] text-slate-400">Created {doc.createdAt}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {doc.content}
                  </p>

                  <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(doc.content);
                        alert('Document copied to clipboard!');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition"
                    >
                      View Full Doc
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PRIVACY */}
      {activeTab === 'privacy' && (
        <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center gap-2.5 text-indigo-900">
            <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-heading">Your Privacy & Data Dignity</h3>
              <p className="text-[11px] text-slate-500">Daisy's Helping Paws operates on strict zero-surveillance, trauma-informed privacy protocols.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <h4 className="font-bold text-xs text-slate-900">Local-First Storage</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Your profile information, saved documents, and pet data remain strictly in your browser's private storage (`localStorage`). We never sell or share your data with law enforcement or ad networks.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <h4 className="font-bold text-xs text-slate-900">Ephemeral AI Queries</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                When you chat with Daisy or our AI Doctor, Caseworker, Vet, Lawyer, and Counselor, messages are processed securely in real-time and never used to track your location.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Want to wipe all saved records on this browser?</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-lg transition"
            >
              Clear Locker Data
            </button>
          </div>
        </div>
      )}

      {/* Emergency Wallet Card Modal */}
      {showEmergencyCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-amber-400 text-slate-950 flex items-center justify-between font-bold">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5" />
                <span className="font-heading">Printable Street Emergency Wallet Card</span>
              </div>
              <button
                onClick={() => setShowEmergencyCard(false)}
                className="p-1 hover:bg-amber-300 rounded-md transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-sans print:p-0">
              {/* Wallet Card Outline */}
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-800 bg-amber-50/50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                  <div>
                    <h2 className="font-black text-sm text-slate-900 uppercase tracking-tight">🐾 Emergency ID & Health Card</h2>
                    <span className="text-[10px] text-slate-600">Daisy's Helping Paws Safety Network</span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded">EMERGENCY</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">NAME:</span>
                    <strong className="text-xs">{fullName || preferredName || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">DOB:</span>
                    <strong className="text-xs">{dateOfBirth || 'On File'}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-800 border-t border-slate-200 pt-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">EMERGENCY CONTACT:</span>
                    <strong className="text-xs">{emergencyContactName || 'None listed'}</strong>
                    <span className="text-[11px] block">{emergencyContactPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">VETERAN STATUS:</span>
                    <strong className="text-xs">{veteranStatus ? 'Yes (US Veteran)' : 'No'}</strong>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-2.5 rounded-lg text-[10px] space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>988 Suicide & Crisis Lifeline: Dial 988</span>
                    <span>211 Shelter: Dial 211</span>
                  </div>
                  <div className="text-slate-300">
                    If found unconscious, please contact emergency contacts and verify companion animal safety.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Card</span>
              </button>
              <button
                onClick={() => setShowEmergencyCard(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Doc Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl p-4 md:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 font-heading">{viewingDoc.title}</h3>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                ✕
              </button>
            </div>

            <pre className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 whitespace-pre-wrap font-mono overflow-y-auto leading-relaxed">
              {viewingDoc.content}
            </pre>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Print Document
              </button>
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
