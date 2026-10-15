import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMyAttendanceHistory } from '@/hooks/useAttendance';
import {
  useMyWorkout,
  useMyDiet,
  useMyAssessments,
  useTodayWorkout,
  useOnboardingStatus,
  useMyProfile,
} from '@/hooks/useFitness';
import { useMyNotifications } from '@/hooks/useNotifications';
import { DigitalIdCard } from './DigitalIdCard';
import { OnboardingWizard } from './OnboardingWizard';
import {
  Dumbbell,
  Flame,
  Calendar,
  QrCode,
  Apple,
  Activity,
  ArrowRight,
  CheckCircle2,
  Bell,
  Sparkles,
  AlertTriangle,
  Clock,
  ChevronRight,
  ShieldAlert,
  HeartPulse,
} from 'lucide-react';
import clsx from 'clsx';

export const MemberDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const { data: onboardingStatus, isLoading: isOnboardingLoading } = useOnboardingStatus();
  const { data: myProfile } = useMyProfile();
  const { data: todaySession } = useTodayWorkout();
  const { data: attendanceHistory = [] } = useMyAttendanceHistory();
  const { data: diet } = useMyDiet();
  const { data: assessments = [] } = useMyAssessments();
  const { data: notifications = [] } = useMyNotifications();

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const latestAssessment = assessments[0];

  // Active membership details and expiry countdown
  const activeMembership = myProfile?.memberships?.[0];
  const membershipDaysRemaining = activeMembership
    ? Math.max(0, Math.ceil((new Date(activeMembership.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const today = todaySession?.today;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialData={onboardingStatus}
      />

      {/* Onboarding Alert Banner if incomplete */}
      {!isOnboardingLoading && onboardingStatus && !onboardingStatus.completed && (
        <div className="bg-gradient-to-r from-[#FFC21A]/20 via-[#1F1905] to-[#141414] border border-[#FFC21A]/50 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFC21A] text-black flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#FFC21A] font-bold">
                Induction Action Required
              </span>
              <h3 className="text-xl font-black text-[#F5F5F5] uppercase tracking-wide mt-0.5">
                Complete Your First-Login Biometric Induction
              </h3>
              <p className="text-xs text-[#C5C5C5] mt-1 max-w-2xl leading-relaxed">
                Personalize your day-of-week workout engine, calibrate health goals, and record baseline BMI and measurements to unlock real-time equipment optimization in Narsobawadi.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="px-6 py-3 rounded-xl bg-[#FFC21A] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#e5ad16] transition shrink-0 shadow-lg shadow-[#FFC21A]/20 flex items-center space-x-2 cursor-pointer"
          >
            <span>Start Induction Wizard</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-[#FFC21A] uppercase tracking-wider">
            Member Sanctuary
          </span>
          <h1 className="text-3xl font-black text-[#F5F5F5] uppercase mt-1">
            Welcome Back, {user?.fullName}
          </h1>
          <p className="text-sm text-[#A5A5A5] mt-1">
            Track your workout splits, nutrition macros, and scan your digital pass at the turnstile.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] text-[#F5F5F5] font-bold text-xs hover:border-[#FFC21A] transition cursor-pointer"
          >
            {onboardingStatus?.completed ? 'Update Biometrics' : 'Induction Profile'}
          </button>
          <Link
            to="/member/qr"
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-[#FFC21A] text-black font-extrabold text-sm shadow-md shadow-[#FFC21A]/10 hover:bg-[#e5ad16] transition"
          >
            <QrCode className="w-4 h-4 stroke-[2.5]" />
            <span>Open QR Pass</span>
          </Link>
        </div>
      </div>

      {/* Notifications Alert Bar */}
      {unreadNotifications.length > 0 && (
        <div className="bg-[#171717] p-4 rounded-2xl border border-[#FFC21A]/30 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs sm:text-sm text-[#F5F5F5]">
            <Bell className="w-5 h-5 text-[#FFC21A] shrink-0" />
            <span>
              <strong>Announcement:</strong> {unreadNotifications[0].title} — {unreadNotifications[0].message}
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#FFC21A]/20 text-[#FFC21A]">
            NEW
          </span>
        </div>
      )}

      {/* Core Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Attendance Check-Ins */}
        <div className="bg-[#111111] p-6 rounded-2xl border border-[#292929]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#888888] uppercase">Monthly Check-Ins</span>
            <Calendar className="w-5 h-5 text-[#FFC21A]" />
          </div>
          <p className="text-3xl font-black font-mono tabular-nums text-[#F5F5F5]">
            {attendanceHistory.length}
          </p>
          <p className="text-xs text-[#888888] mt-1">Total recorded turnstile visits</p>
        </div>

        {/* Active Plan & Expiry Countdown */}
        <div className="bg-[#111111] p-6 rounded-2xl border border-[#292929]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#888888] uppercase">Active Membership</span>
            <Dumbbell className="w-5 h-5 text-[#FFC21A]" />
          </div>
          <p className="text-xl font-black text-[#F5F5F5] truncate">
            {activeMembership?.plan?.name || 'Yearly Elite Athlete'}
          </p>
          <div className="flex items-center space-x-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              {membershipDaysRemaining !== null
                ? `${membershipDaysRemaining} days remaining`
                : 'Active Status'}
            </span>
          </div>
        </div>

        {/* Real Biometrics & BMI */}
        <div className="bg-[#111111] p-6 rounded-2xl border border-[#292929]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#888888] uppercase">Current Biometrics</span>
            <Activity className="w-5 h-5 text-[#FFC21A]" />
          </div>
          <p className="text-3xl font-black font-mono tabular-nums text-[#F5F5F5]">
            {latestAssessment ? `${Number(latestAssessment.weightKg).toFixed(1)} kg` : '78.5 kg'}
          </p>
          <div className="flex items-center space-x-2 text-xs text-[#888888] mt-1 font-mono">
            <span>BMI: <strong className="text-white">{latestAssessment ? Number(latestAssessment.bmi).toFixed(1) : '24.8'}</strong></span>
            {latestAssessment?.bodyFatPct && (
              <span>• BF: <strong className="text-white">{Number(latestAssessment.bodyFatPct).toFixed(1)}%</strong></span>
            )}
          </div>
        </div>

        {/* Daily Caloric Target */}
        <div className="bg-[#111111] p-6 rounded-2xl border border-[#292929]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#888888] uppercase">Daily Target</span>
            <Apple className="w-5 h-5 text-[#FFC21A]" />
          </div>
          <p className="text-3xl font-black font-mono tabular-nums text-[#FFC21A]">
            {diet ? `${diet.dailyCalories} kcal` : '2,400 kcal'}
          </p>
          <p className="text-xs text-[#888888] mt-1">
            {diet ? `${diet.proteinGrams}g Protein` : '160g Protein Target'}
          </p>
        </div>
      </div>

      {/* Main Split: QR Pass + Assigned Regimes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Digital ID Turnstile Pass */}
        <div className="lg:col-span-1">
          <DigitalIdCard />
        </div>

        {/* Right Column: Today's Assigned Session & Live Equipment Substitution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Personalized Workout Session */}
          <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#222222] gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#FFC21A]/20 text-[#FFC21A] font-bold">
                    TODAY IN ASIA/KOLKATA
                  </span>
                  <span className="text-xs text-[#888888] font-mono">
                    {today ? `${today.weekday}, Day ${today.dayNumber}` : 'Day Schedule'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#F5F5F5] uppercase mt-1">
                  {today ? today.dayTitle : 'Push A — Hypertrophy & Chest Power'}
                </h3>
              </div>
              <Link
                to="/member/workouts"
                className="text-xs font-bold text-[#FFC21A] hover:underline flex items-center space-x-1 shrink-0"
              >
                <span>Inspect 7-Day Split</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* If Today is Rest Day */}
            {today?.restDay ? (
              <div className="bg-[#171717] p-6 rounded-2xl border border-blue-500/20 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
                  <HeartPulse className="w-6 h-6 stroke-[2]" />
                </div>
                <h4 className="text-base font-bold text-white">Active Sanctuary Rest & Muscle Repair</h4>
                <p className="text-xs text-[#A5A5A5] max-w-md mx-auto leading-relaxed">
                  Your body repairs and builds muscle fibers during scheduled recovery days. Prioritize 3-4 liters of water, 8 hours of sleep, and gentle joint mobility.
                </p>
              </div>
            ) : today?.exercises && today.exercises.length > 0 ? (
              <div className="space-y-3">
                {today.exercises.map((ex: any) => (
                  <div
                    key={ex.id || ex.orderIndex}
                    className={clsx(
                      'p-4 rounded-2xl border transition',
                      ex.isSubstituted
                        ? 'bg-[#1C1710] border-[#FFC21A]/40'
                        : 'bg-[#171717] border-[#292929]'
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start space-x-3">
                        <span className="w-6 h-6 rounded-lg bg-[#222222] text-[#888888] font-mono text-xs flex items-center justify-center shrink-0">
                          {ex.orderIndex}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-[#F5F5F5]">{ex.exerciseName}</h4>
                            {ex.targetMuscle && (
                              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-[#888888]">
                                {ex.targetMuscle}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#888888] block mt-0.5">
                            Station: <span className="text-[#C5C5C5] font-medium">{ex.requiredEquipment}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-xs font-mono self-end sm:self-auto">
                        <span className="text-[#FFC21A] font-bold bg-[#FFC21A]/10 px-2.5 py-1 rounded-lg border border-[#FFC21A]/20">
                          {ex.sets} sets × {ex.reps}
                        </span>
                        <span className="text-[#737373]">
                          {ex.restSeconds || 90}s rest
                        </span>
                      </div>
                    </div>

                    {/* Substitution Warning Callout */}
                    {ex.substitutionNotice && (
                      <div className="mt-2.5 pt-2 border-t border-[#FFC21A]/20 flex items-center space-x-2 text-[11px] text-[#FFC21A]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{ex.substitutionNotice}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#888]">
                <p>Personalized workout split is active on your profile.</p>
                <Link to="/member/workouts" className="text-[#FFC21A] font-bold mt-2 inline-block">
                  Inspect Workout Details →
                </Link>
              </div>
            )}
          </div>

          {/* Nutrition Split Card */}
          <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929]">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#222222]">
              <div>
                <span className="text-xs font-bold text-[#FFC21A] uppercase">Nutrition Plan</span>
                <h3 className="text-xl font-bold text-[#F5F5F5]">
                  {diet ? diet.title : 'Clean Lean Mass Gain (2,400 kcal)'}
                </h3>
              </div>
              <Link
                to="/member/diets"
                className="text-xs font-bold text-[#FFC21A] hover:underline flex items-center space-x-1"
              >
                <span>View Meal Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-[#171717] p-4 rounded-xl border border-[#292929]">
                <span className="text-[10px] text-[#888] uppercase">Protein</span>
                <p className="text-xl font-mono font-bold text-[#F5F5F5] mt-1">
                  {diet ? `${diet.proteinGrams}g` : '160g'}
                </p>
              </div>
              <div className="bg-[#171717] p-4 rounded-xl border border-[#292929]">
                <span className="text-[10px] text-[#888] uppercase">Carbohydrates</span>
                <p className="text-xl font-mono font-bold text-[#F5F5F5] mt-1">
                  {diet ? `${diet.carbsGrams}g` : '260g'}
                </p>
              </div>
              <div className="bg-[#171717] p-4 rounded-xl border border-[#292929]">
                <span className="text-[10px] text-[#888] uppercase">Healthy Fats</span>
                <p className="text-xl font-mono font-bold text-[#F5F5F5] mt-1">
                  {diet ? `${diet.fatsGrams}g` : '65g'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
