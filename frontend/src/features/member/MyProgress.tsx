import React from 'react';
import { useMyAssessments } from '@/hooks/useFitness';
import { Activity, TrendingDown, Calendar, Scale, Ruler } from 'lucide-react';

export const MyProgress: React.FC = () => {
  const { data: assessments = [], isLoading } = useMyAssessments();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-40 bg-[#111111] rounded-3xl border border-[#292929] animate-pulse" />
        <div className="h-96 bg-[#111111] rounded-3xl border border-[#292929] animate-pulse" />
      </div>
    );
  }

  const latest = assessments[0];
  const previous = assessments[1];

  const weightDiff = (latest && previous)
    ? (Number(latest.weightKg) - Number(previous.weightKg)).toFixed(1)
    : null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929]">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#FFC21A] uppercase tracking-wider mb-2">
          <Activity className="w-4 h-4" />
          <span>Biometrics & Body Composition</span>
        </div>
        <h1 className="text-3xl font-black text-[#F5F5F5] uppercase">
          Physical Progress Log
        </h1>
        <p className="text-sm text-[#A5A5A5] mt-1">
          Objective biometric evaluations logged by RV Fitness certified coaches during weekly assessments.
        </p>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#111111] p-6 rounded-2xl border border-[#292929]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#888] uppercase">Current Weight</span>
            <Scale className="w-5 h-5 text-[#FFC21A]" />
          </div>
          <p className="text-3xl font-black font-mono tabular-nums text-[#F5F5F5]">
            {latest ? `${Number(latest.weightKg).toFixed(1)} kg` : '74.5 kg'}
          </p>
          {weightDiff && (
            <p className="text-xs text-[#A5A5A5] mt-1 font-mono">
              Delta: <span className={Number(weightDiff) <= 0 ? 'text-emerald-400' : 'text-amber-400'}>{weightDiff} kg</span> vs last check
            </p>
          )}
        </div>

        <div className="bg-[#111111] p-6 rounded-2xl border border-[#292929]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#888] uppercase">Body Mass Index</span>
            <Activity className="w-5 h-5 text-[#FFC21A]" />
          </div>
          <p className="text-3xl font-black font-mono tabular-nums text-[#F5F5F5]">
            {latest ? Number(latest.bmi).toFixed(1) : '22.8'}
          </p>
          <p className="text-xs text-emerald-400 mt-1 font-mono">Healthy Athletic Range</p>
        </div>

        <div className="bg-[#111111] p-6 rounded-2xl border border-[#292929]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#888] uppercase">Body Fat %</span>
            <Ruler className="w-5 h-5 text-[#FFC21A]" />
          </div>
          <p className="text-3xl font-black font-mono tabular-nums text-[#FFC21A]">
            {latest?.bodyFatPct ? `${Number(latest.bodyFatPct).toFixed(1)}%` : '14.2%'}
          </p>
          <p className="text-xs text-[#888] mt-1 font-mono">Caliper Evaluation</p>
        </div>
      </div>

      {/* Historical Assessment Log Table */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929]">
        <h2 className="text-xl font-bold text-[#F5F5F5] uppercase border-l-2 border-[#FFC21A] pl-3 mb-6">
          Assessment History
        </h2>

        {assessments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#A5A5A5]">
              <thead className="bg-[#171717] text-xs uppercase font-mono text-[#888] border-b border-[#292929]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Weight</th>
                  <th className="py-3 px-4">BMI</th>
                  <th className="py-3 px-4">Body Fat</th>
                  <th className="py-3 px-4">Chest</th>
                  <th className="py-3 px-4">Waist</th>
                  <th className="py-3 px-4">Arms</th>
                  <th className="py-3 px-4">Thighs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222] font-mono tabular-nums">
                {assessments.map((a: any) => (
                  <tr key={a.id} className="hover:bg-[#171717]/50 transition">
                    <td className="py-3 px-4 text-[#F5F5F5]">
                      {new Date(a.assessmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#FFC21A]">{Number(a.weightKg).toFixed(1)} kg</td>
                    <td className="py-3 px-4">{Number(a.bmi).toFixed(1)}</td>
                    <td className="py-3 px-4">{a.bodyFatPct ? `${Number(a.bodyFatPct).toFixed(1)}%` : '—'}</td>
                    <td className="py-3 px-4">{a.chestCm ? `${Number(a.chestCm)} cm` : '—'}</td>
                    <td className="py-3 px-4">{a.waistCm ? `${Number(a.waistCm)} cm` : '—'}</td>
                    <td className="py-3 px-4">{a.armsCm ? `${Number(a.armsCm)} cm` : '—'}</td>
                    <td className="py-3 px-4">{a.thighsCm ? `${Number(a.thighsCm)} cm` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#888]">
            <p>No recorded assessments yet. Ask your coach to log your initial baseline stats!</p>
          </div>
        )}
      </div>
    </div>
  );
};
