import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, RefreshCw, X, ChevronRight, CheckCircle2, Wind, Eye, Hand, Volume2, Flower2 } from 'lucide-react';
import { DaisyMascotBadge } from './DaisyMascotBadge';
import confetti from 'canvas-confetti';

interface GroundingExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPetName?: string;
}

export const GroundingExerciseModal: React.FC<GroundingExerciseModalProps> = ({
  isOpen,
  onClose,
  userPetName,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timerCount, setTimerCount] = useState(4);

  const steps = [
    {
      title: 'Take a Gentle Breath with Daisy',
      icon: Wind,
      sensory: 'Breath',
      instruction: `Breathe in slowly through your nose as the circle expands... hold gently... and exhale all tension out. Daisy is sitting right beside you, breathing softly.`,
      color: 'from-teal-500 to-emerald-500',
    },
    {
      title: '5 Things You Can SEE Around You',
      icon: Eye,
      sensory: 'Sight',
      instruction: `Look around right now. Notice 5 distinct things: the color of the sky, a leaf on a tree, a sign, the pattern on your shoes, or Daisy's bright blue and brown eyes. Take your time.`,
      color: 'from-sky-500 to-blue-500',
    },
    {
      title: '4 Things You Can physically TOUCH',
      icon: Hand,
      sensory: 'Touch',
      instruction: `Feel 4 surfaces: the fabric of your jacket, the solid ground beneath your feet, the cool air on your skin, or ${userPetName ? `petting ${userPetName}'s warm fur` : "Daisy's soft floppy ears"}.`,
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: '3 Things You Can HEAR Right Now',
      icon: Volume2,
      sensory: 'Sound',
      instruction: `Listen carefully to your surroundings: the hum of distant traffic, the rustle of wind, birds chirping, or your own steady heartbeat.`,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: '2 Things You Can SMELL or Imagine',
      icon: Flower2,
      sensory: 'Smell',
      instruction: `Notice any scents in the air (fresh rain, coffee, pine trees) or take a moment to recall your favorite comforting scent from a peaceful memory.`,
      color: 'from-rose-500 to-pink-500',
    },
    {
      title: '1 Loving Truth & Affirmation',
      icon: Heart,
      sensory: 'Self-Worth',
      instruction: `Say this quietly in your heart: "I am worthy of safety, shelter, warmth, and peace. I am surviving tough days, and there is help for me today."`,
      color: 'from-teal-600 to-emerald-600',
    },
  ];

  // Breathing loop animation for step 0
  useEffect(() => {
    if (!isOpen || currentStep !== 0) return;
    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === 'inhale') return 'hold';
        if (prev === 'hold') return 'exhale';
        return 'inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
      onClose();
      setCurrentStep(0);
    }
  };

  const active = steps[currentStep];
  const StepIcon = active.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-indigo-100 overflow-hidden relative">
        
        {/* Top Header Banner */}
        <div className={`p-4 bg-gradient-to-r ${active.color} text-white flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <StepIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                Daisy's 5-4-3-2-1 Journey (Step {currentStep + 1} of {steps.length})
              </span>
              <h2 className="text-sm font-bold font-heading">{active.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-5 flex flex-col items-center text-center">
          <DaisyMascotBadge size="md" animate={true} />

          {/* Breathing Circle on Step 0 */}
          {currentStep === 0 && (
            <div className="my-3 relative flex items-center justify-center">
              <div
                className={`w-28 h-28 rounded-full border-3 border-indigo-300 bg-indigo-50 flex flex-col items-center justify-center transition-all duration-[4000ms] ${
                  breathPhase === 'inhale' ? 'scale-115 bg-indigo-100 shadow-sm' : breathPhase === 'hold' ? 'scale-115 bg-amber-50 border-amber-300' : 'scale-90 bg-emerald-50 border-emerald-300'
                }`}
              >
                <Wind className="w-6 h-6 text-indigo-600 animate-pulse mb-0.5" />
                <span className="text-xs font-bold capitalize text-indigo-900 tracking-wide">{breathPhase}...</span>
              </div>
            </div>
          )}

          <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs leading-relaxed max-w-sm">
            {active.instruction}
          </div>

          {/* Step Progress Indicators */}
          <div className="flex items-center gap-1.5 mt-4 mb-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-6 bg-indigo-600' : i < currentStep ? 'w-2 bg-emerald-400' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full mt-4">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="py-2 px-3.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>I Feel More Grounded</span>
                </>
              ) : (
                <>
                  <span>Next Sensory Step</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
