import React from 'react';
import { usePublicTrainers } from '@/hooks/usePublic';
import { Award, Star, Mail, Phone, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export const TrainersPage: React.FC = () => {
  const { data: trainers = [], isLoading } = usePublicTrainers();

  return (
    <div className="py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#FFC21A] tracking-widest uppercase mb-2 block">
          Certified Fitness Mentors
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#F5F5F5] uppercase tracking-tight">
          Our Training Faculty
        </h1>
        <p className="text-base text-[#A5A5A5] mt-4 leading-relaxed">
          Knowledge is the foundation of physical excellence. Our certified strength coaches, nutrition specialists, and functional trainers are committed to your safe, steady progression.
        </p>
      </div>

      {/* Trainers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="h-96 bg-[#111111] rounded-3xl border border-[#292929] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map((t: any, idx: number) => (
            <ScrollReveal key={t.id} direction="up" delay={idx * 0.1}>
              <div
                className="bg-[#111111] rounded-3xl border border-white/10 overflow-hidden hover:border-[#FFC21A]/50 transition flex flex-col justify-between h-full"
              >
              <div>
                <div className="h-72 bg-[#171717] relative flex items-center justify-center overflow-hidden">
                  {t.photoUrl ? (
                    <img
                      src={t.photoUrl}
                      alt={t.user?.fullName}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-[#222222] flex items-center justify-center text-4xl font-black text-[#FFC21A]">
                      {t.user?.fullName?.charAt(0) || 'T'}
                    </div>
                  )}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#333] flex items-center space-x-1 text-xs font-bold text-[#FFC21A]">
                    <Star className="w-3.5 h-3.5 fill-[#FFC21A]" />
                    <span>{Number(t.rating).toFixed(1)}</span>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <h3 className="text-2xl font-bold text-[#F5F5F5]">{t.user?.fullName}</h3>
                  <p className="text-xs font-semibold text-[#FFC21A] uppercase tracking-wider mt-1 mb-4">
                    {t.specialization}
                  </p>
                  <p className="text-sm text-[#A5A5A5] leading-relaxed mb-6">
                    {t.bio || 'Professional trainer guiding athletic development and sustainable lifestyle transformation.'}
                  </p>

                  <div className="space-y-2 pt-4 border-t border-[#222222] text-xs text-[#888888]">
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-[#FFC21A] shrink-0" />
                      <span>{t.certifications || 'Certified Strength Coach (NSCA / K11 Equivalent)'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-[#FFC21A] shrink-0" />
                      <span>{t.experienceYears} Years Active Floor Experience</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-0">
                <Link
                  to={`/contact?trainer=${encodeURIComponent(t.user?.fullName || '')}`}
                  className="w-full block text-center py-3 rounded-xl bg-[#171717] hover:bg-[#222222] border border-[#292929] text-[#F5F5F5] font-semibold text-xs transition"
                >
                  Schedule Personal Training Assessment
                </Link>
              </div>
            </div>
          </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
};
