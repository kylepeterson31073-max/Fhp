import React, { useState, useEffect } from 'react';
import { Resource, Review, CheckIn } from '../types';
import { 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  Globe, 
  ShieldCheck, 
  Dog, 
  Bed, 
  Star, 
  Navigation, 
  MessageSquare, 
  Plus, 
  Activity, 
  CheckCircle2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResourceDetailModalProps {
  resource: Resource | null;
  onClose: () => void;
  onPostReview: (resourceId: string, review: Partial<Review>) => void;
  onPostCheckIn: (resourceId: string, checkIn: Partial<CheckIn>) => void;
  onVerifyResource?: (resourceId: string, action: 'confirm' | 'flag', reason?: string) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  onClose,
  onPostReview,
  onPostCheckIn,
  onVerifyResource,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'checkin' | 'verification'>('details');
  
  // Review form state
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [waitTime, setWaitTime] = useState('Under 15 mins');
  const [petFeedback, setPetFeedback] = useState('');
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Verification state
  const [verifyName, setVerifyName] = useState('');
  const [flagReason, setFlagReason] = useState('Operating hours or schedule has changed');
  const [customReason, setCustomReason] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  // CheckIn form state
  const [checkInName, setCheckInName] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [bedsNow, setBedsNow] = useState<number | ''>('');
  const [lineLength, setLineLength] = useState<'none' | 'short' | 'moderate' | 'long'>('short');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (resource) {
      setIsLoadingReviews(true);
      fetch(`/api/resources/${resource.id}/reviews`)
        .then((res) => res.json())
        .then((data) => {
          setReviewsList(data.reviews || []);
          setIsLoadingReviews(false);
        })
        .catch(() => setIsLoadingReviews(false));
    }
  }, [resource]);

  if (!resource) return null;

  const handleConfirmVerification = () => {
    if (onVerifyResource) {
      onVerifyResource(resource.id, 'confirm', 'Community neighbor confirmed open & accurate.');
    }
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    setHasVoted(true);
  };

  const handleFlagVerification = (e: React.FormEvent) => {
    e.preventDefault();
    const reasonText = customReason.trim() ? `${flagReason}: ${customReason.trim()}` : flagReason;
    if (onVerifyResource) {
      onVerifyResource(resource.id, 'flag', reasonText);
    }
    setHasVoted(true);
    setCustomReason('');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setIsSubmitting(true);
    const newRev: Partial<Review> = {
      authorName: authorName.trim() || 'Community Member',
      rating,
      text: reviewText.trim(),
      waitTime,
      petFriendlyFeedback: petFeedback.trim() || undefined,
    };

    onPostReview(resource.id, newRev);

    setReviewsList((prev) => [
      {
        id: `rev-${Date.now()}`,
        resourceId: resource.id,
        authorName: newRev.authorName || 'Community Member',
        rating: newRev.rating || 5,
        text: newRev.text || '',
        date: 'Just now',
        waitTime: newRev.waitTime,
        petFriendlyFeedback: newRev.petFriendlyFeedback,
        helpfulVotes: 0,
      },
      ...prev,
    ]);

    confetti({ particleCount: 50, spread: 50 });
    setReviewText('');
    setPetFeedback('');
    setIsSubmitting(false);
    setActiveTab('reviews');
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusNote.trim()) return;

    setIsSubmitting(true);
    const newCheckIn: Partial<CheckIn> = {
      authorName: checkInName.trim() || 'Anonymous Friend',
      statusNote: statusNote.trim(),
      bedsAvailableNow: bedsNow !== '' ? Number(bedsNow) : undefined,
      lineLength,
    };

    onPostCheckIn(resource.id, newCheckIn);
    confetti({ particleCount: 60, spread: 60 });
    setStatusNote('');
    setIsSubmitting(false);
    setActiveTab('details');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-xl shrink-0">
              {resource.category === 'shelter' ? '🛏️' : resource.category === 'food' ? '🍱' : resource.category === 'vet' ? '🐾' : resource.category === 'medical' ? '🩺' : resource.category === 'legal' ? '⚖️' : '📍'}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base font-bold font-heading">{resource.name}</h2>
                {resource.verified && (
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
                {resource.petFriendly && (
                  <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-[10px] font-bold flex items-center gap-1">
                    <Dog className="w-3 h-3" /> Pet Friendly
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>{resource.address}, {resource.city}, {resource.state} {resource.zip}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action Navigation Bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${resource.lat},${resource.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition"
            >
              <Navigation className="w-3 h-3" />
              <span>Directions</span>
            </a>

            {resource.phone && (
              <a
                href={`tel:${resource.phone.replace(/[^0-9]/g, '')}`}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition"
              >
                <Phone className="w-3 h-3 text-indigo-600" />
                <span>{resource.phone}</span>
              </a>
            )}

            {resource.website && (
              <a
                href={resource.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition"
              >
                <Globe className="w-3 h-3 text-slate-500" />
                <span>Website</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-0.5 bg-slate-200/70 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                activeTab === 'details' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                activeTab === 'reviews' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reviews ({reviewsList.length})
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1 ${
                activeTab === 'verification' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Verify & Accuracy</span>
            </button>
            <button
              onClick={() => setActiveTab('checkin')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                activeTab === 'checkin' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Check In
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <>
              {/* Bed Counter Banner if available */}
              {resource.bedsAvailable !== undefined && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Bed className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-blue-900">Current Bed Availability</h4>
                      <p className="text-[10px] text-blue-700">Updated {resource.lastUpdated}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-blue-950 font-heading">{resource.bedsAvailable}</span>
                    <span className="text-[10px] text-blue-600 ml-1">/ {resource.totalBeds || 65} open</span>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Overview</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  {resource.description}
                </p>
              </div>

              {/* Hours & Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    <span>Operating Hours</span>
                  </h4>
                  <p className="text-xs font-semibold text-slate-800">{resource.hours}</p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>Intake Requirements</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{resource.intakeRequirements || 'Walk-in friendly. No ID required for emergency meals/first-night beds.'}</p>
                </div>
              </div>

              {/* Services Offered */}
              {resource.servicesOffered && resource.servicesOffered.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Services & Amenities Provided</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {resource.servicesOffered.map((srv, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg text-[11px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                        <span>{srv}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pet Accommodations */}
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-start gap-2.5">
                <Dog className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-900">Daisy's Pet-Friendly Assessment</h4>
                  <p className="text-xs text-indigo-900 mt-0.5 leading-relaxed">
                    {resource.petFriendly 
                      ? 'This location welcomes companion animals with owners, provides dog/cat food, and has secure outdoor or kennel facilities.' 
                      : 'Standard policy restricts pets to certified service animals only. Contact our AI Vet or check our Pet Care tab for alternative pet-friendly shelters.'}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              
              {/* Add Review Form */}
              <form onSubmit={handleReviewSubmit} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Share Your Experience for Others</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Your Name / Nickname</label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g., Alex & Rex (optional)"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Rating</label>
                    <div className="flex items-center gap-1 pt-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-0.5 focus:outline-none"
                        >
                          <Star className={`w-4 h-4 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Review & Helpful Tips</label>
                  <textarea
                    rows={2}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="How was the food, staff, security, or shower cleanliness?"
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {resource.petFriendly && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Pet-Friendly Feedback (Optional)</label>
                    <input
                      type="text"
                      value={petFeedback}
                      onChange={(e) => setPetFeedback(e.target.value)}
                      placeholder="Were pets welcomed warmly? Did they provide food?"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition"
                >
                  Post Review
                </button>
              </form>

              {/* Reviews Feed */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Community Reviews</h4>
                {reviewsList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No reviews yet. Be the first to share your experience!</p>
                ) : (
                  reviewsList.map((rev) => (
                    <div key={rev.id} className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900">{rev.authorName}</span>
                          <span className="text-[10px] text-slate-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">{rev.text}</p>

                      {rev.petFriendlyFeedback && (
                        <p className="text-[11px] text-indigo-800 bg-indigo-50 p-1.5 rounded-lg border border-indigo-100 flex items-center gap-1">
                          <Dog className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span><strong>Pet Note:</strong> {rev.petFriendlyFeedback}</span>
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CHECK IN */}
          {activeTab === 'checkin' && (
            <form onSubmit={handleCheckInSubmit} className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-indigo-950 font-heading">Live Community Check-In</h4>
                <p className="text-[11px] text-slate-600">Help someone tonight by sharing real-time line conditions, bed counts, or food status.</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Your Name (Optional)</label>
                <input
                  type="text"
                  value={checkInName}
                  onChange={(e) => setCheckInName(e.target.value)}
                  placeholder="Anonymous or your first name"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Status Note</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g., Line is moving fast, dinner is chili and rice, 10 beds left."
                  required
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {resource.category === 'shelter' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Estimated Open Beds</label>
                  <input
                    type="number"
                    value={bedsNow}
                    onChange={(e) => setBedsNow(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g., 12"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Current Wait Line</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['none', 'short', 'moderate', 'long'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLineLength(lvl)}
                      className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition border ${
                        lineLength === lvl
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition"
              >
                Submit Live Check-In
              </button>
            </form>
          )}

          {/* TAB 4: VERIFICATION & ACCURACY */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              {/* Verification Tier Banner */}
              <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                resource.verificationTier === 'verified' || resource.verified
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : resource.verificationTier === 'community_verified'
                  ? 'bg-blue-50 border-blue-200 text-blue-950'
                  : resource.verificationTier === 'flagged_inaccurate'
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 font-bold ${
                    resource.verificationTier === 'verified' || resource.verified
                      ? 'bg-emerald-600'
                      : resource.verificationTier === 'community_verified'
                      ? 'bg-blue-600'
                      : resource.verificationTier === 'flagged_inaccurate'
                      ? 'bg-rose-600'
                      : 'bg-amber-600'
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      {resource.verificationTier === 'verified' || resource.verified
                        ? 'Official Agency Verified'
                        : resource.verificationTier === 'community_verified'
                        ? 'Community Verified Resource'
                        : resource.verificationTier === 'flagged_inaccurate'
                        ? 'Flagged for Review / Inaccuracy'
                        : 'Crowd-Sourced (Pending Full Validation)'}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                      {resource.verificationTier === 'verified' || resource.verified
                        ? 'This location and its services have been audited and officially confirmed by verified municipal agency caseworkers.'
                        : resource.verificationTier === 'community_verified'
                        ? `Confirmed active and open by ${resource.upvotesCount || 3}+ local community members and unhoused peers.`
                        : resource.verificationTier === 'flagged_inaccurate'
                        ? 'Multiple community members noted discrepancies in hours, phone numbers, or intake rules.'
                        : 'Submitted by a community member. Help keep our directory accurate by verifying or flagging details below.'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 bg-white/80 backdrop-blur-xs p-2 rounded-lg border border-slate-200">
                  <div className="text-xs font-bold text-slate-700">Community Trust</div>
                  <div className="text-sm font-black text-emerald-700">
                    👍 {resource.upvotesCount || (resource.verified ? 12 : 1)} / 👎 {resource.downvotesCount || 0}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={hasVoted}
                  onClick={handleConfirmVerification}
                  className={`p-3.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition ${
                    hasVoted
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800 opacity-80 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  }`}
                >
                  <span className="text-base">👍</span>
                  <span className="font-bold text-xs">{hasVoted ? 'Thank You for Confirming!' : 'Confirm This Resource is Open & Accurate'}</span>
                  <span className="text-[10px] opacity-80">Adds +1 to community trust score</span>
                </button>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Report an Issue or Inaccuracy</span>
                  </h5>
                  <form onSubmit={handleFlagVerification} className="space-y-1.5">
                    <select
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-[11px] outline-none"
                    >
                      <option value="Operating hours or schedule has changed">Hours or schedule changed</option>
                      <option value="Location has moved or permanently closed">Location closed / moved</option>
                      <option value="Phone number is disconnected or wrong">Phone disconnected</option>
                      <option value="Intake criteria or ID requirements changed">Intake / ID rules changed</option>
                      <option value="Pet policy is no longer allowed">Pet policy no longer pet-friendly</option>
                    </select>

                    <input
                      type="text"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Optional details (e.g. now closes at 4 PM)"
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-[11px] outline-none"
                    />

                    <button
                      type="submit"
                      disabled={hasVoted}
                      className="w-full py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[11px] font-semibold transition"
                    >
                      Submit Accuracy Report
                    </button>
                  </form>
                </div>
              </div>

              {/* Audit & Verification History Logs */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Audit & Community History</h4>
                <div className="space-y-1.5">
                  {resource.verificationLogs && resource.verificationLogs.length > 0 ? (
                    resource.verificationLogs.map((log) => (
                      <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-2 text-xs">
                        <div className="flex items-start gap-2">
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            log.action === 'confirmed' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`} />
                          <div>
                            <span className="font-semibold text-slate-900">{log.authorName}</span>
                            <p className="text-[11px] text-slate-600">{log.reason}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded-lg">No audit entries logged yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
