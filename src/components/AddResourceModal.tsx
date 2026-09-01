import React, { useState } from 'react';
import { Resource, ResourceCategory } from '../types';
import { X, Plus, MapPin, Dog, Bed, ShieldCheck, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddResource: (resource: Partial<Resource>) => void;
  userCoords: { lat: number; lng: number } | null;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({
  isOpen,
  onClose,
  onAddResource,
  userCoords,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('shelter');
  const [reporterName, setReporterName] = useState('');
  const [reporterRole, setReporterRole] = useState('Community Member');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Seattle');
  const [state, setState] = useState('WA');
  const [zip, setZip] = useState('98101');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('Daily 9:00 AM - 5:00 PM');
  const [petFriendly, setPetFriendly] = useState(true);
  const [walkInAllowed, setWalkInAllowed] = useState(true);
  const [bedsAvailable, setBedsAvailable] = useState<number | ''>('');
  const [servicesOffered, setServicesOffered] = useState('');
  const [intakeRequirements, setIntakeRequirements] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    // Slight offset from current coords or center
    const lat = (userCoords?.lat || 47.6062) + (Math.random() - 0.5) * 0.01;
    const lng = (userCoords?.lng || -122.3321) + (Math.random() - 0.5) * 0.01;

    const newRes: Partial<Resource> & { reporterName?: string; reporterRole?: string } = {
      name: name.trim(),
      category,
      description: description.trim() || 'Community crowd-sourced resource.',
      address: address.trim(),
      city: city.trim() || 'Seattle',
      state: state.trim() || 'WA',
      zip: zip.trim() || '98101',
      lat,
      lng,
      phone: phone.trim() || undefined,
      hours: hours.trim() || 'Call for hours',
      petFriendly,
      walkInAllowed,
      wheelchairAccessible: true,
      bedsAvailable: bedsAvailable !== '' ? Number(bedsAvailable) : undefined,
      servicesOffered: servicesOffered
        ? servicesOffered.split(',').map((s) => s.trim()).filter(Boolean)
        : ['Community Aid'],
      intakeRequirements: intakeRequirements.trim() || 'Open to all.',
      reporterName: reporterName.trim() || 'Community Neighbor',
      reporterRole,
    };

    onAddResource(newRes);
    confetti({ particleCount: 70, spread: 60 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 p-4 md:p-5">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 font-heading">Share a Community Resource</h2>
              <p className="text-[11px] text-slate-500">Add a shelter, meal program, free shower, or pet station to the GPS map.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Reporter Trust & Credential Banner */}
          <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
            <div className="flex-1">
              <label className="block font-semibold text-indigo-950 mb-0.5">Your Name or Organization</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="e.g. Maya S. or Downtown Street Outreach"
                className="w-full px-2 py-1 bg-white border border-indigo-200 rounded-md text-xs outline-none"
              />
            </div>
            <div className="w-full sm:w-48">
              <label className="block font-semibold text-indigo-950 mb-0.5">Your Affiliation / Role</label>
              <select
                value={reporterRole}
                onChange={(e) => setReporterRole(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-indigo-200 rounded-md text-xs outline-none font-medium"
              >
                <option value="Community Member">Community Neighbor</option>
                <option value="Unhoused Peer">Unhoused / Peer Navigator</option>
                <option value="Outreach Caseworker">Outreach Caseworker</option>
                <option value="Agency Staff">Official Agency Staff</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Resource Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., St. Jude Community Breakfast & Pet Clinic"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="shelter">🛏️ Emergency Shelter / Beds</option>
                <option value="food">🍱 Food Bank / Hot Meals</option>
                <option value="vet">🐾 Daisy's Pet Care & Vet</option>
                <option value="medical">🩺 Free Medical / Mobile Clinic</option>
                <option value="legal">⚖️ Legal Aid / Rights</option>
                <option value="hygiene">🚿 Free Showers & Laundry</option>
                <option value="warming_cooling">🌡️ Warming / Cooling Respite</option>
                <option value="mental_health">💚 Mental Health & Crisis</option>
                <option value="id_assistance">🪪 ID / Birth Certificate Help</option>
                <option value="job_training">💼 Job & Day Labor Lab</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Street Address or Cross Streets *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 4th Ave & Pine St"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(206) 555-..."
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hours / Schedule</label>
            <input
              type="text"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g., Daily 6:00 PM - 8:00 AM (Dinner at 6:30)"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description & Advice</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What should people know? (e.g., great hot food, clean restrooms, helpful case workers)"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {category === 'shelter' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Beds Available (If known)</label>
              <input
                type="number"
                value={bedsAvailable}
                onChange={(e) => setBedsAvailable(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g., 20"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Services Offered (comma separated)</label>
            <input
              type="text"
              value={servicesOffered}
              onChange={(e) => setServicesOffered(e.target.value)}
              placeholder="e.g., Hot Showers, Laundry, Pet Food, Harm Reduction"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={petFriendly}
                onChange={(e) => setPetFriendly(e.target.checked)}
                className="w-3.5 h-3.5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="font-semibold text-slate-800">🐾 Pet-Friendly</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={walkInAllowed}
                onChange={(e) => setWalkInAllowed(e.target.checked)}
                className="w-3.5 h-3.5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="font-semibold text-slate-800">🚶 Walk-Ins Welcome</span>
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition"
            >
              Publish to Map
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
