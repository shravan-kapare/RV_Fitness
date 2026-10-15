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
  ShieldCheck,
  Scale,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialData={onboardingStatus}
      />

      {/* Onboarding Alert Banner if incomplete */}
      {!isOnboardingLoading && onboardingStatus && !onboardingStatus.completed && (
        <div className="bg-gradient-to-r from-[#FFC21A]/20 via-[#1F1905] to-[#141418] border border-[#FFC21A]/40 p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFC21A] text-black flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#FFC21A] font-bold">
                Action Recommended
              </span>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight mt-0.5">
                Complete Your Biometric Induction
              </h3>
              <p className="text-xs text-[#A5A5A5] mt-0.5 max-w-xl leading-relaxed">
                Personalize your 7-day workout split, calibrate target calories, and calculate baseline BMI for coach tracking.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsOnboardingOpen(true)}
            className="font-bold text-xs uppercase tracking-wider shrink-0"
          >
            <span>Start Induction</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Top Welcome Header */}
      <div className="bg-[#141418] p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#1A1A22] border border-white/10 text-[11px] font-mono font-bold text-[#FFC21A] mb-1.5">
            <Dumbbell className="w-3 h-3" />
            <span>ATHLETE DASHBOARD & TRAINING DESK</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Welcome Back, {user?.fullName}
          </h1>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Narsobawadi Center • Track your daily workout split, nutrition macros, and scan your digital pass.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsOnboardingOpen(true)}
            className="text-xs font-semibold"
          >
            <span>{onboardingStatus?.completed ? 'Update Biometrics' : 'Induction Profile'}</span>
          </Button>

          <Link to="/member/qr">
            <Button variant="primary" size="sm" className="font-bold text-xs uppercase tracking-wider">
              <QrCode className="w-3.5 h-3.5 mr-1.5" />
              <span>Digital QR Pass</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Notification Announcement Bar (if any) */}
      {unreadNotifications.length > 0 && (
        <div className="bg-[#141418] p-4 rounded-2xl border border-[#FFC21A]/30 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3 text-xs sm:text-sm text-white">
            <Bell className="w-4 h-4 text-[#FFC21A] shrink-0" />
            <span>
              <strong>Announcement:</strong> {unreadNotifications[0].title} — {unreadNotifications[0].message}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFC21A]/20 text-[#FFC21A] font-bold">
            NEW
          </span>
        </div>
      )}

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Attendance Check-ins */}
        <div className="bg-[#141418] p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-[#A1A1AA]">
            <span>Monthly Check-Ins</span>
            <Calendar className="w-4 h-4 text-[#FFC21A]" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {attendanceHistory.length}
            </div>
            <p className="text-[11px] text-[#71717A] mt-0.5 font-mono">Turnstile admissions</p>
          </div>
        </div>

        {/* Active Membership Status */}
        <div className="bg-[#141418] p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-[#A1A1AA]">
            <span>Active Plan</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-base sm:text-lg font-bold text-white truncate">
              {activeMembership?.plan?.name || 'Yearly Elite Athlete'}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                {membershipDaysRemaining !== null ? `${membershipDaysRemaining} days remaining` : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Current Body Weight */}
        <div className="bg-[#141418] p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-[#A1A1AA]">
            <span>Current Weight</span>
            <Scale className="w-4 h-4 text-[#FFC21A]" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {latestAssessment ? `${Number(latestAssessment.weightKg).toFixed(1)} kg` : '74.5 kg'}
            </div>
            <p className="text-[11px] text-[#71717A] mt-0.5 font-mono">
              BMI: {latestAssessment ? Number(latestAssessment.bmi).toFixed(1) : '22.8'}
            </p>
          </div>
        </div>

        {/* Target Daily Energy */}
        <div className="bg-[#141418] p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-[#A1A1AA]">
            <span>Daily Macro Target</span>
            <Apple className="w-4 h-4 text-[#FFC21A]" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#FFC21A] tabular-nums">
              {diet?.dailyCalories || 2400}{' '}
              <span className="text-xs text-[#A1A1AA] font-normal">kcal</span>
            </div>
            <p className="text-[11px] text-[#71717A] mt-0.5 font-mono">
              Protein: {diet?.proteinGrams || 160}g
            </p>
          </div>
        </div>
      </div>

      {/* Main Focus: Today's Workout & Digital Pass */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Workout Routine (7 cols) */}
        <div className="lg:col-span-7 bg-[#141418] p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <div className="flex items-center space-x-2">
                <Dumbbell className="w-4 h-4 text-[#FFC21A]" />
                <h2 className="text-base font-bold text-white uppercase tracking-tight">
                  Today's Training Session
                </h2>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                {today?.isRestDay
                  ? 'Scheduled Recovery & Mobility'
                  : today?.dayTitle || 'Assigned Workout Split'}
              </p>
            </div>
            <Link
              to="/member/workouts"
              className="text-xs text-[#FFC21A] hover:underline flex items-center gap-1 font-bold uppercase tracking-wider"
            >
              <span>Full 7-Day Split</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {today?.isRestDay ? (
            <div className="p-8 text-center bg-[#101014] rounded-xl border border-white/5 space-y-2">
              <Flame className="w-10 h-10 text-amber-400 mx-auto opacity-75" />
              <h3 className="font-bold text-white uppercase text-sm">Active Recovery Day</h3>
              <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
                No heavy lifting scheduled today. Focus on hydration, 20 minutes of light mobility or foam rolling, and adequate sleep.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {(today?.exercises || [
                { exerciseName: 'Barbell Bench Press', sets: 4, reps: '8-10', restSeconds: 90 },
                { exerciseName: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restSeconds: 60 },
                { exerciseName: 'Cable Crossover Flyes', sets: 3, reps: '15', restSeconds: 60 },
                { exerciseName: 'Triceps Rope Pushdown', sets: 4, reps: '12', restSeconds: 45 },
              ]).map((ex: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#101014] border border-white/5"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-[#1C1C24] text-xs font-mono font-bold text-[#FFC21A] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-white">{ex.exerciseName}</span>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-[#FFC21A] font-bold">{ex.sets} sets</span>
                    <span className="text-[#71717A]"> × </span>
                    <span className="text-white">{ex.reps} reps</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Digital Turnstile Pass Card (5 cols) */}
        <div className="lg:col-span-5">
          <DigitalIdCard />
        </div>
      </div>
    </div>
  );
};
