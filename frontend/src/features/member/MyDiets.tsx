import React from 'react';
import { useMyDiet } from '@/hooks/useFitness';
import { Apple, Flame, Utensils, Info } from 'lucide-react';

export const MyDiets: React.FC = () => {
  const { data: diet, isLoading } = useMyDiet();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-40 bg-[#111111] rounded-3xl border border-[#292929] animate-pulse" />
        <div className="h-96 bg-[#111111] rounded-3xl border border-[#292929] animate-pulse" />
      </div>
    );
  }

  const meals = diet?.meals || [];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929]">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#FFC21A] uppercase tracking-wider mb-2">
          <Apple className="w-4 h-4" />
          <span>Diet & Nutrition</span>
        </div>
        <h1 className="text-3xl font-black text-[#F5F5F5] uppercase">
          {diet?.title || 'Personalized Nutrition Protocol'}
        </h1>
        <p className="text-sm text-[#A5A5A5] mt-1">
          Customized macronutrient distribution designed to fuel intense performance and optimize muscle recovery.
        </p>
      </div>

      {/* Daily Macro Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-[#111111] p-6 rounded-2xl border border-[#292929] text-center">
          <span className="text-[11px] font-semibold text-[#888] uppercase">Target Energy</span>
          <p className="text-3xl font-black font-mono tabular-nums text-[#FFC21A] mt-1">
            {diet?.dailyCalories || 2400}
          </p>
          <span className="text-[10px] text-[#888] font-mono">kcal / day</span>
        </div>

        <div className="bg-[#111111] p-6 rounded-2xl border border-[#292929] text-center">
          <span className="text-[11px] font-semibold text-[#888] uppercase">Protein</span>
          <p className="text-3xl font-black font-mono tabular-nums text-[#F5F5F5] mt-1">
            {diet?.proteinGrams || 160}g
          </p>
          <span className="text-[10px] text-emerald-400 font-mono">Build & Repair</span>
        </div>

        <div className="bg-[#111111] p-6 rounded-2xl border border-[#292929] text-center">
          <span className="text-[11px] font-semibold text-[#888] uppercase">Carbohydrates</span>
          <p className="text-3xl font-black font-mono tabular-nums text-[#F5F5F5] mt-1">
            {diet?.carbsGrams || 260}g
          </p>
          <span className="text-[10px] text-amber-400 font-mono">Glycogen Energy</span>
        </div>

        <div className="bg-[#111111] p-6 rounded-2xl border border-[#292929] text-center">
          <span className="text-[11px] font-semibold text-[#888] uppercase">Healthy Fats</span>
          <p className="text-3xl font-black font-mono tabular-nums text-[#F5F5F5] mt-1">
            {diet?.fatsGrams || 65}g
          </p>
          <span className="text-[10px] text-blue-400 font-mono">Hormone Health</span>
        </div>
      </div>

      {/* Guidelines Note */}
      {diet?.guidelines && (
        <div className="bg-[#171717] p-5 rounded-2xl border border-[#292929] flex items-start space-x-3 text-xs text-[#CCCCCC]">
          <Info className="w-5 h-5 text-[#FFC21A] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#F5F5F5] block mb-1">Coach Guidelines:</strong>
            <p className="leading-relaxed">{diet.guidelines}</p>
          </div>
        </div>
      )}

      {/* Scheduled Meals */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] space-y-6">
        <h2 className="text-xl font-bold text-[#F5F5F5] uppercase border-l-2 border-[#FFC21A] pl-3">
          Daily Meal Schedule
        </h2>

        {meals.length > 0 ? (
          <div className="space-y-4">
            {meals.map((meal: any, idx: number) => (
              <div
                key={meal.id || idx}
                className="bg-[#171717] p-5 rounded-2xl border border-[#292929] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-lg bg-[#222222] border border-[#333] flex items-center justify-center font-mono font-bold text-xs text-[#FFC21A] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#F5F5F5]">{meal.mealName}</h3>
                    <p className="text-sm text-[#A5A5A5] mt-1 whitespace-pre-line leading-relaxed">
                      {meal.foodItems}
                    </p>
                  </div>
                </div>

                {meal.calories && (
                  <div className="sm:text-right shrink-0">
                    <span className="block text-[10px] text-[#888] uppercase font-mono">Estimate</span>
                    <span className="text-sm font-bold font-mono text-[#FFC21A]">
                      ~{meal.calories} kcal
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#888]">
            <Utensils className="w-8 h-8 text-[#FFC21A] mx-auto mb-2 opacity-50" />
            <p>No meals populated yet. Target macro goals are active above.</p>
          </div>
        )}
      </div>
    </div>
  );
};
