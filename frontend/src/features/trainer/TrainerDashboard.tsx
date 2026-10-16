import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMembers } from '@/hooks/useMembers';
import { useDailyAttendance } from '@/hooks/useAttendance';
import { useRecordAssessment, useCreateWorkoutPlan, useCreateDietPlan } from '@/hooks/useFitness';
import {
  Users,
  Dumbbell,
  Apple,
  Activity,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  UserCheck,
  Calendar,
  AlertCircle,
  X,
  ChevronRight,
  Flame,
  FileText,
  Target,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export const TrainerDashboard: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data: membersData, isLoading: isLoadingMembers } = useMembers({ limit: 100 });
  const { data: attendanceData } = useDailyAttendance();

  const members = membersData?.data || [];
  const attendanceRecords = attendanceData?.records || [];
  const insideGymCount = attendanceRecords.filter((r) => !r.checkOutTime).length;

  const filteredMembers = members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.user?.fullName?.toLowerCase().includes(q) ||
      m.memberCode?.toLowerCase().includes(q) ||
      m.user?.phone?.includes(q)
    );
  });

  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<'assessment' | 'workout' | 'diet' | null>(null);

  // Form states for Assessment Logger
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('175');
  const [bodyFatPct, setBodyFatPct] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [notes, setNotes] = useState('');

  // Form states for Workout Plan
  const [workoutTitle, setWorkoutTitle] = useState('5-Day Hypertrophy Split');
  const [day1Title, setDay1Title] = useState('Chest & Triceps Power');
  const [day1Exercises, setDay1Exercises] = useState(
    'Flat Barbell Bench Press (4x8), Incline Dumbbell Press (3x10), Cable Flyes (3x15), Triceps Pushdown (4x12)'
  );

  // Form states for Diet Plan
  const [dietTitle, setDietTitle] = useState('High Protein Lean Mass (2,500 kcal)');
  const [calories, setCalories] = useState('2500');
  const [protein, setProtein] = useState('175');
  const [carbs, setCarbs] = useState('270');
  const [fats, setFats] = useState('70');
  const [guidelines, setGuidelines] = useState(
    'Drink at least 3.5L of water daily. Consume protein shake immediately post-workout.'
  );

  const { mutate: recordAssessment, isPending: isAssessing } = useRecordAssessment();
  const { mutate: createWorkout, isPending: isCreatingWorkout } = useCreateWorkoutPlan();
  const { mutate: createDiet, isPending: isCreatingDiet } = useCreateDietPlan();

  const handleAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    recordAssessment(
      {
        memberId: selectedMember.id,
        assessmentDate: new Date().toISOString().split('T')[0],
        weightKg: parseFloat(weightKg),
        heightCm: parseFloat(heightCm),
        bodyFatPct: bodyFatPct ? parseFloat(bodyFatPct) : undefined,
        chestCm: chestCm ? parseFloat(chestCm) : undefined,
        waistCm: waistCm ? parseFloat(waistCm) : undefined,
        notes,
      },
      {
        onSuccess: () => {
          setActiveModal(null);
          setWeightKg('');
        },
      }
    );
  };

  const handleWorkoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    createWorkout(
      {
        memberId: selectedMember.id,
        title: workoutTitle,
        startDate: new Date().toISOString(),
        days: [
          {
            dayNumber: 1,
            dayTitle: day1Title,
            restDay: false,
            exercises: day1Exercises.split(',').map((item, idx) => ({
              exerciseName: item.trim(),
              sets: 4,
              reps: '10-12',
              restSeconds: 90,
              orderIndex: idx,
            })),
          },
          {
            dayNumber: 2,
            dayTitle: 'Back & Biceps Thickness',
            restDay: false,
            exercises: [
              { exerciseName: 'Deadlift', sets: 4, reps: '6', restSeconds: 120, orderIndex: 0 },
              { exerciseName: 'Lat Pulldown', sets: 3, reps: '10', restSeconds: 90, orderIndex: 1 },
              { exerciseName: 'Barbell Bicep Curl', sets: 4, reps: '12', restSeconds: 60, orderIndex: 2 },
            ],
          },
          {
            dayNumber: 3,
            dayTitle: 'Rest & Mobility Recovery',
            restDay: true,
            exercises: [],
          },
        ],
      },
      {
        onSuccess: () => {
          setActiveModal(null);
        },
      }
    );
  };

  const handleDietSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    createDiet(
      {
        memberId: selectedMember.id,
        title: dietTitle,
        dailyCalories: parseInt(calories, 10),
        proteinGrams: parseInt(protein, 10),
        carbsGrams: parseInt(carbs, 10),
        fatsGrams: parseInt(fats, 10),
        guidelines,
        meals: [
          {
            mealName: 'Meal 1 (Breakfast)',
            foodItems: '4 Whole eggs, 2 slices multigrain toast, 1 banana, black coffee',
            calories: 550,
            orderIndex: 0,
          },
          {
            mealName: 'Meal 2 (Lunch)',
            foodItems: '200g Chicken breast / paneer, 1.5 cups white rice, green salad',
            calories: 650,
            orderIndex: 1,
          },
          {
            mealName: 'Meal 3 (Pre-Workout)',
            foodItems: 'Oatmeal 60g with peanut butter, apple',
            calories: 400,
            orderIndex: 2,
          },
          {
            mealName: 'Meal 4 (Dinner)',
            foodItems: 'Dal tadka, 2 rotis, paneer bhurji or grilled fish',
            calories: 600,
            orderIndex: 3,
          },
        ],
      },
      {
        onSuccess: () => {
          setActiveModal(null);
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-[#141418] p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#1A1A22] border border-white/10 text-[11px] font-mono font-bold text-[#FFC21A] mb-1.5">
            <Sparkles className="w-3 h-3" />
            <span>TRAINER FLOOR COMMAND & ATHLETE PROGRAMMING</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Coaching & Program Builder
          </h1>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Assign custom workout splits, log biometric assessments, and configure dietary protocols for your athletes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/admin/attendance">
            <Button variant="secondary" size="sm" className="text-xs font-bold uppercase tracking-wider">
              <QrCode className="w-3.5 h-3.5 mr-1.5 text-[#FFC21A]" />
              <span>Turnstile Scanner</span>
            </Button>
          </Link>
          <div className="px-3.5 py-2 rounded-xl bg-[#101014] border border-white/10 text-center">
            <span className="text-[10px] font-mono text-[#71717A] uppercase block font-semibold">Inside Gym Now</span>
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
              {insideGymCount} Athletes
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#101014] border border-white/10 text-center">
            <span className="text-[10px] font-mono text-[#71717A] uppercase block font-semibold">Assigned Roster</span>
            <span className="text-lg font-bold font-mono text-[#FFC21A] tabular-nums">
              {members.length} Total
            </span>
          </div>
        </div>
      </div>

      {/* Daily Agenda & Coaching Priorities Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#141418] border border-white/10 shadow-md flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Floor Training Agenda</h4>
            <p className="text-xs text-[#A1A1AA] mt-0.5 leading-snug">
              {insideGymCount} verified athlete{insideGymCount === 1 ? ' is' : 's are'} checked in at the turnstile desk right now.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141418] border border-white/10 shadow-md flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFC21A]/10 border border-[#FFC21A]/20 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-[#FFC21A]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Biometric Evaluations</h4>
            <p className="text-xs text-[#A1A1AA] mt-0.5 leading-snug">
              Weekly weigh-in, body fat caliper check, and circumference tape measurements.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141418] border border-white/10 shadow-md flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Custom Workout Splits</h4>
            <p className="text-xs text-[#A1A1AA] mt-0.5 leading-snug">
              Push-Pull-Legs, Upper/Lower, or Olympic lifting protocols assigned per athlete.
            </p>
          </div>
        </div>
      </div>

      {/* Member Roster & Coaching Actions Table */}
      <div className="bg-[#141418] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-tight">
              Assigned Athletes Roster
            </h2>
            <p className="text-xs text-[#A1A1AA]">
              Select an athlete to log physical assessments, prescribe workouts, or set dietary macros.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search athlete by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#101014] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#FFC21A]"
            />
          </div>
        </div>

        {isLoadingMembers ? (
          <div className="p-12 text-center">
            <LoadingSpinner size="lg" />
            <p className="text-xs text-[#71717A] mt-2">Loading assigned athlete files...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-[#71717A] text-xs">
            No athletes found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101014] text-[#71717A] uppercase font-mono border-b border-white/10">
                <tr>
                  <th className="py-3 px-4 font-semibold">Athlete ID</th>
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Contact</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 text-right font-semibold">Coaching Direct Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMembers.map((m: any) => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#FFC21A]">
                      {m.memberCode}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white text-sm">
                      {m.user?.fullName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#A1A1AA]">
                      {m.user?.phone || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(m);
                            setActiveModal('assessment');
                          }}
                          className="text-xs px-2.5 py-1 h-auto"
                        >
                          <Activity className="w-3.5 h-3.5 mr-1 text-[#FFC21A]" />
                          <span>Assess</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(m);
                            setActiveModal('workout');
                          }}
                          className="text-xs px-2.5 py-1 h-auto"
                        >
                          <Dumbbell className="w-3.5 h-3.5 mr-1 text-sky-400" />
                          <span>Workout</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(m);
                            setActiveModal('diet');
                          }}
                          className="text-xs px-2.5 py-1 h-auto"
                        >
                          <Apple className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                          <span>Diet</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Assessment Logger */}
      {activeModal === 'assessment' && selectedMember && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title={`Log Biometric Assessment — ${selectedMember.user?.fullName}`}
          size="md"
        >
          <form onSubmit={handleAssessmentSubmit} className="space-y-4 p-2">
            <p className="text-xs text-[#A1A1AA]">
              Values are used to calculate real-time BMI and track physical progress on the member's portal.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Weight (kg) *"
                type="number"
                step="0.1"
                required
                placeholder="75.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
              <Input
                label="Height (cm) *"
                type="number"
                step="0.5"
                required
                placeholder="175"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Body Fat %"
                type="number"
                step="0.1"
                placeholder="14.5"
                value={bodyFatPct}
                onChange={(e) => setBodyFatPct(e.target.value)}
              />
              <Input
                label="Chest (cm)"
                type="number"
                step="0.5"
                placeholder="98"
                value={chestCm}
                onChange={(e) => setChestCm(e.target.value)}
              />
              <Input
                label="Waist (cm)"
                type="number"
                step="0.5"
                placeholder="82"
                value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-[#CCCCCC]">
                Coach Evaluation Notes
              </label>
              <textarea
                rows={2}
                placeholder="Posture, mobility observations, or strength milestones..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white resize-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
              <Button type="button" variant="secondary" size="sm" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isAssessing}>
                Save Assessment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Workout Plan Builder */}
      {activeModal === 'workout' && selectedMember && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title={`Prescribe Workout Program — ${selectedMember.user?.fullName}`}
          size="lg"
        >
          <form onSubmit={handleWorkoutSubmit} className="space-y-4 p-2">
            <Input
              label="Program Title *"
              required
              placeholder="e.g. 5-Day Hypertrophy & Strength Split"
              value={workoutTitle}
              onChange={(e) => setWorkoutTitle(e.target.value)}
            />

            <div className="p-3.5 rounded-xl bg-[#101014] border border-white/10 space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#FFC21A] uppercase block">
                Day 1 Routine Configuration
              </span>
              <Input
                label="Day 1 Title"
                value={day1Title}
                onChange={(e) => setDay1Title(e.target.value)}
              />
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-[#CCCCCC]">
                  Exercise List (Comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={day1Exercises}
                  onChange={(e) => setDay1Exercises(e.target.value)}
                  placeholder="Flat Bench Press (4x8), Incline Dumbbell Press (3x10)..."
                  className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white resize-none font-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
              <Button type="button" variant="secondary" size="sm" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isCreatingWorkout}>
                Assign Program
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Diet Plan Builder */}
      {activeModal === 'diet' && selectedMember && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title={`Configure Nutrition Protocol — ${selectedMember.user?.fullName}`}
          size="lg"
        >
          <form onSubmit={handleDietSubmit} className="space-y-4 p-2">
            <Input
              label="Nutrition Protocol Title *"
              required
              placeholder="e.g. High Protein Muscle Gain (2,600 kcal)"
              value={dietTitle}
              onChange={(e) => setDietTitle(e.target.value)}
            />

            <div className="grid grid-cols-4 gap-2.5">
              <Input
                label="Calories (kcal)"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
              <Input
                label="Protein (g)"
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
              <Input
                label="Carbs (g)"
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
              <Input
                label="Fats (g)"
                type="number"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-[#CCCCCC]">
                Guidelines & Hydration Instructions
              </label>
              <textarea
                rows={2}
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                placeholder="Hydration, timing, and supplementation instructions..."
                className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white resize-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
              <Button type="button" variant="secondary" size="sm" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isCreatingDiet}>
                Save Diet Plan
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
