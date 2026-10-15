import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  Check,
  ArrowRight,
  ShieldCheck,
  Calendar,
  ChevronRight,
  MapPin,
  Target,
  Zap,
  Award,
  Sparkles,
  Activity,
  Clock,
  Shield,
  Flame,
} from 'lucide-react';
import { usePublicHome } from '@/hooks/usePublic';
import { formatCurrency } from '@/lib/formatters';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export const HomePage: React.FC = () => {
  const { data, isLoading } = usePublicHome();

  const plans = data?.plans || [];
  const trainers = data?.trainers || [];
  const events = data?.events || [];
  const gallery = data?.gallery || [];
  const settings = data?.settings || {};

  const heroHeadlineLine1 = settings.hero_headline_line1 || 'YOUR';
  const heroHeadlineAccent = settings.hero_headline_accent || 'STRENGTH.';
  const heroHeadlineLine2 = settings.hero_headline_line2 || 'YOUR JOURNEY.';
  const heroTagline = settings.hero_tagline || 'Train with purpose, work with expert guidance, and make progress at RV Fitness, Narsobawadi.';
  const heroBgImage = settings.hero_bg_image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop';
  const heroCtaPrimary = settings.hero_cta_primary || 'Explore Memberships';
  const heroCtaSecondary = settings.hero_cta_secondary || 'Discover Our Gym';

  // Parallax scroll state for cinematic background
  const [scrollY, setScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    if (mediaQuery.matches) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Photography-led facility zones
  const facilityZones = [
    {
      title: 'Olympic Squat Racks & Platforms',
      category: 'Heavy Resistance',
      description: 'Solid 11-gauge steel power cages with safety spotter arms, Olympic deadlift platforms, and competition bars.',
      image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1000&auto=format&fit=crop',
      features: ['4 Full Power Racks', 'Sound-Dampening Platforms', 'IPF-Spec Barbells'],
    },
    {
      title: 'Commercial Dumbbell & Free-Weight Area',
      category: 'Unilateral Training',
      description: 'Full paired sets of anti-roll commercial dumbbells from 2.5 kg to 50 kg with adjustable benches.',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop',
      features: ['2.5 KG to 50 KG Matched Pairs', 'Ergonomic Contoured Grips', 'Multiple Incline Benches'],
    },
    {
      title: 'Dual Cable Machines & Plate-Loaded Axis',
      category: 'Biomechanical Isolation',
      description: 'Precision cable crossovers and biomechanically aligned machines to isolate muscles safely.',
      image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1000&auto=format&fit=crop',
      features: ['Dual Cable Crossovers', 'Plate-Loaded Leg Press', 'Linear Hack Squat'],
    },
    {
      title: 'Cardio Theater & Functional Conditioning',
      category: 'Stamina & Capacity',
      description: 'Commercial incline treadmills, Concept2 rowers, assault bikes, and turf conditioning lanes.',
      image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=1000&auto=format&fit=crop',
      features: ['High-Incline Treadmills', 'Air Assault Bikes', 'Sprint Turf & Sleds'],
    },
  ];

  return (
    <div className="space-y-0 pb-0 overflow-x-hidden">
      {/* =========================================================================
          HERO SECTION: CINEMATIC IMAGE-LED GYM HERO
          Full-bleed wide gym photograph, controlled gradient, asymmetric two-column layout
          ========================================================================= */}
      <section className="relative min-h-[88vh] lg:min-h-[92vh] flex items-center overflow-hidden bg-[#0A0A0A] text-[#F5F5F5] border-b border-[#222222]">
        {/* Full-bleed wide photograph of strength gym floor */}
        <div
          className="absolute inset-0 w-full h-[120%] -top-[10%] bg-cover bg-center transition-transform duration-75 will-change-transform"
          style={{
            backgroundImage: `url('${heroBgImage}')`,
            transform: prefersReducedMotion ? 'none' : `translate3d(0, ${Math.min(scrollY * 0.16, 120)}px, 0)`,
          }}
          aria-hidden="true"
        />

        {/* Controlled dark gradient: strong contrast on left for copy, open visibility of gym on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/92 via-[#080808]/72 to-[#080808]/25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/40 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 pb-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Asymmetrical Typography & CTAs */}
            <div className="lg:col-span-7 xl:col-span-7 text-left space-y-6">
              {/* Location Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#161616]/85 border border-white/10 backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-[#FFC21A]" />
                <span className="text-xs font-semibold tracking-wider text-[#D4D4D4] uppercase font-mono">
                  Narsobawadi, Maharashtra
                </span>
              </div>

              {/* Headline: Clean, Confident, Not Oversized */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white uppercase leading-[1.02]">
                {heroHeadlineLine1} <span className="text-[#FFC21A]">{heroHeadlineAccent}</span> <br />
                {heroHeadlineLine2}
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-[#CCCCCC] max-w-xl leading-relaxed font-normal">
                {heroTagline}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/memberships"
                  className="inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-[#FFC21A] hover:bg-[#e5ad16] text-black font-extrabold text-sm sm:text-base shadow-lg shadow-[#FFC21A]/20 transition transform hover:-translate-y-0.5"
                >
                  <span>{heroCtaPrimary}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
                <a
                  href="#about-intro"
                  className="inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-[#171717]/85 hover:bg-[#242424] border border-white/15 text-[#F5F5F5] font-semibold text-sm sm:text-base transition backdrop-blur-md"
                >
                  <span>{heroCtaSecondary}</span>
                  <ChevronRight className="w-4 h-4 text-[#FFC21A]" />
                </a>
              </div>

              {/* Restrained Credibility Highlights */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-lg">
                <div>
                  <p className="text-2xl sm:text-3xl font-black font-mono text-[#FFC21A]">10,000+</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">Sq Ft Floor Space</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black font-mono text-white">100%</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">Olympic Steel</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black font-mono text-[#FFC21A]">5.0 ★</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">Expert Mentorship</p>
                </div>
              </div>
            </div>

            {/* Right Column: Art-Directed Athlete Training Showcase */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 justify-end">
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-gradient-to-b from-[#181818]/85 to-[#101010]/95 backdrop-blur-md group">
                {/* Athlete Training Photography */}
                <div className="relative h-[380px] xl:h-[420px] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop"
                    alt="Athlete training with barbell at RV Fitness"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-black/25 to-transparent" />

                  {/* Floating status badge */}
                  <div className="absolute top-4 left-4 inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono font-semibold text-[#FFC21A]">
                    <span className="w-2 h-2 rounded-full bg-[#FFC21A] animate-pulse" />
                    <span>Live Training Floor</span>
                  </div>
                </div>

                {/* Information strip */}
                <div className="p-5 text-left space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-[#9CA3AF]">
                    <span>STRENGTH & CONDITIONING</span>
                    <span className="text-[#FFC21A]">EST. 2024</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Olympic Barbell & Progressive Resistance
                  </h3>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    Coach-supervised lifting, calibrated bumper plates, and purpose-built platforms right here in Narsobawadi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: INTRODUCTION TO RV FITNESS (Warm Editorial Light #F5F4F0)
          Clear, genuine narrative explaining the RV Fitness ethos in Narsobawadi
          ========================================================================= */}
      <section id="about-intro" className="bg-[#F5F4F0] text-[#171717] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E5E4E0]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Visual Photography Composition (5 cols) */}
            <div className="lg:col-span-5">
              <ScrollReveal direction="left">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#E0DED9] group">
                  <img
                    src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop"
                    alt="RV Fitness authentic barbell strength training"
                    className="w-full h-[460px] sm:h-[520px] object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  {/* Controlled dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-6 left-6 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[#FFC21A] text-xs font-mono font-bold tracking-wider uppercase">
                    Narsobawadi Ethos • Est. 2024
                  </div>

                  {/* Bottom quote */}
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p className="text-xs uppercase tracking-widest text-[#FFC21A] font-mono font-bold mb-1">
                      No Gimmicks. No Shortcuts.
                    </p>
                    <p className="text-lg font-black tracking-tight leading-snug">
                      "Real physical progress is built on consistency, calibrated iron, and honest guidance."
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Narrative & Ethos (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              <ScrollReveal direction="right">
                <div>
                  <span className="text-xs font-bold text-[#B45309] tracking-widest uppercase mb-2 block font-mono">
                    The RV Fitness Philosophy
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase leading-tight text-[#171717]">
                    Narsobawadi's Dedicated Home for Real Strength
                  </h2>
                </div>

                <p className="text-base sm:text-lg text-[#525252] leading-relaxed">
                  RV Fitness was built to solve a simple problem: local fitness centers were packed with fragile machines, loud gimmicks, and zero genuine coaching. We stripped away the noise and created a purpose-built environment focused entirely on what produces results.
                </p>

                <p className="text-sm sm:text-base text-[#666666] leading-relaxed">
                  Located near Datta Mandir in Narsobawadi, our gym pairs tournament-grade Olympic barbells and calibrated resistance equipment with certified mentors who coach every movement, refine your technique, and build progressive strength tailored to your body.
                </p>

                {/* 3 Core Commitments */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E5E4E0]">
                  <div className="bg-white p-5 rounded-2xl border border-[#E5E4E0] shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#171717] flex items-center justify-center text-[#FFC21A] mb-3">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black uppercase text-[#171717]">Calibrated Iron</h4>
                    <p className="text-xs text-[#666666] mt-1 leading-normal">
                      Full Olympic power racks, high-tensile power bars, and bumper plates.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#E5E4E0] shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#171717] flex items-center justify-center text-[#FFC21A] mb-3">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black uppercase text-[#171717]">Form Integrity</h4>
                    <p className="text-xs text-[#666666] mt-1 leading-normal">
                      Coaching prioritizing joint health, biomechanics, and longevity.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#E5E4E0] shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#171717] flex items-center justify-center text-[#FFC21A] mb-3">
                      <Target className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black uppercase text-[#171717]">Accountability</h4>
                    <p className="text-xs text-[#666666] mt-1 leading-normal">
                      Turnstile attendance and tailored workout plans for real results.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/about"
                    className="inline-flex items-center space-x-2 text-sm font-extrabold text-[#171717] hover:text-[#B45309] transition"
                  >
                    <span>Read Our Full Story & Ethos</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: PHOTOGRAPHY-LED FACILITIES & EQUIPMENT (Technical Charcoal #0D0D10)
          Real-world gym floor zones with photography, specs, and recognizable hardware
          ========================================================================= */}
      <section id="facilities" className="bg-[#0D0D10] text-[#F5F5F5] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#222222]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs font-mono font-bold text-[#FFC21A] tracking-widest uppercase mb-2 block">
                Recognizable Hardware & Facility Zones
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F5F5F5]">
                Engineered for Serious Lifters and Beginners
              </h2>
              <p className="text-[#A5A5A5] mt-2 max-w-xl text-sm sm:text-base">
                Inspect our training zones: tournament squat racks, full dumbbell arrays, cable stations, and cardio equipment.
              </p>
            </div>
            <Link
              to="/facilities"
              className="inline-flex items-center space-x-2 text-sm font-bold text-[#FFC21A] hover:underline group"
            >
              <span>View Full Equipment Inventory</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Varied Photography-Led Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {facilityZones.map((zone, idx) => (
              <ScrollReveal key={zone.title} direction="up" delay={idx * 0.1}>
                <div className="bg-[#141418] rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-full group shadow-lg">
                  {/* Zone Photograph */}
                  <div className="relative h-64 sm:h-72 overflow-hidden">
                    <img
                      src={zone.image}
                      alt={zone.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141418] via-transparent to-black/30" />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-[#FFC21A] uppercase">
                      {zone.category}
                    </span>
                  </div>

                  {/* Zone Details */}
                  <div className="p-6 sm:p-8 flex flex-col justify-between flex-grow">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase mb-2">
                        {zone.title}
                      </h3>
                      <p className="text-sm text-[#A5A5A5] leading-relaxed mb-6">
                        {zone.description}
                      </p>
                    </div>

                    {/* Feature Chips */}
                    <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2">
                      {zone.features.map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-[#1E1E24] text-[#D4D4D4] border border-white/5 font-mono"
                        >
                          <Check className="w-3 h-3 text-[#FFC21A]" />
                          <span>{feat}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: TRAINING PHILOSOPHY & MEMBER BENEFITS (Warm Off-White #FAF9F5)
          Asymmetric varied layout covering Strength, Discipline, Power, Transformation
          ========================================================================= */}
      <section className="bg-[#FAF9F5] text-[#171717] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E5E4E0]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-[#B45309] tracking-widest uppercase mb-2 block font-mono">
                The Four Pillars of Athletic Evolution
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase leading-tight text-[#171717]">
                Forging Complete Physical Capability
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#525252] max-w-md leading-relaxed">
              True strength and physical aesthetic definition do not happen by accident. Every workout at RV Fitness is structured around four foundational pillars.
            </p>
          </div>

          {/* Varied Image-Led Asymmetrical Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
            {/* PILLAR 1: STRENGTH (Hero 7 cols card with dramatic photography) */}
            <div className="lg:col-span-7">
              <ScrollReveal direction="up" delay={0.05}>
                <div className="relative rounded-3xl overflow-hidden shadow-md group h-full min-h-[360px] flex flex-col justify-end p-8 sm:p-10 border border-[#E0DED9]">
                  <img
                    src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop"
                    alt="Pillar 1: Strength - Heavy Olympic barbell deadlift"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

                  <div className="relative z-10 text-white space-y-3">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFC21A] text-black font-mono font-bold text-xs uppercase">
                      <Dumbbell className="w-3.5 h-3.5" />
                      <span>Pillar 01 • Strength</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                      Heavy Resistance & Progressive Overload
                    </h3>
                    <p className="text-sm text-[#D4D4D4] max-w-xl leading-relaxed">
                      Olympic lifting platforms, competition power bars, calibrated rubber bumper plates, and progressive load tracking engineered to forge structural bone density and functional muscle.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* PILLAR 2: DISCIPLINE (5 cols editorial focus card) */}
            <div className="lg:col-span-5">
              <ScrollReveal direction="up" delay={0.12}>
                <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E5E4E0] shadow-sm hover:shadow-md transition group h-full flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-[#171717] flex items-center justify-center text-[#FFC21A] mb-6 group-hover:scale-105 transition-transform">
                      <Target className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#B45309] uppercase tracking-wider">
                      Pillar 02
                    </span>
                    <h3 className="text-2xl font-black text-[#171717] uppercase mt-1 mb-3">
                      Habitual Discipline & Turnstile Streaks
                    </h3>
                    <p className="text-sm text-[#525252] leading-relaxed">
                      Motivation is temporary; discipline is non-negotiable. With automated turnstile check-ins and personalized workout logging, every member builds an unbreakable daily streak.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-[#F0EFEA] flex items-center justify-between text-xs font-semibold text-[#171717]">
                    <span>Turnstile-Logged Streaks</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#B45309]" />
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* PILLAR 3: POWER (5 cols editorial focus card) */}
            <div className="lg:col-span-5">
              <ScrollReveal direction="up" delay={0.18}>
                <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E5E4E0] shadow-sm hover:shadow-md transition group h-full flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-[#171717] flex items-center justify-center text-[#FFC21A] mb-6 group-hover:scale-105 transition-transform">
                      <Zap className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#B45309] uppercase tracking-wider">
                      Pillar 03
                    </span>
                    <h3 className="text-2xl font-black text-[#171717] uppercase mt-1 mb-3">
                      Explosive Power & Metabolic Output
                    </h3>
                    <p className="text-sm text-[#525252] leading-relaxed">
                      Sprint turf lanes, prowler sled pushes, assault bikes, and ballistic kettlebells engineered to elevate VO2 max and produce dynamic athletic speed.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-[#F0EFEA] flex items-center justify-between text-xs font-semibold text-[#171717]">
                    <span>Kinetic Speed & Stamina</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#B45309]" />
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* PILLAR 4: TRANSFORMATION (Hero 7 cols card with athletic photography) */}
            <div className="lg:col-span-7">
              <ScrollReveal direction="up" delay={0.24}>
                <div className="relative rounded-3xl overflow-hidden shadow-md group h-full min-h-[360px] flex flex-col justify-end p-8 sm:p-10 border border-[#E0DED9]">
                  <img
                    src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1000&auto=format&fit=crop"
                    alt="Pillar 4: Transformation - Athletic performance and body composition"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

                  <div className="relative z-10 text-white space-y-3">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFC21A] text-black font-mono font-bold text-xs uppercase">
                      <Award className="w-3.5 h-3.5" />
                      <span>Pillar 04 • Transformation</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                      Biometrics, Nutrition & Lifelong Resilience
                    </h3>
                    <p className="text-sm text-[#D4D4D4] max-w-xl leading-relaxed">
                      Tailored macronutrient targets, weekly body composition assessments, and dedicated mentor check-ins ensure your time in the gym translates into visible aesthetic definition.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Member Benefits Strip */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#E5E4E0] shadow-sm">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-mono font-bold text-[#B45309] uppercase tracking-wider block mb-1">
                Included Member Privileges
              </span>
              <h3 className="text-2xl font-black uppercase text-[#171717]">
                Everything Included with Your RV Fitness Pass
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE8E2]">
                <Clock className="w-6 h-6 text-[#B45309] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#171717]">Turnstile QR</p>
                <p className="text-[11px] text-[#737373] mt-0.5">Quick Desk Check-In</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE8E2]">
                <Dumbbell className="w-6 h-6 text-[#B45309] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#171717]">All Zones</p>
                <p className="text-[11px] text-[#737373] mt-0.5">Free Weights & Turf</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE8E2]">
                <Shield className="w-6 h-6 text-[#B45309] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#171717]">Lockers</p>
                <p className="text-[11px] text-[#737373] mt-0.5">Secure Key Storage</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE8E2]">
                <Activity className="w-6 h-6 text-[#B45309] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#171717]">Cardio Theater</p>
                <p className="text-[11px] text-[#737373] mt-0.5">Treadmills & Rowers</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE8E2]">
                <Target className="w-6 h-6 text-[#B45309] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#171717]">Custom Routine</p>
                <p className="text-[11px] text-[#737373] mt-0.5">Goal-Based Splits</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE8E2]">
                <Sparkles className="w-6 h-6 text-[#B45309] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#171717]">Body Audit</p>
                <p className="text-[11px] text-[#737373] mt-0.5">Monthly BMI & Metrics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: DATABASE-BACKED MEMBERSHIP PLANS (Dark Luxury Obsidian #080808)
          Live dynamic database values: 0 hardcoded prices, 100% synchronized with API
          ========================================================================= */}
      <section className="bg-[#080808] text-[#F5F5F5] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#1F1F1F]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs font-mono font-bold text-[#FFC21A] tracking-widest uppercase mb-2 block">
                Transparent Membership Tiers
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F5F5F5] uppercase tracking-tight">
                Invest In Your Physical Potential
              </h2>
              <p className="text-[#A5A5A5] mt-2 max-w-xl text-sm sm:text-base">
                Zero hidden enrollment charges. Transparent monthly, half-yearly, and annual plans with full locker and coach access.
              </p>
            </div>
            <Link
              to="/memberships"
              className="inline-flex items-center space-x-2 text-sm font-bold text-[#FFC21A] hover:underline group"
            >
              <span>Compare All Tier Benefits</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-[#111111] rounded-3xl border border-[#292929] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {plans.map((plan: any, idx: number) => {
                const isFeatured = idx === 1;

                return (
                  <ScrollReveal key={plan.id} direction="up" delay={idx * 0.12}>
                    <div
                      className={`relative flex flex-col justify-between p-8 sm:p-10 rounded-3xl transition duration-300 h-full ${
                        isFeatured
                          ? 'bg-gradient-to-b from-[#1C1C1C] via-[#141414] to-[#0E0E0E] border-2 border-[#FFC21A] shadow-2xl shadow-[#FFC21A]/10 -translate-y-2'
                          : 'bg-[#111111] border border-[#292929] hover:border-[#3E3E3E]'
                      }`}
                    >
                      {isFeatured && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FFC21A] text-black font-extrabold text-xs uppercase tracking-wider shadow">
                          Most Popular Selection
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-[#888888]">{plan.durationDays} Days Active Pass</span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#1C1C1C] border border-[#333] text-[#FFC21A]">
                            18% GST Incl.
                          </span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] uppercase mb-1">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-[#888888] mb-6 line-clamp-2">
                          {plan.description || `${plan.durationDays} Days Unrestricted Turnstile Gym Floor Access`}
                        </p>

                        <div className="mb-6 pb-6 border-b border-[#242424]">
                          <span className="text-4xl sm:text-5xl font-black font-mono tabular-nums text-[#F5F5F5]">
                            {formatCurrency(plan.pricePaisa)}
                          </span>
                          <span className="text-xs text-[#888888] ml-2 font-mono">
                            / {plan.durationDays} Days
                          </span>
                        </div>

                        {/* Verified Plan Benefit Privileges */}
                        <div className="space-y-3 mb-8">
                          <p className="text-xs font-bold text-[#A5A5A5] uppercase tracking-wider">
                            Included Privileges:
                          </p>
                          {plan.planBenefits && plan.planBenefits.length > 0 ? (
                            plan.planBenefits.map((pb: any) => (
                              <div key={pb.id} className="flex items-center space-x-3 text-sm text-[#CCCCCC]">
                                <Check className="w-4 h-4 text-[#FFC21A] shrink-0" />
                                <span className="font-medium">
                                  {pb.benefit?.name || pb.benefit?.title || 'Gym Access Privilege'}
                                </span>
                              </div>
                            ))
                          ) : (
                            <>
                              <div className="flex items-center space-x-3 text-sm text-[#CCCCCC]">
                                <Check className="w-4 h-4 text-[#FFC21A] shrink-0" />
                                <span>Full Strength & Olympic Floor Access</span>
                              </div>
                              <div className="flex items-center space-x-3 text-sm text-[#CCCCCC]">
                                <Check className="w-4 h-4 text-[#FFC21A] shrink-0" />
                                <span>Locker & Shower Amenities</span>
                              </div>
                              <div className="flex items-center space-x-3 text-sm text-[#CCCCCC]">
                                <Check className="w-4 h-4 text-[#FFC21A] shrink-0" />
                                <span>General Floor Coach Assistance</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <Link
                        to={`/contact?plan=${encodeURIComponent(plan.name)}`}
                        className={`w-full py-4 rounded-xl font-bold text-sm text-center flex items-center justify-center space-x-2 transition ${
                          isFeatured
                            ? 'bg-[#FFC21A] hover:bg-[#e5ad16] text-black shadow-lg shadow-[#FFC21A]/20'
                            : 'bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] text-[#F5F5F5]'
                        }`}
                      >
                        <span>Enroll in {plan.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: TRAINER PROFILES (Warm Editorial Light #F5F4F0)
          Real stored data and photographs from the database
          ========================================================================= */}
      <section className="bg-[#F5F4F0] text-[#171717] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E5E4E0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-[#B45309] tracking-widest uppercase mb-2 block">
              Certified Mentorship
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#171717] uppercase tracking-tight">
              Meet Our Specialist Coaches
            </h2>
            <p className="text-[#525252] mt-3 text-sm sm:text-base">
              Experienced fitness architects passionate about form, biomechanical longevity, and nutritional discipline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers.map((trainer: any, idx: number) => (
              <ScrollReveal key={trainer.id} direction="up" delay={idx * 0.1}>
                <div className="bg-[#FFFFFF] rounded-3xl border border-[#E5E4E0] overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col justify-between h-full">
                  <div>
                    <div className="h-64 bg-[#EAE8E2] relative flex items-center justify-center overflow-hidden">
                      {trainer.photoUrl ? (
                        <img
                          src={trainer.photoUrl}
                          alt={trainer.user?.fullName}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-[#171717] flex items-center justify-center text-4xl font-black text-[#FFC21A]">
                          {trainer.user?.fullName?.charAt(0) || 'C'}
                        </div>
                      )}
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#171717]/85 backdrop-blur-md text-xs font-bold text-[#FFC21A]">
                        ★ {Number(trainer.rating).toFixed(1)}
                      </div>
                    </div>

                    <div className="p-6 sm:p-8">
                      <h3 className="text-2xl font-bold text-[#171717]">{trainer.user?.fullName}</h3>
                      <p className="text-xs font-mono font-bold text-[#B45309] uppercase tracking-wider mt-1 mb-3">
                        {trainer.specialization}
                      </p>
                      <p className="text-sm text-[#525252] line-clamp-3 leading-relaxed mb-4">
                        {trainer.bio || 'Dedicated strength coach guiding personal body transformations with injury-free biomechanics.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 pt-0 border-t border-[#F0EFEA] flex items-center justify-between text-xs text-[#737373]">
                    <span>Experience: <strong className="text-[#171717] font-mono">{trainer.experienceYears} Years</strong></span>
                    <Link to="/contact" className="text-[#B45309] font-bold hover:underline flex items-center gap-1">
                      <span>Consult</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: COMMUNITY EVENTS & MEMBERSHIP CTA BANNER (Deep Obsidian #080808)
          Clear call to action, verified database events, and location details
          ========================================================================= */}
      <section className="bg-[#080808] text-[#F5F5F5] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Events Spotlight */}
          {events.length > 0 && (
            <div className="bg-[#111111] p-8 sm:p-12 rounded-3xl border border-[#292929]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-mono font-bold text-[#FFC21A] tracking-widest uppercase mb-1 block">
                    Gym Community
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] uppercase">
                    Upcoming Workshops & Challenges
                  </h3>
                </div>
                <Link to="/events" className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#FFC21A] hover:underline">
                  <span>View All Scheduled Events</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((ev: any, idx: number) => (
                  <ScrollReveal key={ev.id} direction="up" delay={idx * 0.1}>
                    <div className="bg-[#171717] p-6 rounded-2xl border border-[#292929] h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center space-x-2 text-xs text-[#FFC21A] font-mono mb-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(ev.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <h4 className="text-lg font-bold text-[#F5F5F5] mb-2">{ev.title}</h4>
                        <p className="text-sm text-[#A5A5A5] line-clamp-2">{ev.description}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-[#292929] flex items-center justify-between text-xs text-[#888888]">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-[#FFC21A]" />
                          <span>{ev.location}</span>
                        </span>
                        <Link to="/contact" className="text-[#F5F5F5] font-semibold hover:text-[#FFC21A]">Register Now →</Link>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}

          {/* Grand Call-To-Action Banner */}
          <ScrollReveal direction="up" delay={0.1}>
            <div className="bg-gradient-to-r from-[#171717] via-[#141414] to-[#171717] border border-white/10 p-8 sm:p-16 rounded-3xl text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-[#FFC21A]/10 blur-[120px] rounded-full pointer-events-none" />
              <div className="max-w-2xl mx-auto relative z-10">
                <span className="text-xs font-mono font-bold text-[#FFC21A] uppercase tracking-widest block mb-2">
                  Narsobawadi, Maharashtra
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F5F5F5] uppercase tracking-tight mb-4">
                  COMMENCE YOUR TRANSFORMATION
                </h2>
                <p className="text-sm sm:text-base text-[#A5A5A5] mb-8 leading-relaxed">
                  Join the RV Fitness community today. Experience genuine athletic camaraderie, tournament-calibrated Olympic equipment, and certified guidance.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/memberships"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#FFC21A] text-black font-extrabold hover:bg-[#e5ad16] transition shadow-lg shadow-[#FFC21A]/20"
                  >
                    Explore Memberships
                  </Link>
                  <Link
                    to="/contact"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#222222] border border-[#333] text-[#F5F5F5] font-semibold hover:bg-[#2a2a2a] transition"
                  >
                    Schedule A Facility Tour
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};
