import React, { useState } from 'react';
import { useMyWorkout, useTodayWorkout, useGenerateWorkout, useEquipmentList } from '@/hooks/useFitness';
import {
  Dumbbell,
  Clock,
  Flame,
  CheckCircle,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Layers,
} from 'lucide-react';
import clsx from 'clsx';

export const MyWorkouts: React.FC = () => {
  const { data: workout, isLoading } = useMyWorkout();
  const { data: todaySession } = useTodayWorkout();
  const { data: equipmentList = [] } = useEquipmentList();
  const generateMutation = useGenerateWorkout();

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isSwitchProtocolOpen, setIsSwitchProtocolOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<'MUSCLE_GAIN' | 'WEIGHT_LOSS' | 'STRENGTH' | 'ENDURANCE' | 'GENERAL_FITNESS'>('MUSCLE_GAIN');

  const days = workout?.days || [];
  const currentDay = days[selectedDayIndex] || days[0];
  const todayDayNumber = todaySession?.today?.dayNumber;

  const handleRegenerate = async (goal: any) => {
    try {
      await generateMutation.mutateAsync({ goalType: goal });
      setIsSwitchProtocolOpen(false);
    } catch {
      // Handled by toast
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-40 bg-[#111111] rounded-3xl border border-[#292929] animate-pulse" />
        <div className="h-96 bg-[#111111] rounded-3xl border border-[#292929] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Regimen Banner */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#FFC21A] uppercase tracking-wider mb-2">
            <Dumbbell className="w-4 h-4 stroke-[2.5]" />
            <span>Assigned Personalized Protocol</span>
          </div>
          <h1 className="text-3xl font-black text-[#F5F5F5] uppercase">
            {workout?.title || 'Personalized 7-Day Workout Split'}
          </h1>
          <p className="text-sm text-[#A5A5A5] mt-1 max-w-2xl leading-relaxed">
            {workout?.description || 'Engineered by RV Fitness coaching system with real-time station capacity awareness.'}
          </p>
        </div>

        <button
          onClick={() => setIsSwitchProtocolOpen(!isSwitchProtocolOpen)}
          className="px-5 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] hover:border-[#FFC21A] text-[#F5F5F5] font-bold text-xs uppercase tracking-wider transition flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-[#FFC21A]" />
          <span>Switch Target Protocol</span>
        </button>
      </div>

      {/* Switch Protocol Drawer */}
      {isSwitchProtocolOpen && (
        <div className="bg-[#141414] p-6 rounded-3xl border border-[#FFC21A]/40 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#FFC21A]" />
              <span>Select Gym Training Goal</span>
            </h3>
            <span className="text-xs text-[#888]">Re-synthesizes full 7-day schedule</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'MUSCLE_GAIN', title: 'Muscle Gain / Hypertrophy', desc: 'Push-Pull-Legs 6-day split with volume' },
              { key: 'WEIGHT_LOSS', title: 'Fat Loss & Conditioning', desc: 'Metabolic circuits, HIIT, core & cardio' },
              { key: 'STRENGTH', title: 'Strength & Powerbuilding', desc: 'Barbell compound lifts & power' },
            ].map((item) => (
              <button
                key={item.key}
                disabled={generateMutation.isPending}
                onClick={() => handleRegenerate(item.key)}
                className="p-4 rounded-2xl bg-[#171717] border border-[#292929] hover:border-[#FFC21A] text-left transition group cursor-pointer"
              >
                <span className="text-sm font-bold text-white group-hover:text-[#FFC21A] transition block">
                  {item.title}
                </span>
                <span className="text-xs text-[#888] mt-1 block">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Days Tabs (Monday to Sunday) */}
      {days.length > 0 ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2.5">
            {days.map((day: any, idx: number) => {
              const isSelected = selectedDayIndex === idx;
              const isToday = day.dayNumber === todayDayNumber;
              return (
                <button
                  key={day.id}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={clsx(
                    'px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition flex items-center space-x-2 border cursor-pointer',
                    isSelected
                      ? 'bg-[#FFC21A] text-black border-[#FFC21A] shadow-md shadow-[#FFC21A]/20'
                      : 'bg-[#111111] text-[#A5A5A5] hover:text-[#F5F5F5] border-[#292929]',
                    isToday && !isSelected && 'border-[#FFC21A]/50 text-white'
                  )}
                >
                  <span>Day {day.dayNumber}</span>
                  {isToday && (
                    <span className={clsx(
                      'text-[9px] font-mono px-1.5 py-0.5 rounded font-black',
                      isSelected ? 'bg-black text-[#FFC21A]' : 'bg-[#FFC21A] text-black'
                    )}>
                      TODAY
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Day Exercises Card */}
          <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#222222] gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#888888] uppercase">
                    Day {currentDay?.dayNumber} Routine
                  </span>
                  {currentDay?.dayNumber === todayDayNumber && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#FFC21A]/20 text-[#FFC21A] font-bold">
                      ACTIVE TODAY IN ASIA/KOLKATA
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-[#F5F5F5] uppercase mt-1">
                  {currentDay?.dayTitle}
                </h2>
              </div>

              {currentDay?.restDay ? (
                <span className="px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold font-mono">
                  REST & RECOVERY
                </span>
              ) : (
                <span className="px-3.5 py-1.5 rounded-full bg-[#171717] border border-[#333] text-xs font-mono text-[#FFC21A] font-bold">
                  {currentDay?.exercises?.length || 0} Exercises
                </span>
              )}
            </div>

            {currentDay?.restDay ? (
              <div className="py-12 text-center text-sm text-[#888] space-y-3">
                <Clock className="w-12 h-12 text-[#FFC21A] mx-auto opacity-70" />
                <p className="font-bold text-[#F5F5F5] text-base">Scheduled Sanctuary Rest & Active Recovery</p>
                <p className="text-xs text-[#A5A5A5] max-w-md mx-auto leading-relaxed">
                  Focus on sleep, muscle fiber regeneration, protein synthesis, and light mobility work.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentDay?.exercises?.map((ex: any, i: number) => {
                  const isMaintenance = ex.requiredEquipment && equipmentList.some(
                    (eq: any) => eq.name.toLowerCase() === ex.requiredEquipment.toLowerCase() && eq.status !== 'OPERATIONAL'
                  );
                  return (
                    <div
                      key={ex.id || i}
                      className={clsx(
                        'p-5 rounded-2xl border transition',
                        isMaintenance ? 'bg-[#1C1710] border-[#FFC21A]/40' : 'bg-[#171717] border-[#292929]'
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 rounded-lg bg-[#222222] border border-[#333] flex items-center justify-center font-mono font-bold text-xs text-[#FFC21A] shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-base font-bold text-[#F5F5F5]">
                                {isMaintenance && ex.alternativeExerciseName ? ex.alternativeExerciseName : ex.exerciseName}
                              </h4>
                              {ex.targetMuscle && (
                                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-[#888888] border border-white/5">
                                  {ex.targetMuscle}
                                </span>
                              )}
                            </div>

                            {ex.requiredEquipment && (
                              <p className="text-xs text-[#888888] mt-1">
                                Designated Station:{' '}
                                <span className="text-[#C5C5C5] font-medium">{ex.requiredEquipment}</span>
                              </p>
                            )}

                            {isMaintenance && ex.alternativeExerciseName && (
                              <div className="mt-2 text-xs text-[#FFC21A] flex items-center space-x-1.5 font-medium">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  Station "{ex.requiredEquipment}" is currently in maintenance. Safely substituted with {ex.alternativeExerciseName}.
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-6 text-sm self-end sm:self-auto font-mono">
                          <div className="text-right">
                            <span className="block text-[10px] text-[#888] uppercase">Sets</span>
                            <span className="font-bold text-base text-[#F5F5F5]">{ex.sets}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] text-[#888] uppercase">Reps</span>
                            <span className="font-bold text-base text-[#FFC21A]">{ex.reps}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] text-[#888] uppercase">Rest</span>
                            <span className="font-bold text-sm text-[#CCCCCC]">{ex.restSeconds || 90}s</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#111111] p-12 rounded-3xl border border-[#292929] text-center text-sm text-[#888] space-y-4">
          <Dumbbell className="w-12 h-12 text-[#FFC21A] mx-auto opacity-50" />
          <p className="font-bold text-[#F5F5F5] text-base">No Routine Activated Yet</p>
          <p className="text-xs max-w-sm mx-auto">
            Generate your personalized workout protocol based on your primary goal and gym equipment availability.
          </p>
          <button
            onClick={() => handleRegenerate('MUSCLE_GAIN')}
            className="px-6 py-2.5 rounded-xl bg-[#FFC21A] text-black font-extrabold text-xs uppercase"
          >
            Generate Muscle Gain Protocol
          </button>
        </div>
      )}
    </div>
  );
};
