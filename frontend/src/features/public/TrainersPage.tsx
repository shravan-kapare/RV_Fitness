import React from 'react';
import { usePublicTrainers } from '@/hooks/usePublic';
import { Award, Star, Mail, Phone, Calendar, ArrowRight, ShieldCheck, Dumbbell, MapPin, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export const TrainersPage: React.FC = () => {
  const { data: trainers = [], isLoading } = usePublicTrainers();

  return (
    <div className="space-y-0 pb-0 overflow-x-hidden">
      {/* =========================================================================
          HERO: CERTIFIED STRENGTH FACULTY
          ========================================================================= */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-[#0A0A0A] text-[#F5F5F5] border-b border-[#222222]">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center brightness-[0.3]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop')`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/95 via-[#080808]/75 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/40 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#161616]/85 border border-white/10 backdrop-blur-md">
              <MapPin className="w-3.5 h-3.5 text-[#FFC21A]" />
              <span className="text-xs font-semibold tracking-wider text-[#D4D4D4] uppercase font-mono">
                Certified Mentorship • Narsobawadi
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
              OUR SPECIALIST <span className="text-[#FFC21A]">COACHES</span>.
            </h1>

            <p className="text-base sm:text-lg text-[#CCCCCC] leading-relaxed">
              Knowledge is the foundation of physical longevity. Our certified fitness architects, strength coaches, and sports nutritionists are on the gym floor every day to guide your progress.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: CERTIFIED COACHES ROSTER (Dark Charcoal #0D0D10)
          ========================================================================= */}
      <section className="bg-[#0D0D10] text-[#F5F5F5] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#222222]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-[#FFC21A] tracking-widest uppercase mb-2 block">
              Accredited Mentors
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Meet Our Training Faculty
            </h2>
            <p className="text-sm text-[#A5A5A5] mt-2">
              Every trainer on our staff holds verified certifications in biomechanics, sports nutrition, and emergency first response.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="h-96 bg-[#141418] rounded-3xl border border-white/10 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trainers.map((t: any, idx: number) => (
                <ScrollReveal key={t.id} direction="up" delay={idx * 0.1}>
                  <div className="bg-[#141418] rounded-3xl border border-white/10 overflow-hidden hover:border-[#FFC21A]/50 transition duration-300 flex flex-col justify-between h-full shadow-xl group">
                    <div>
                      {/* Coach Photography */}
                      <div className="h-72 bg-[#1A1A22] relative flex items-center justify-center overflow-hidden">
                        {t.photoUrl ? (
                          <img
                            src={t.photoUrl}
                            alt={t.user?.fullName}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-[#22222A] flex items-center justify-center text-4xl font-black text-[#FFC21A]">
                            {t.user?.fullName?.charAt(0) || 'C'}
                          </div>
                        )}
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 flex items-center space-x-1 text-xs font-bold text-[#FFC21A]">
                          <Star className="w-3.5 h-3.5 fill-[#FFC21A]" />
                          <span>{Number(t.rating).toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Coach Info */}
                      <div className="p-6 sm:p-8 space-y-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white">{t.user?.fullName}</h3>
                          <p className="text-xs font-mono font-bold text-[#FFC21A] uppercase tracking-wider mt-1">
                            {t.specialization}
                          </p>
                        </div>

                        <p className="text-xs sm:text-sm text-[#A5A5A5] leading-relaxed line-clamp-3">
                          {t.bio || 'Dedicated strength coach guiding personal body transformations with injury-free biomechanics.'}
                        </p>

                        {/* Certifications Badge */}
                        <div className="pt-2 border-t border-white/10">
                          <span className="text-[10px] font-mono font-bold text-[#888892] uppercase tracking-wider block mb-1">
                            Verified Certifications:
                          </span>
                          <p className="text-xs font-medium text-[#E5E5E5]">
                            {t.certifications || 'K11 Master Trainer, CPR/AED Certified, Sports Nutritionist'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 pt-0 border-t border-white/10 flex items-center justify-between text-xs text-[#9CA3AF]">
                      <span>Experience: <strong className="text-white font-mono">{t.experienceYears} Years</strong></span>
                      <Link
                        to="/contact"
                        className="inline-flex items-center space-x-1 text-[#FFC21A] font-bold hover:underline"
                      >
                        <span>Schedule Consult</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: COACHING ETHOS (Warm Editorial Light #F5F4F0)
          ========================================================================= */}
      <section className="bg-[#F5F4F0] text-[#171717] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E5E4E0]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#B45309] tracking-widest uppercase mb-2 block font-mono">
              The Coaching Standard
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#171717]">
              How Our Trainers Coach
            </h2>
            <p className="text-sm text-[#525252] mt-2">
              We do not count reps or look at phones. We coach bar path, breathing cadence, and biomechanical posture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E5E4E0] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#171717] flex items-center justify-center text-[#FFC21A]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black uppercase text-[#171717]">Joint Safety First</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Prioritizing spinal alignment, ankle mobility, and rotator cuff stability before progressive loading begins.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E5E4E0] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#171717] flex items-center justify-center text-[#FFC21A]">
                <Dumbbell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black uppercase text-[#171717]">Scientific Overload</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Periodized training blocks designed to systematically increase strength and hypertrophy over 8 to 16 week cycles.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E5E4E0] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#171717] flex items-center justify-center text-[#FFC21A]">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black uppercase text-[#171717]">Nutritional Tracking</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Direct macronutrient targets, hydration strategies, and recovery plans configured right into your member dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: CTA
          ========================================================================= */}
      <section className="bg-[#080808] text-[#F5F5F5] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Work Directly With A Certified Coach
          </h2>
          <p className="text-sm text-[#A5A5A5] max-w-xl mx-auto">
            Book an assessment session with Vikram Salunkhe or any of our senior trainers in Narsobawadi.
          </p>
          <div className="flex justify-center pt-2">
            <Link
              to="/contact"
              className="px-8 py-3.5 rounded-xl bg-[#FFC21A] text-black font-extrabold hover:bg-[#e5ad16] transition shadow-lg shadow-[#FFC21A]/20 text-sm"
            >
              Book An Assessment
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
