import React from 'react';
import { usePublicEvents } from '@/hooks/usePublic';
import { Calendar, MapPin, Trophy, Users, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export const EventsPage: React.FC = () => {
  const { data: events = [], isLoading } = usePublicEvents();

  return (
    <div className="space-y-0 pb-0 overflow-x-hidden">
      {/* =========================================================================
          HERO: COMMUNITY EVENTS & WORKSHOPS
          ========================================================================= */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-[#0A0A0A] text-[#F5F5F5] border-b border-[#222222]">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center brightness-[0.3]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=2000&auto=format&fit=crop')`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/95 via-[#080808]/75 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/40 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#161616]/85 border border-white/10 backdrop-blur-md">
              <Trophy className="w-3.5 h-3.5 text-[#FFC21A]" />
              <span className="text-xs font-semibold tracking-wider text-[#D4D4D4] uppercase font-mono">
                Community Competitions & Seminars
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
              GYM <span className="text-[#FFC21A]">EVENTS</span> & CHALLENGES.
            </h1>

            <p className="text-base sm:text-lg text-[#CCCCCC] leading-relaxed">
              Test your maximum strength, learn injury prevention biomechanics, and compete in powerlifting and conditioning challenges hosted regularly at RV Fitness.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: EVENTS ROSTER (Dark Charcoal #0D0D10)
          ========================================================================= */}
      <section className="bg-[#0D0D10] text-[#F5F5F5] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#222222]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold text-[#FFC21A] tracking-widest uppercase mb-1 block">
              Upcoming Schedule
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Scheduled Competitions
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 bg-[#141418] rounded-3xl border border-white/10 animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 bg-[#141418] rounded-3xl border border-white/10 max-w-2xl mx-auto shadow-xl">
              <Trophy className="w-12 h-12 text-[#FFC21A] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white uppercase">No Scheduled Events Right Now</h3>
              <p className="text-xs text-[#9CA3AF] mt-2 max-w-md mx-auto">
                Check back soon or ask at the front desk for upcoming bench press meets, deadlift challenges, and nutrition workshops!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((ev: any, idx: number) => (
                <ScrollReveal key={ev.id} direction="up" delay={idx * 0.1}>
                  <div className="bg-[#141418] p-6 sm:p-8 rounded-3xl border border-white/10 hover:border-[#FFC21A]/50 transition duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#FFC21A] font-mono">
                        <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#1C1C24] border border-white/10">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(ev.eventDate).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </span>
                        <span className="flex items-center space-x-1.5 text-[#9CA3AF] px-3 py-1 rounded-full bg-[#1C1C24] border border-white/10">
                          <MapPin className="w-3.5 h-3.5 text-[#FFC21A]" />
                          <span>{ev.location}</span>
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                        {ev.title}
                      </h3>
                      <p className="text-sm text-[#A5A5A5] leading-relaxed max-w-2xl">
                        {ev.description}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <Link
                        to="/contact"
                        className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-[#FFC21A] text-black font-extrabold text-sm hover:bg-[#e5ad16] transition shadow-md shadow-[#FFC21A]/10"
                      >
                        <span>Register At Desk</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
