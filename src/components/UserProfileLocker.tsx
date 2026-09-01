import React, { useState } from 'react';
import { UserProfile, SavedDocument } from '../types';
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
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UserProfileLockerProps {
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onDeleteDocument: (docId: string) => void;
}

export const UserProfileLocker: React.FC<UserProfileLockerProps> = ({
  userProfile,
  onUpdateProfile,
  onDeleteDocument,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'privacy'>('profile');
  
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
            My Caseworker Vault & Documents
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Fill your details once, and our AI Caseworker will instantly pre-populate SNAP food stamps, Medicaid, housing vouchers, and legal declarations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSensitive(!showSensitive)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
          >
            {showSensitive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showSensitive ? 'Hide Sensitive Info' : 'Show Sensitive Info'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>My Profile & Info</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'documents'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Saved Document Drafts ({userProfile.savedDocuments?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'privacy'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Security & Privacy</span>
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
                <label className="block font-semibold text-slate-700 mb-0.5">Preferred Name / Alias (How Daisy calls you)</label>
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
                  placeholder="your.email@example.com"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section: Housing & Benefits Eligibility */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-heading mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Housing Status & Economic Eligibility</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Current Living / Housing Situation</label>
                <select
                  value={housingStatus}
                  onChange={(e) => setHousingStatus(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                >
                  <option value="unsheltered">Unsheltered (Street, Tent, Park, Abandoned Building)</option>
                  <option value="emergency_shelter">Emergency Night Shelter</option>
                  <option value="vehicle">Living in Vehicle / Car / RV</option>
                  <option value="couch_surfing">Couch Surfing / Doubled Up with Friends</option>
                  <option value="transitional">Transitional Housing Program</option>
                  <option value="at_risk_eviction">At Immediate Risk of Eviction</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Current Estimated Monthly Income ($)</label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={veteranStatus}
                  onChange={(e) => setVeteranStatus(e.target.checked)}
                  className="w-3.5 h-3.5 text-indigo-600 rounded"
                />
                <span className="font-semibold text-slate-800">🎖️ Military Veteran</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={hasDisability}
                  onChange={(e) => setHasDisability(e.target.checked)}
                  className="w-3.5 h-3.5 text-indigo-600 rounded"
                />
                <span className="font-semibold text-slate-800">🩺 Disabling Health Condition</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={hasPets}
                  onChange={(e) => setHasPets(e.target.checked)}
                  className="w-3.5 h-3.5 text-indigo-600 rounded"
                />
                <span className="font-semibold text-slate-800">🐾 Companion Animals</span>
              </label>
            </div>
          </div>

          {/* Section: Emergency Contact */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-heading mb-2 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Emergency Trusted Contact (Optional)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Contact Name</label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="e.g., Sister Maria"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Contact Phone</label>
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="(206) 555-4321"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Vault Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SAVED DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 font-heading">Draft Applications & Hardship Letters</h3>
            <span className="text-[11px] text-slate-500">{userProfile.savedDocuments?.length || 0} saved files</span>
          </div>

          {(!userProfile.savedDocuments || userProfile.savedDocuments.length === 0) ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-1.5">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-xs">No Saved Documents Yet</h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                When you auto-fill a SNAP or Housing form in the "Benefits & Forms" tab, click "Save to My Documents" to store your copy here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {userProfile.savedDocuments.map((doc) => (
                <div key={doc.id} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
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
      )}

      {/* TAB 3: PRIVACY */}
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
    </div>
  );
};
