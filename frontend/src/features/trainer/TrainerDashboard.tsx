import React, { useState } from 'react';
import { useMembers } from '@/hooks/useMembers';
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
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TrainerDashboard: React.FC = () => {
  const { data: membersData, isLoading } = useMembers();
  const members = membersData?.data || [];

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
  const [day1Exercises, setDay1Exercises] = useState('Flat Barbell Bench Press (4x8), Incline Dumbbell Press (3x10), Cable Flyes (3x15), Triceps Rope Pushdown (4x12)');

  // Form states for Diet Plan
  const [dietTitle, setDietTitle] = useState('High Protein Lean Mass (2,500 kcal)');
  const [calories, setCalories] = useState('2500');
  const [protein, setProtein] = useState('175');
  const [carbs, setCarbs] = useState('270');
  const [fats, setFats] = useState('70');
  const [guidelines, setGuidelines] = useState('Drink at least 3.5L of water daily. Consume whey shake immediately post-workout.');

  const { mutate: recordAssessment, isPending: isAssessing } = useRecordAssessment();
  const { mutate: createWorkout, isPending: isCreatingWorkout } = useCreateWorkoutPlan();
  const { mutate: createDiet, isPending: isCreatingDiet } = useCreateDietPlan();

  const handleAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    recordAssessment({
      memberId: selectedMember.id,
      assessmentDate: new Date().toISOString().split('T')[0],
      weightKg: parseFloat(weightKg),
      heightCm: parseFloat(heightCm),
      bodyFatPct: bodyFatPct ? parseFloat(bodyFatPct) : undefined,
      chestCm: chestCm ? parseFloat(chestCm) : undefined,
      waistCm: waistCm ? parseFloat(waistCm) : undefined,
      notes,
    }, {
      onSuccess: () => {
        setActiveModal(null);
        setWeightKg('');
      }
    });
  };

  const handleWorkoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    createWorkout({
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
    }, {
      onSuccess: () => {
        setActiveModal(null);
      }
    });
  };

  const handleDietSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    createDiet({
      memberId: selectedMember.id,
      title: dietTitle,
      dailyCalories: parseInt(calories, 10),
      proteinGrams: parseInt(protein, 10),
      carbsGrams: parseInt(carbs, 10),
      fatsGrams: parseInt(fats, 10),
      guidelines,
      meals: [
        { mealName: 'Meal 1 (Breakfast)', foodItems: '4 Whole eggs, 2 slices multigrain toast, 1 banana, black coffee', calories: 550, orderIndex: 0 },
        { mealName: 'Meal 2 (Lunch)', foodItems: '200g Chicken breast / paneer, 1.5 cups white rice, green salad', calories: 650, orderIndex: 1 },
        { mealName: 'Meal 3 (Pre-Workout)', foodItems: 'Oatmeal 60g with peanut butter, apple', calories: 400, orderIndex: 2 },
        { mealName: 'Meal 4 (Dinner)', foodItems: 'Dal tadka, 2 rotis, paneer bhurji or grilled fish', calories: 600, orderIndex: 3 },
      ],
    }, {
      onSuccess: () => {
        setActiveModal(null);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-[#FFC21A] uppercase tracking-wider">
            Trainer Floor Command
          </span>
          <h1 className="text-3xl font-black text-[#F5F5F5] uppercase mt-1">
            Coaching & Program Builder
          </h1>
          <p className="text-sm text-[#A5A5A5] mt-1">
            Assign custom workout splits, log biometric assessments, and configure dietary protocols.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-xl bg-[#171717] border border-[#292929] text-xs font-mono text-[#F5F5F5]">
            Total Athletes: <strong className="text-[#FFC21A]">{members.length}</strong>
          </div>
        </div>
      </div>

      {/* Member Selection & Quick Action Table */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
          <h2 className="text-xl font-bold text-[#F5F5F5] uppercase border-l-2 border-[#FFC21A] pl-3">
            Assigned Athletes
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#171717] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#A5A5A5]">
              <thead className="bg-[#171717] text-xs uppercase font-mono text-[#888] border-b border-[#292929]">
                <tr>
                  <th className="py-3 px-4">Athlete Code</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {members.map((m: any) => (
                  <tr key={m.id} className="hover:bg-[#171717]/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#FFC21A]">{m.memberCode}</td>
                    <td className="py-3 px-4 text-[#F5F5F5] font-semibold">{m.user?.fullName}</td>
                    <td className="py-3 px-4 font-mono">{m.user?.phone || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400">
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedMember(m);
                          setActiveModal('assessment');
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222] border border-[#333] text-xs text-[#F5F5F5] font-semibold transition"
                      >
                        <Activity className="w-3.5 h-3.5 text-[#FFC21A]" />
                        <span>Log Stats</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMember(m);
                          setActiveModal('workout');
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222] border border-[#333] text-xs text-[#F5F5F5] font-semibold transition"
                      >
                        <Dumbbell className="w-3.5 h-3.5 text-[#FFC21A]" />
                        <span>Split</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMember(m);
                          setActiveModal('diet');
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222] border border-[#333] text-xs text-[#F5F5F5] font-semibold transition"
                      >
                        <Apple className="w-3.5 h-3.5 text-[#FFC21A]" />
                        <span>Diet</span>
                      </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[#292929] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
              <div>
                <span className="text-xs font-bold text-[#FFC21A] uppercase">Weekly Evaluation</span>
                <h3 className="text-xl font-bold text-[#F5F5F5]">
                  Log Assessment for {selectedMember.user?.fullName}
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#888] hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleAssessmentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="75.5"
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Height (cm) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="175"
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Body Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFatPct}
                    onChange={(e) => setBodyFatPct(e.target.value)}
                    placeholder="14.5"
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={chestCm}
                    onChange={(e) => setChestCm(e.target.value)}
                    placeholder="102"
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={waistCm}
                    onChange={(e) => setWaistCm(e.target.value)}
                    placeholder="82"
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Coach Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Progress feedback, form observations..."
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#888] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssessing}
                  className="px-6 py-2 rounded-xl bg-[#FFC21A] text-black font-bold text-xs hover:bg-[#e5ad16] transition disabled:opacity-50"
                >
                  {isAssessing ? 'Saving...' : 'Record Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Workout Routine Assign */}
      {activeModal === 'workout' && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[#292929] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
              <div>
                <span className="text-xs font-bold text-[#FFC21A] uppercase">Program Split</span>
                <h3 className="text-xl font-bold text-[#F5F5F5]">
                  Assign Workout to {selectedMember.user?.fullName}
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#888] hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleWorkoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Program Title *</label>
                <input
                  type="text"
                  required
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Day 1 Focus Title *</label>
                <input
                  type="text"
                  required
                  value={day1Title}
                  onChange={(e) => setDay1Title(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">
                  Day 1 Exercises (Comma-separated) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={day1Exercises}
                  onChange={(e) => setDay1Exercises(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#888] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingWorkout}
                  className="px-6 py-2 rounded-xl bg-[#FFC21A] text-black font-bold text-xs hover:bg-[#e5ad16] transition disabled:opacity-50"
                >
                  {isCreatingWorkout ? 'Saving...' : 'Deploy Workout Split'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Diet Plan Assign */}
      {activeModal === 'diet' && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[#292929] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
              <div>
                <span className="text-xs font-bold text-[#FFC21A] uppercase">Nutrition Protocol</span>
                <h3 className="text-xl font-bold text-[#F5F5F5]">
                  Assign Diet to {selectedMember.user?.fullName}
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-[#888] hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleDietSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Protocol Title *</label>
                <input
                  type="text"
                  required
                  value={dietTitle}
                  onChange={(e) => setDietTitle(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-[#888] uppercase mb-1">Calories</label>
                  <input
                    type="number"
                    required
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-2 py-2 text-xs font-mono text-[#F5F5F5] focus:border-[#FFC21A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#888] uppercase mb-1">Protein (g)</label>
                  <input
                    type="number"
                    required
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-2 py-2 text-xs font-mono text-[#F5F5F5] focus:border-[#FFC21A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#888] uppercase mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    required
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-2 py-2 text-xs font-mono text-[#F5F5F5] focus:border-[#FFC21A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#888] uppercase mb-1">Fats (g)</label>
                  <input
                    type="number"
                    required
                    value={fats}
                    onChange={(e) => setFats(e.target.value)}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-2 py-2 text-xs font-mono text-[#F5F5F5] focus:border-[#FFC21A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Coaching Guidelines</label>
                <textarea
                  rows={2}
                  value={guidelines}
                  onChange={(e) => setGuidelines(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#888] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingDiet}
                  className="px-6 py-2 rounded-xl bg-[#FFC21A] text-black font-bold text-xs hover:bg-[#e5ad16] transition disabled:opacity-50"
                >
                  {isCreatingDiet ? 'Saving...' : 'Deploy Diet Protocol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
