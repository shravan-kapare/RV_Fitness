import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Target, Shield, Users, Trophy, Award, MapPin, ArrowRight, Check, Sparkles } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-0 pb-0 overflow-x-hidden">
      {/* =========================================================================
          HERO: CINEMATIC ETHOS HEADER
          ========================================================================= */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-[#0A0A0A] text-[#F5F5F5] border-b border-[#222222]">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center brightness-[0.35]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=2000&auto=format&fit=crop')`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/95 via-[#080808]/75 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/40 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#161616]/85 border border-white/10 backdrop-blur-md">
              <MapPin className="w-3.5 h-3.5 text-[#FFC21A]" />
              <span className="text-xs font-semibold tracking-wider text-[#D4D4D4] uppercase font-mono">
                Narsobawadi, Maharashtra • Est. 2024
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
              BUILT FOR REAL <span className="text-[#FFC21A]">STRENGTH</span>. <br />
              POWERED BY PURPOSE.
            </h1>

            <p className="text-base sm:text-lg text-[#CCCCCC] leading-relaxed">
              RV Fitness was founded to bring world-class biomechanical training, tournament-grade Olympic iron, and dedicated coaching to Narsobawadi. No gimmicks, no commercial fluff—just honest progress.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/memberships"
                className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-[#FFC21A] hover:bg-[#e5ad16] text-black font-extrabold text-sm shadow-lg shadow-[#FFC21A]/20 transition transform hover:-translate-y-0.5"
              >
                <span>View Membership Tiers</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <Link
                to="/facilities"
                className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-[#171717]/85 hover:bg-[#242424] border border-white/15 text-[#F5F5F5] font-semibold text-sm transition backdrop-blur-md"
              >
                <span>Tour Our Floor</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: THE NARSOBAWADI DIRECTIVE (Warm Editorial Light #F5F4F0)
          ========================================================================= */}
      <section className="bg-[#F5F4F0] text-[#171717] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E5E4E0]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Authentic Photography Composition */}
            <div className="lg:col-span-5">
              <ScrollReveal direction="left">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#E0DED9] group">
                  <img
                    src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1000&auto=format&fit=crop"
                    alt="RV Fitness calibrated strength floor"
                    className="w-full h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p className="text-xs uppercase tracking-widest text-[#FFC21A] font-mono font-bold mb-1">
                      Our Physical Standard
                    </p>
                    <p className="text-lg font-black tracking-tight leading-snug">
                      "Strength is not an accident of genetics—it is forged under progressive resistance and daily consistency."
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right: Narrative & Origin */}
            <div className="lg:col-span-7 space-y-6">
              <ScrollReveal direction="right">
                <span className="text-xs font-bold text-[#B45309] tracking-widest uppercase mb-2 block font-mono">
                  The RV Fitness Story
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase leading-tight text-[#171717]">
                  Why We Built RV Fitness in Narsobawadi
                </h2>
                <p className="text-base text-[#525252] leading-relaxed">
                  For years, fitness seekers in Shirol and Narsobawadi had to choose between crowded casual gyms with worn-out cable machines, or travel long distances to Kolhapur for authentic strength equipment.
                </p>
                <p className="text-sm sm:text-base text-[#666666] leading-relaxed">
                  We engineered RV Fitness to change that. Located near Datta Mandir road, our 10,000+ sq ft facility combines tournament-grade Olympic power racks, calibrated rubber bumper plates, commercial hex dumbbells, and automated turnstile access with certified mentors who coach form integrity on every lift.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E5E4E0]">
                  <div className="bg-white p-5 rounded-2xl border border-[#E5E4E0] shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#171717] flex items-center justify-center text-[#FFC21A] mb-3">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black uppercase text-[#171717]">Olympic Standard</h4>
                    <p className="text-xs text-[#666666] mt-1 leading-normal">
                      Full power cages and IPF/IWF-calibrated competition steel.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#E5E4E0] shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#171717] flex items-center justify-center text-[#FFC21A] mb-3">
                      <Award className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black uppercase text-[#171717]">K11 Mentorship</h4>
                    <p className="text-xs text-[#666666] mt-1 leading-normal">
                      Certified fitness architects and sports nutrition specialists.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#E5E4E0] shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#171717] flex items-center justify-center text-[#FFC21A] mb-3">
                      <Target className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black uppercase text-[#171717]">Progress Tracking</h4>
                    <p className="text-xs text-[#666666] mt-1 leading-normal">
                      Turnstile QR check-in and monthly body composition audits.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: FACILITY STANDARDS (Technical Charcoal #0D0D10)
          ========================================================================= */}
      <section className="bg-[#0D0D10] text-[#F5F5F5] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#222222]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-[#FFC21A] tracking-widest uppercase mb-2 block">
              Facility Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F5F5]">
              Engineered Without Compromise
            </h2>
            <p className="text-[#A5A5A5] mt-3 text-sm sm:text-base">
              Every square foot of RV Fitness is designed around biomechanical efficiency, athlete safety, and acoustic comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#141418] p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1C1C22] flex items-center justify-center text-[#FFC21A]">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase">Olympic Lifting Platforms</h3>
              <p className="text-xs text-[#A5A5A5] leading-relaxed">
                High-density rubber shock pads built to absorb 300+ kg drops safely with zero bounce distortion.
              </p>
            </div>

            <div className="bg-[#141418] p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1C1C22] flex items-center justify-center text-[#FFC21A]">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase">Linear Isolation Axis</h3>
              <p className="text-xs text-[#A5A5A5] leading-relaxed">
                Plate-loaded leg presses, convergent chest presses, and dual cable crossovers preserving joint alignment.
              </p>
            </div>

            <div className="bg-[#141418] p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1C1C22] flex items-center justify-center text-[#FFC21A]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase">Turnstile QR Check-in</h3>
              <p className="text-xs text-[#A5A5A5] leading-relaxed">
                Contactless digital member cards for frictionless access and automated attendance accountability.
              </p>
            </div>

            <div className="bg-[#141418] p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1C1C22] flex items-center justify-center text-[#FFC21A]">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase">Dedicated Coaching</h3>
              <p className="text-xs text-[#A5A5A5] leading-relaxed">
                Floor trainers available at every session to check form, adjust posture, and ensure progressive overload.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: GRAND CTA BANNER
          ========================================================================= */}
      <section className="bg-[#080808] text-[#F5F5F5] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#171717] via-[#141414] to-[#171717] border border-white/10 p-8 sm:p-14 rounded-3xl text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-[#FFC21A]/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <span className="text-xs font-mono font-bold text-[#FFC21A] uppercase tracking-widest block">
              Start Your Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Ready to Train with Purpose?
            </h2>
            <p className="text-sm text-[#A5A5A5] leading-relaxed">
              Step onto Narsobawadi's premier athletic floor. No contracts, zero hidden fees, and certified coaching included.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/memberships"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FFC21A] text-black font-extrabold hover:bg-[#e5ad16] transition shadow-lg shadow-[#FFC21A]/20"
              >
                Explore Memberships
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#222222] border border-[#333] text-[#F5F5F5] font-semibold hover:bg-[#2a2a2a] transition"
              >
                Schedule A Visit
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
