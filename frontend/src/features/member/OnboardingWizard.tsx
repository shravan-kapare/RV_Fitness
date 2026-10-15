import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCompleteOnboarding } from '@/hooks/useFitness';
import {
  User,
  Activity,
  Target,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Scale,
  Dumbbell,
  X,
} from 'lucide-react';
import clsx from 'clsx';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { user } = useAuthStore();
  const completeMutation = useCompleteOnboarding();

  const [step, setStep] = useState<number>(1);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    dateOfBirth: initialData?.profile?.dateOfBirth ? String(initialData.profile.dateOfBirth).split('T')[0] : '1998-05-14',
    gender: (initialData?.profile?.gender as 'MALE' | 'FEMALE' | 'OTHER') || 'MALE',
    phone: user?.phone || '+91 98220 12345',
    emergencyContact: initialData?.profile?.emergencyContact || 'Vijay Shinde (+91 98220 99999)',
    address: initialData?.profile?.address || 'Near Narsimha Temple, Main Road, Narsobawadi, Maharashtra 416104',

    // Step 2: Biometrics
    weightKg: 74.5,
    heightCm: 175,
    bodyFatPct: 16.5,
    chestCm: 102,
    waistCm: 82,
    armsCm: 37,
    thighsCm: 56,

    // Step 3: Fitness Profile
    goalType: 'MUSCLE_GAIN' as 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'STRENGTH' | 'ENDURANCE' | 'GENERAL_FITNESS',
    targetWeightKg: 78.0,
    targetDate: '2026-12-31',
    experienceLevel: 'INTERMEDIATE' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    daysPerWeek: 6,
    dietaryPreference: 'High Protein Non-Veg & Eggs',
    limitations: [] as string[],

    // Step 4: PAR-Q
    parqAccepted: false,
  });

  // Calculate BMI dynamically
  const bmiInfo = useMemo(() => {
    const hM = formData.heightCm / 100;
    if (hM <= 0) return { bmi: 0, category: 'N/A', color: 'text-gray-400' };
    const bmiVal = Number((formData.weightKg / (hM * hM)).toFixed(1));
    if (bmiVal < 18.5) return { bmi: bmiVal, category: 'Underweight', color: 'text-blue-400' };
    if (bmiVal <= 24.9) return { bmi: bmiVal, category: 'Optimal / Healthy', color: 'text-emerald-400' };
    if (bmiVal <= 29.9) return { bmi: bmiVal, category: 'Overweight / Strong', color: 'text-[#FFC21A]' };
    return { bmi: bmiVal, category: 'High Body Mass', color: 'text-red-400' };
  }, [formData.weightKg, formData.heightCm]);

  if (!isOpen) return null;

  const toggleLimitation = (key: string) => {
    if (key === 'NONE') {
      setFormData((prev) => ({ ...prev, limitations: [] }));
      return;
    }
    setFormData((prev) => {
      const exists = prev.limitations.includes(key);
      const next = exists
        ? prev.limitations.filter((l) => l !== key)
        : [...prev.limitations.filter((l) => l !== 'NONE'), key];
      return { ...prev, limitations: next };
    });
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parqAccepted) {
      alert('Please accept the Physical Activity Readiness Questionnaire (PAR-Q) agreement to continue.');
      return;
    }

    try {
      await completeMutation.mutateAsync({
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        address: formData.address,
        weightKg: Number(formData.weightKg),
        heightCm: Number(formData.heightCm),
        bodyFatPct: formData.bodyFatPct ? Number(formData.bodyFatPct) : undefined,
        chestCm: formData.chestCm ? Number(formData.chestCm) : undefined,
        waistCm: formData.waistCm ? Number(formData.waistCm) : undefined,
        armsCm: formData.armsCm ? Number(formData.armsCm) : undefined,
        thighsCm: formData.thighsCm ? Number(formData.thighsCm) : undefined,
        goalType: formData.goalType,
        targetWeightKg: formData.targetWeightKg ? Number(formData.targetWeightKg) : undefined,
        targetDate: formData.targetDate || undefined,
        experienceLevel: formData.experienceLevel,
        daysPerWeek: Number(formData.daysPerWeek),
        dietaryPreference: formData.dietaryPreference,
        limitations: formData.limitations,
        parqAccepted: formData.parqAccepted,
      });
      onClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  const stepsHeader = [
    { num: 1, label: 'Personal Info', icon: User },
    { num: 2, label: 'Biometrics & BMI', icon: Activity },
    { num: 3, label: 'Fitness Profile', icon: Target },
    { num: 4, label: 'Readiness & Plan', icon: ShieldCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0D0D0D] border border-[#292929] rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="bg-[#141414] px-6 py-5 border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFC21A]/10 border border-[#FFC21A]/30 flex items-center justify-center text-[#FFC21A]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#FFC21A] font-bold">
                RV Fitness Narsobawadi
              </span>
              <h2 className="text-lg font-black text-[#F5F5F5] uppercase tracking-wide">
                Member Induction & Biometric Onboarding
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#222222] text-[#888888] hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Step Progress Pills */}
        <div className="grid grid-cols-4 border-b border-[#222222] bg-[#111111]">
          {stepsHeader.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={clsx(
                  'py-3 px-2 sm:px-4 flex items-center justify-center space-x-2 border-b-2 text-xs font-bold transition-all',
                  isActive
                    ? 'border-[#FFC21A] text-[#FFC21A] bg-[#171717]'
                    : isDone
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                    : 'border-transparent text-[#737373] hover:text-[#A5A5A5]'
                )}
              >
                <div
                  className={clsx(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono',
                    isActive ? 'bg-[#FFC21A] text-black' : isDone ? 'bg-emerald-500 text-black' : 'bg-[#222222] text-[#737373]'
                  )}
                >
                  {isDone ? '✓' : s.num}
                </div>
                <span className="hidden sm:inline truncate">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* STEP 1: PERSONAL INFORMATION */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-[#222222] pb-3">
                <h3 className="text-base font-bold text-[#F5F5F5]">Step 1: Personal Details & Emergency Contact</h3>
                <p className="text-xs text-[#888888] mt-0.5">
                  Ensure your official contact and emergency guardian details are up to date for facility safety.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A5A5A5] mb-1.5 uppercase tracking-wider">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.fullName || ''}
                    className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-2.5 text-sm text-[#888888] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5A5A5] mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-2.5 text-sm text-[#888888] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5A5A5] mb-1.5 uppercase tracking-wider">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFC21A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5A5A5] mb-1.5 uppercase tracking-wider">
                    Gender Identity *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFC21A]"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other / Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5A5A5] mb-1.5 uppercase tracking-wider">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFC21A]"
                    placeholder="+91 98220 12345"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5A5A5] mb-1.5 uppercase tracking-wider">
                    Emergency Contact (Name & Phone) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFC21A]"
                    placeholder="e.g. Ramesh Shinde (+91 98220 99999)"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#A5A5A5] mb-1.5 uppercase tracking-wider">
                    Residential Address
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFC21A]"
                    placeholder="Narsobawadi, Shirol, Kolhapur, Maharashtra 416104"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BODY MEASUREMENTS & DYNAMIC BMI */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[#222222] pb-3">
                <h3 className="text-base font-bold text-[#F5F5F5]">Step 2: Biometrics & Auto-Calculated BMI</h3>
                <p className="text-xs text-[#888888] mt-0.5">
                  Record baseline body composition to calibrate your training intensity and nutritional macro goals.
                </p>
              </div>

              {/* Dynamic Live BMI Gauge Card */}
              <div className="bg-[#141414] p-5 rounded-2xl border border-[#292929] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFC21A]/10 border border-[#FFC21A]/30 flex items-center justify-center text-[#FFC21A]">
                    <Scale className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">
                      Calculated Body Mass Index
                    </span>
                    <div className="flex items-baseline space-x-2 mt-0.5">
                      <span className="text-3xl font-black font-mono text-[#F5F5F5]">{bmiInfo.bmi}</span>
                      <span className={clsx('text-xs font-bold font-mono uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10', bmiInfo.color)}>
                        {bmiInfo.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-[#888888] text-right font-mono hidden sm:block">
                  <p>Weight: <span className="text-white font-bold">{formData.weightKg} kg</span></p>
                  <p>Height: <span className="text-white font-bold">{formData.heightCm} cm</span></p>
                </div>
              </div>

              {/* Mandatory Core Measurements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A5A5A5] mb-1.5 uppercase tracking-wider">
                    Current Body Weight (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="35"
                    max="250"
                    required
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-[#FFC21A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5A5A5] mb-1.5 uppercase tracking-wider">
                    Standing Height (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="120"
                    max="230"
                    required
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-[#FFC21A]"
                  />
                </div>
              </div>

              {/* Optional Girth Measurements */}
              <div>
                <span className="text-xs font-bold text-[#FFC21A] uppercase tracking-wider block mb-3">
                  Optional Girth Measurements (for hypertrophy & body recomposition tracking)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#888] mb-1">Body Fat %</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 15.5"
                      value={formData.bodyFatPct || ''}
                      onChange={(e) => setFormData({ ...formData, bodyFatPct: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#171717] border border-[#292929] rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-[#FFC21A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#888] mb-1">Chest (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 102"
                      value={formData.chestCm || ''}
                      onChange={(e) => setFormData({ ...formData, chestCm: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#171717] border border-[#292929] rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-[#FFC21A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#888] mb-1">Waist (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 84"
                      value={formData.waistCm || ''}
                      onChange={(e) => setFormData({ ...formData, waistCm: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#171717] border border-[#292929] rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-[#FFC21A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#888] mb-1">Arms (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 38"
                      value={formData.armsCm || ''}
                      onChange={(e) => setFormData({ ...formData, armsCm: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#171717] border border-[#292929] rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-[#FFC21A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#888] mb-1">Thighs (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 58"
                      value={formData.thighsCm || ''}
                      onChange={(e) => setFormData({ ...formData, thighsCm: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#171717] border border-[#292929] rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-[#FFC21A]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FITNESS PROFILE & LIMITATIONS */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[#222222] pb-3">
                <h3 className="text-base font-bold text-[#F5F5F5]">Step 3: Fitness Target, Experience & Limitations</h3>
                <p className="text-xs text-[#888888] mt-0.5">
                  The personalized workout engine uses this profile to schedule your day-of-week routines and substitute high-stress exercises safely.
                </p>
              </div>

              {/* Primary Goal Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#A5A5A5] mb-2 uppercase tracking-wider">
                  Primary Fitness Directive *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'MUSCLE_GAIN', title: 'Muscle Gain / Hypertrophy', desc: 'Push-Pull-Legs split with volume & progressive overload' },
                    { key: 'WEIGHT_LOSS', title: 'Fat Loss & Conditioning', desc: 'Metabolic circuits, HIIT, core & caloric burn' },
                    { key: 'STRENGTH', title: 'Strength & Powerbuilding', desc: 'Barbell compound lifts, high intensity, rest focus' },
                    { key: 'ENDURANCE', title: 'Aerobic & Functional', desc: 'Sustained stamina, cardio intervals & agility' },
                    { key: 'GENERAL_FITNESS', title: 'General Fitness & Longevity', desc: 'Balanced health, posture, mobility & well-being' },
                  ].map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, goalType: g.key as any })}
                      className={clsx(
                        'p-4 rounded-2xl border text-left transition',
                        formData.goalType === g.key
                          ? 'border-[#FFC21A] bg-[#FFC21A]/10 text-white'
                          : 'border-[#292929] bg-[#171717] text-[#888888] hover:text-[#F5F5F5] hover:border-[#444]'
                      )}
                    >
                      <span className="text-sm font-bold block text-[#F5F5F5]">{g.title}</span>
                      <span className="text-xs text-[#888888] mt-1 block leading-relaxed">{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level & Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A5A5A5] mb-1.5 uppercase tracking-wider">
                    Training Experience
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                    className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFC21A]"
                  >
                    <option value="BEGINNER">Beginner (&lt; 1 year)</option>
                    <option value="INTERMEDIATE">Intermediate (1-3 years)</option>
                    <option value="ADVANCED">Advanced (3+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5A5A5] mb-1.5 uppercase tracking-wider">
                    Weekly Commitment
                  </label>
                  <select
                    value={formData.daysPerWeek}
                    onChange={(e) => setFormData({ ...formData, daysPerWeek: parseInt(e.target.value, 10) })}
                    className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFC21A]"
                  >
                    <option value={3}>3 Days / Week</option>
                    <option value={4}>4 Days / Week</option>
                    <option value={5}>5 Days / Week</option>
                    <option value={6}>6 Days / Week (Optimal Split)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5A5A5] mb-1.5 uppercase tracking-wider">
                    Target Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.targetWeightKg}
                    onChange={(e) => setFormData({ ...formData, targetWeightKg: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-[#FFC21A]"
                  />
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <label className="block text-xs font-semibold text-[#A5A5A5] mb-1.5 uppercase tracking-wider">
                  Nutritional / Dietary Profile
                </label>
                <select
                  value={formData.dietaryPreference}
                  onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value })}
                  className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFC21A]"
                >
                  <option value="High Protein Non-Veg & Eggs">High Protein Non-Veg & Eggs</option>
                  <option value="Vegetarian with Dairy & Whey">Vegetarian (Paneer, Soya, Dairy & Whey)</option>
                  <option value="Eggetarian">Eggetarian (Vegetarian + Eggs)</option>
                  <option value="Plant-Based Vegan">Plant-Based Vegan</option>
                  <option value="Standard Balanced Diet">Standard Indian Balanced Diet</option>
                </select>
              </div>

              {/* Physical Limitations / Injury Considerations */}
              <div>
                <label className="block text-xs font-semibold text-[#A5A5A5] mb-2 uppercase tracking-wider">
                  Physical Limitations & Prior Injuries (Auto-Substitution Active)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'NONE', label: 'None / 100% Fully Functional' },
                    { key: 'LOWER_BACK_PAIN', label: 'Lower Back / Lumbar Strain' },
                    { key: 'KNEE_PAIN', label: 'Knee Sensitivity / Patellar Tendonitis' },
                    { key: 'SHOULDER_IMPINGEMENT', label: 'Rotator Cuff / Shoulder Impingement' },
                    { key: 'WRIST_PAIN', label: 'Wrist Joint Strain' },
                    { key: 'HYPERTENSION', label: 'Blood Pressure / Cardiac Awareness' },
                  ].map((lim) => {
                    const isSelected = lim.key === 'NONE'
                      ? formData.limitations.length === 0
                      : formData.limitations.includes(lim.key);
                    return (
                      <button
                        key={lim.key}
                        type="button"
                        onClick={() => toggleLimitation(lim.key)}
                        className={clsx(
                          'px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5',
                          isSelected
                            ? 'bg-[#FFC21A] text-black border-[#FFC21A] font-bold'
                            : 'bg-[#171717] text-[#888888] border-[#292929] hover:text-white'
                        )}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{lim.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: TRAINING READINESS & PAR-Q */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[#222222] pb-3">
                <h3 className="text-base font-bold text-[#F5F5F5]">Step 4: Induction Summary & Physical Readiness</h3>
                <p className="text-xs text-[#888888] mt-0.5">
                  Confirm your readiness declaration to activate your personalized workout protocol in the gym database.
                </p>
              </div>

              {/* Summary Profile Grid */}
              <div className="bg-[#141414] p-5 rounded-2xl border border-[#292929] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[#888] block text-[10px] uppercase font-mono">Member Name</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">{user?.fullName}</span>
                </div>
                <div>
                  <span className="text-[#888] block text-[10px] uppercase font-mono">Weight / BMI</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">{formData.weightKg} kg (BMI: {bmiInfo.bmi})</span>
                </div>
                <div>
                  <span className="text-[#888] block text-[10px] uppercase font-mono">Primary Goal</span>
                  <span className="font-bold text-[#FFC21A] text-sm mt-0.5 block">{formData.goalType.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span className="text-[#888] block text-[10px] uppercase font-mono">Limitations</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">
                    {formData.limitations.length > 0 ? formData.limitations.join(', ') : 'None'}
                  </span>
                </div>
              </div>

              {/* Equipment Capacity Optimization Note */}
              <div className="bg-[#171717] p-4 rounded-2xl border border-emerald-500/20 flex items-start space-x-3 text-xs text-[#A5A5A5]">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold">Equipment Capacity & Substitution Engine Active:</strong>
                  Your workouts will be automatically cross-referenced with RV Fitness Narsobawadi's real-time equipment status.
                  If any machine is scheduled for maintenance, safe biomechanical alternatives will be provided seamlessly.
                </div>
              </div>

              {/* PAR-Q Agreement Checkbox */}
              <div className="p-4 rounded-2xl bg-[#141414] border border-[#292929] flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="parq"
                  required
                  checked={formData.parqAccepted}
                  onChange={(e) => setFormData({ ...formData, parqAccepted: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-[#333] text-[#FFC21A] focus:ring-[#FFC21A] bg-[#222]"
                />
                <label htmlFor="parq" className="text-xs text-[#F5F5F5] leading-relaxed cursor-pointer">
                  <strong>PAR-Q Physical Activity Declaration:</strong> I confirm that I am in safe physical health to participate in strength and cardiovascular exercise at RV Fitness, Narsobawadi. I have disclosed all injuries and limitations, and understand that workout routines are guidance designed for progressive fitness improvement.
                </label>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-[#222222] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-5 py-2.5 rounded-xl bg-[#1A1A1A] text-[#F5F5F5] text-xs font-bold hover:bg-[#252525] transition flex items-center space-x-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#FFC21A] text-black text-xs font-black uppercase tracking-wider hover:bg-[#e5ad16] transition flex items-center space-x-1.5 shadow-md shadow-[#FFC21A]/10"
              >
                <span>Continue Step {step + 1}</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={completeMutation.isPending || !formData.parqAccepted}
                className="px-8 py-3 rounded-xl bg-[#FFC21A] text-black text-xs font-black uppercase tracking-wider hover:bg-[#e5ad16] disabled:opacity-50 transition flex items-center space-x-2 shadow-lg shadow-[#FFC21A]/20"
              >
                {completeMutation.isPending ? (
                  <span>Activating Regimen...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Complete Induction & Activate Regimen</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
