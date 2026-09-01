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
  AlertCircle,
  Heart,
  Volume2,
  VolumeX,
  Copy,
  Share2,
  Bot,
  Footprints
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResourceDetailModalProps {
  resource: Resource | null;
  onClose: () => void;
  onPostReview: (resourceId: string, review: Partial<Review>) => void;
  onPostCheckIn: (resourceId: string, checkIn: Partial<CheckIn>) => void;
  onVerifyResource?: (resourceId: string, action: 'confirm' | 'flag', reason?: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (resourceId: string) => void;
  onAskAdvisor?: (resource: Resource) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  onClose,
  onPostReview,
  onPostCheckIn,
  onVerifyResource,
  isFavorite = false,
  onToggleFavorite,
  onAskAdvisor,
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

  // TTS Voice state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!resource) return null;

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${resource.name}. Located at ${resource.address}, ${resource.city}. ${resource.description}. Operating hours: ${resource.hours}. ${resource.petFriendly ? 'Pet friendly facility.' : 'Service animals only.'}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleCopyDetails = () => {
    const summary = `${resource.name}\nAddress: ${resource.address}, ${resource.city}, ${resource.state} ${resource.zip}\nPhone: ${resource.phone || 'N/A'}\nHours: ${resource.hours}\nWebsite: ${resource.website || 'N/A'}\nPet Policy: ${resource.petFriendly ? 'Pet Friendly' : 'Service Animals Only'}\nOverview: ${resource.description}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    confetti({ particleCount: 30, spread: 40 });
    setTimeout(() => setCopied(false), 2500);
  };

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

  const walkingMinutes = resource.distanceMiles 
    ? Math.max(1, Math.round(resource.distanceMiles * 20))
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-xl shrink-0">
              {resource.category === 'shelter' ? '🛏️' : resource.category === 'food' ? '🍱' : resource.category === 'vet' ? '🐾' : resource.category === 'medical' ? '🩺' : resource.category === 'legal' ? '⚖️' : '📍'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base font-bold font-heading truncate">{resource.name}</h2>
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
              <p className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1.5 truncate">
                <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="truncate">{resource.address}, {resource.city}, {resource.state} {resource.zip}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(resource.id)}
                className={`p-2 rounded-xl transition ${
                  isFavorite 
                    ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' 
                    : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                }`}
                title={isFavorite ? 'Remove from Saved' : 'Save to My Vault'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400' : ''}`} />
              </button>
            )}

            <button
              onClick={handleToggleSpeech}
              className={`p-2 rounded-xl transition ${
                isSpeaking 
                  ? 'bg-amber-400 text-slate-950 animate-pulse' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={isSpeaking ? 'Stop reading' : 'Read Aloud (Voice Accessibility)'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Action Navigation Bar (Responsive Grid / Auto-wrapping) */}
        <div className="px-3 sm:px-4 py-2 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${resource.lat},${resource.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition shrink-0"
            >
              <Navigation className="w-3 h-3" />
              <span>Directions</span>
            </a>

            {resource.phone && (
              <a
                href={`tel:${resource.phone.replace(/[^0-9]/g, '')}`}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition truncate min-w-0"
              >
                <Phone className="w-3 h-3 text-indigo-600 shrink-0" />
                <span className="truncate">{resource.phone}</span>
              </a>
            )}

            {resource.website && (
              <a
                href={resource.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition shrink-0"
              >
                <Globe className="w-3 h-3 text-slate-500" />
                <span>Website</span>
              </a>
            )}

            <button
              onClick={handleCopyDetails}
              className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition shrink-0"
              title="Copy details to clipboard"
            >
              {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1 bg-slate-200/70 p-0.5 rounded-lg w-full min-w-0">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-1.5 py-1 rounded-md text-[11px] font-semibold transition text-center truncate ${
                activeTab === 'details' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-1.5 py-1 rounded-md text-[11px] font-semibold transition text-center truncate ${
                activeTab === 'reviews' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reviews ({reviewsList.length})
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-1.5 py-1 rounded-md text-[11px] font-semibold transition text-center truncate ${
                activeTab === 'verification' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verify
            </button>
            <button
              onClick={() => setActiveTab('checkin')}
              className={`px-1.5 py-1 rounded-md text-[11px] font-semibold transition text-center truncate ${
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
              {/* Distance and Walking Time Badge */}
              {walkingMinutes !== null && (
                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <Footprints className="w-4 h-4 text-indigo-600" />
                    <span>Estimated Transit: ~{walkingMinutes} min walk ({resource.distanceMiles} miles away)</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${resource.lat},${resource.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Open GPS Route &rarr;
                  </a>
                </div>
              )}

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

              {/* Ask AI Specialist Action */}
              {onAskAdvisor && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-heading">Need help with this location?</h4>
                      <p className="text-[11px] text-indigo-200">Ask our AI Caseworker to draft an intake script or verify bed rules.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onAskAdvisor(resource);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition shrink-0"
                  >
                    Ask Advisor
                  </button>
                </div>
              )}
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
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Line Length</label>
                <select
                  value={lineLength}
                  onChange={(e) => setLineLength(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                >
                  <option value="none">No line (Walk right in)</option>
                  <option value="short">Short (5-10 minutes)</option>
                  <option value="moderate">Moderate (15-30 minutes)</option>
                  <option value="long">Long (30+ minutes)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition"
              >
                Post Live Check-In
              </button>
            </form>
          )}

          {/* TAB 4: VERIFICATION */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5 font-heading">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Community Accuracy Verification</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Help keep this resource accurate. Have you visited recently? Confirm that the hours, services, and pet rules are correct, or report changes.
                </p>

                {hasVoted ? (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thank you! Your verification feedback has been logged to the community network.</span>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleConfirmVerification}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Info is Accurate</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Report Issue Form */}
              {!hasVoted && (
                <form onSubmit={handleFlagVerification} className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2.5">
                  <h4 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Report Outdated or Incorrect Info</span>
                  </h4>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">What changed?</label>
                    <select
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 outline-none font-medium"
                    >
                      <option value="Operating hours or schedule has changed">Operating hours or schedule has changed</option>
                      <option value="Facility closed or relocated">Facility closed or relocated</option>
                      <option value="No longer pet-friendly">No longer pet-friendly</option>
                      <option value="Beds or services no longer available">Beds or services no longer available</option>
                      <option value="Phone number or contact changed">Phone number or contact changed</option>
                      <option value="Other discrepancy">Other discrepancy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Details (Optional)</label>
                    <input
                      type="text"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="e.g., Now open at 6 PM instead of 5 PM"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-xs transition"
                  >
                    Submit Issue Report
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Need crisis assistance? Dial 988 anytime.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
