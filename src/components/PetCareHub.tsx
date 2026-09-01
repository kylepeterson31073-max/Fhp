import React, { useState } from 'react';
import { UserProfile, PetInfo } from '../types';
import { 
  Dog, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Trash2, 
  Download, 
  Copy, 
  AlertTriangle, 
  MapPin, 
  CheckCircle2, 
  ThermometerSnowflake, 
  SunMedium, 
  Pill,
  FileCheck
} from 'lucide-react';
import { DaisyMascotBadge } from './DaisyMascotBadge';
import confetti from 'canvas-confetti';

interface PetCareHubProps {
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onNavigateToMap: (category?: string) => void;
  onAskVet: () => void;
}

export const PetCareHub: React.FC<PetCareHubProps> = ({
  userProfile,
  onUpdateProfile,
  onNavigateToMap,
  onAskVet,
}) => {
  const [showAddPet, setShowAddPet] = useState(false);
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState<'dog' | 'cat' | 'other'>('dog');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [isServiceOrESA, setIsServiceOrESA] = useState(true);
  const [vaccinated, setVaccinated] = useState(true);
  const [specialNeeds, setSpecialNeeds] = useState('');

  const [activeTab, setActiveTab] = useState<'pets' | 'rights_card' | 'street_tips'>('pets');

  const petsList = userProfile.pets || [];

  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim()) return;

    const newPet: PetInfo = {
      id: `pet-${Date.now()}`,
      name: petName.trim(),
      species: petSpecies,
      breed: petBreed.trim() || 'Rescue Mix',
      age: petAge.trim() || 'Adult',
      isServiceOrESA,
      vaccinated,
      specialNeeds: specialNeeds.trim() || undefined,
    };

    const updatedPets = [...petsList, newPet];
    onUpdateProfile({
      hasPets: true,
      pets: updatedPets,
    });

    confetti({ particleCount: 50, spread: 50 });
    setPetName('');
    setPetBreed('');
    setSpecialNeeds('');
    setShowAddPet(false);
  };

  const handleRemovePet = (id: string) => {
    const updatedPets = petsList.filter((p) => p.id !== id);
    onUpdateProfile({
      hasPets: updatedPets.length > 0,
      pets: updatedPets,
    });
  };

  const primaryPet = petsList[0] || {
    name: 'Buddy',
    species: 'dog',
    breed: 'Pitbull Terrier Mix',
    isServiceOrESA: true,
    vaccinated: true,
  };

  return (
    <div className="w-full space-y-4">
      
      {/* Hero Mascot Banner */}
      <div className="p-4 md:p-5 rounded-2xl bg-indigo-950 text-white shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <DaisyMascotBadge size="lg" animate={true} />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.2 rounded-md bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
                Daisy's Pet Sanctuary
              </span>
              <span className="text-indigo-200 text-xs">Companions are Family</span>
            </div>
            <h1 className="text-base md:text-lg font-bold font-heading">
              Street Pet Wellness & Rights Hub
            </h1>
            <p className="text-xs text-indigo-200 max-w-lg leading-relaxed mt-0.5">
              Free veterinary clinics, pet food pantries, emergency pet shelter rights, and printable Service Animal / ESA legal protection cards.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={() => onNavigateToMap('vet')}
            className="px-3 py-2 bg-white text-indigo-950 hover:bg-indigo-50 font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>Find Free Vet Clinics</span>
          </button>
          <button
            onClick={onAskVet}
            className="px-3 py-2 bg-amber-400 text-slate-950 hover:bg-amber-300 font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <Dog className="w-3.5 h-3.5" />
            <span>Ask AI Vet Dr. Bailey</span>
          </button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('pets')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'pets'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Dog className="w-3.5 h-3.5" />
          <span>My Pets ({petsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rights_card')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'rights_card'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Service Animal / ESA Rights Card</span>
        </button>

        <button
          onClick={() => setActiveTab('street_tips')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'street_tips'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Street Pet Safety & Weather Care</span>
        </button>
      </div>

      {/* TAB 1: PET PROFILES */}
      {activeTab === 'pets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-heading">Companion Pet Profiles</h3>
              <p className="text-[11px] text-slate-500">Keep vaccination & medical notes handy for pet-friendly shelters and free food pantries.</p>
            </div>
            <button
              onClick={() => setShowAddPet(!showAddPet)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddPet ? 'Cancel' : 'Add Companion Pet'}</span>
            </button>
          </div>

          {/* Add Pet Form */}
          {showAddPet && (
            <form onSubmit={handleAddPet} className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 shadow-xs space-y-3 animate-slide-up text-xs">
              <h4 className="font-bold text-xs text-indigo-950 font-heading">Add Companion Pet Profile</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pet's Name *</label>
                  <input
                    type="text"
                    required
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="e.g., Buster"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Species</label>
                  <select
                    value={petSpecies}
                    onChange={(e) => setPetSpecies(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="dog">🐕 Dog</option>
                    <option value="cat">🐈 Cat</option>
                    <option value="other">🐾 Other Companion</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Breed / Description</label>
                  <input
                    type="text"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    placeholder="e.g., Pitbull / Lab mix"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isServiceOrESA}
                      onChange={(e) => setIsServiceOrESA(e.target.checked)}
                      className="w-3.5 h-3.5 text-indigo-600 rounded"
                    />
                    <span className="font-semibold text-slate-800">Service Animal / Emotional Support Companion</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vaccinated}
                      onChange={(e) => setVaccinated(e.target.checked)}
                      className="w-3.5 h-3.5 text-indigo-600 rounded"
                    />
                    <span className="font-semibold text-slate-800">Vaccinated (Rabies / Distemper)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dietary or Medical Notes</label>
                <input
                  type="text"
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value)}
                  placeholder="e.g., Sensitive stomach, needs senior kibble, gets nervous around sirens"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition"
              >
                Save Pet Profile
              </button>
            </form>
          )}

          {/* Pets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {petsList.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center col-span-2 space-y-1.5">
                <Dog className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-xs">No Pet Companions Added Yet</h4>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Click "Add Companion Pet" above so Daisy and the AI Vet can tailor free food and vet services for your animal.
                </p>
              </div>
            ) : (
              petsList.map((pet) => (
                <div key={pet.id} className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xl">
                        {pet.species === 'cat' ? '🐈' : '🐕'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-slate-900 font-heading">{pet.name}</h4>
                          {pet.isServiceOrESA && (
                            <span className="px-1.5 py-0.2 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-800 text-[10px] font-bold">
                              ESA / Service
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">{pet.breed || 'Companion'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemovePet(pet.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
                    <div className="flex items-center gap-1 text-slate-600">
                      <CheckCircle2 className={`w-3 h-3 ${pet.vaccinated ? 'text-emerald-500' : 'text-amber-500'}`} />
                      <span>{pet.vaccinated ? 'Vaccines Current' : 'Vaccines Needed'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Heart className="w-3 h-3 text-rose-500" />
                      <span>{pet.isServiceOrESA ? 'FHA / ADA Protected' : 'Companion'}</span>
                    </div>
                  </div>

                  {pet.specialNeeds && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <strong>Note:</strong> {pet.specialNeeds}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SERVICE ANIMAL / ESA RIGHTS CARD */}
      {activeTab === 'rights_card' && (
        <div className="p-4 md:p-6 rounded-2xl bg-slate-900 text-white shadow-xs space-y-4 max-w-2xl mx-auto border-2 border-amber-400">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div className="flex items-center gap-2.5">
              <DaisyMascotBadge size="sm" animate={false} />
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400">
                  LEGAL RIGHTS & SHELTER ACCESS NOTICE
                </span>
                <h3 className="text-base font-bold font-heading">
                  Companion & Emotional Support Animal Declaration
                </h3>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-200">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-0.5">
              <p><strong>Companion Name:</strong> {primaryPet.name} ({primaryPet.breed || 'Rescue'})</p>
              <p><strong>Handler / Owner:</strong> {userProfile.preferredName || userProfile.fullName || 'Protected Individual'}</p>
              <p><strong>Classification:</strong> Emotional Support Animal (ESA) / Assistance Animal</p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-amber-300 uppercase text-[10px]">Notice to Housing Providers & Shelters:</h4>
              <p>
                Under the <strong>Fair Housing Act (42 U.S.C. § 3604)</strong> and HUD guidelines (FHEO-2020-01), individuals with disabling conditions or emotional trauma have the right to be accompanied by their assistance/support animals in emergency housing and transitional shelters without payment of pet deposits or fees.
              </p>
              <p>
                Under the <strong>Americans with Disabilities Act (ADA Title II & III)</strong>, service animals trained to perform tasks for an individual with a disability are permitted in all public accommodations.
              </p>
            </div>

            <div className="p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-lg text-amber-200 text-[11px]">
              <strong>Shelter Staff Inquiry Limit:</strong> Staff may only ask: (1) Is the animal required because of a disability/health condition? and (2) What work or support has the animal been trained or provides?
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-700">
            <span className="text-[10px] text-slate-400">Issued by Daisy's Helping Paws Advocacy Team</span>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-lg shadow-xs transition"
            >
              Print / Show Card to Staff
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: STREET PET SAFETY & WEATHER CARE */}
      {activeTab === 'street_tips' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
              <ThermometerSnowflake className="w-4 h-4 text-blue-600" />
              <span>Winter & Cold Weather Survival for Pets</span>
            </div>
            <ul className="space-y-1 text-xs text-blue-950">
              <li>• Keep pet sleeping elevated off freezing concrete or wet dirt using cardboard or blankets.</li>
              <li>• Wipe road salt & antifreeze off paws immediately (antifreeze is lethal even in tiny licks).</li>
              <li>• Shivering, tucked tail, or slow breathing are early signs of canine hypothermia.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
              <SunMedium className="w-4 h-4 text-amber-600" />
              <span>Summer Heat & Asphalt Protection</span>
            </div>
            <ul className="space-y-1 text-xs text-amber-950">
              <li>• The 7-Second Rule: Place back of hand on asphalt for 7 seconds. If too hot for you, it will burn paw pads.</li>
              <li>• Never leave pets inside a parked vehicle—temperatures exceed 110°F in under 8 minutes.</li>
              <li>• Offer cool water frequently; look for rapid panting, bright red tongue, or disorientation.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 col-span-1 md:col-span-2">
            <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>Free Vaccinations & Flea Medicine Access</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              Street outreach vet clinics distribute monthly chewables or topical flea/tick medicine at zero cost. Rabies and Parvo vaccinations protect your pet and ensure smooth admission into city shelters.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
