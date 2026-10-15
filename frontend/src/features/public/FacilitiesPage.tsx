import React, { useState } from 'react';
import { Dumbbell, Flame, Zap, Shield, Sparkles, Check, ArrowRight, Rotate3d, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Equipment3DViewer, EquipmentModelId } from '@/components/three/Equipment3DViewer';

export const FacilitiesPage: React.FC = () => {
  const [activeModel, setActiveModel] = useState<EquipmentModelId>('bumper-plate');

  const facilityZones = [
    {
      title: 'Olympic Squat Racks & Power Platforms',
      subtitle: 'Heavy-Duty 11-Gauge Structural Steel',
      icon: Dumbbell,
      image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop',
      description: 'Built for heavy compound lifting. 4 full power cages equipped with laser-cut uprights, safety spotter straps, deadlift jacks, and sound-dampening rubber impact platforms.',
      specs: [
        '4 Full Heavy-Duty Power Cages',
        'Shock-Absorbing Deadlift Platforms',
        'Competition Olympic Barbells (20kg / 28.5mm)',
        'Calibrated Cast Iron & Bumper Plates',
      ],
    },
    {
      title: 'Commercial Dumbbell & Free-Weight Area',
      subtitle: 'Unilateral Symmetry & Shoulder Health',
      icon: Shield,
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
      description: 'Complete matched pairs of commercial anti-roll hex dumbbells from 2.5 kg to 50 kg. Ergonomically contoured knurled chrome handles paired with multiple adjustable flat, incline, and decline benches.',
      specs: [
        'Dumbbells from 2.5 kg to 50 kg in Pairs',
        'Heavy Virgin Rubber Hex Coatings',
        '6 Commercial Multi-Angle Benches',
        'Dedicated Ez-Bar & Fixed Barbell Rack',
      ],
    },
    {
      title: 'Convergent Axis & Cable Biomechanics',
      subtitle: 'Targeted Hypertrophy & Joint Longevity',
      icon: Zap,
      image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1200&auto=format&fit=crop',
      description: 'Plate-loaded linear leg press, hack squat, convergent chest presses, and dual adjustable cable crossovers aligned to natural human joint arcs with zero shearing forces.',
      specs: [
        'Linear Bearing 45° Leg Press & Hack Squat',
        'Dual Adjustable Cable Cross Towers',
        'Prone Hamstring Curl & Leg Extension',
        'Seated Low Row & Lat Pulldown Units',
      ],
    },
    {
      title: 'Cardio Theater & Turf Conditioning Lane',
      subtitle: 'Metabolic Power & Functional Endurance',
      icon: Flame,
      image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=1200&auto=format&fit=crop',
      description: 'High-incline commercial treadmills with telemetry sensors, Concept2 wind-resistance rowers, air bikes, and a high-density sprint turf track for prowler sled pushes.',
      specs: [
        'Commercial High-Incline Treadmills',
        'Concept2 Ergometer Rowers',
        'Assault Air Resistance Bikes',
        'Sprint Turf Track with Heavy Push Sleds',
      ],
    },
  ];

  return (
    <div className="space-y-0 pb-0 overflow-x-hidden">
      {/* =========================================================================
          HERO: FACILITY ARCHITECTURE
          ========================================================================= */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-[#0A0A0A] text-[#F5F5F5] border-b border-[#222222]">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center brightness-[0.3]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2000&auto=format&fit=crop')`,
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
                10,000+ Sq Ft Floor • Narsobawadi
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
              TRAINING <span className="text-[#FFC21A]">FACILITIES</span> & HARDWARE.
            </h1>

            <p className="text-base sm:text-lg text-[#CCCCCC] leading-relaxed">
              Step onto Narsobawadi’s most comprehensively equipped training floor. Tournament Olympic steel, commercial dumbbells, plate-loaded machinery, and conditioning turf.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: THE 4 FACILITY ZONES (Dark Charcoal #0D0D10)
          ========================================================================= */}
      <section className="bg-[#0D0D10] text-[#F5F5F5] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#222222]">
        <div className="max-w-7xl mx-auto space-y-20">
          {facilityZones.map((zone, idx) => {
            const isReversed = idx % 2 === 1;

            return (
              <ScrollReveal key={zone.title} direction="up" delay={0.05}>
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Photography Frame (6 cols) */}
                  <div className={`lg:col-span-6 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                      <img
                        src={zone.image}
                        alt={zone.title}
                        className="w-full h-[360px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-[#FFC21A] uppercase">
                        Zone 0{idx + 1}
                      </div>
                    </div>
                  </div>

                  {/* Specifications and Details (6 cols) */}
                  <div className={`lg:col-span-6 space-y-5 ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                    <span className="text-xs font-mono font-bold text-[#FFC21A] uppercase tracking-wider block">
                      {zone.subtitle}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                      {zone.title}
                    </h2>
                    <p className="text-sm text-[#A5A5A5] leading-relaxed">
                      {zone.description}
                    </p>

                    <div className="space-y-2.5 pt-3 border-t border-white/10">
                      <span className="text-[11px] font-bold text-[#888892] uppercase tracking-wider font-mono block">
                        Zone Specifications:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {zone.specs.map((spec, sIdx) => (
                          <div key={sIdx} className="flex items-center space-x-2 text-xs text-[#CCCCCC]">
                            <Check className="w-3.5 h-3.5 text-[#FFC21A] shrink-0" />
                            <span>{spec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: INTERACTIVE 3D EQUIPMENT INSPECTION ARENA (Obsidian #080808)
          ========================================================================= */}
      <section className="bg-[#080808] text-[#F5F5F5] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#222222]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-[#FFC21A] uppercase tracking-widest block mb-2">
              Biomechanical Inspection
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Interactive 3D Equipment Inspection
            </h2>
            <p className="text-sm text-[#A5A5A5] mt-2">
              Rotate in 360° to inspect our competition steel, brass bushings, and tournament knurling patterns.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {[
                { id: 'bumper-plate' as EquipmentModelId, label: 'Bumper Plate' },
                { id: 'barbell' as EquipmentModelId, label: 'Olympic Barbell' },
                { id: 'dumbbells' as EquipmentModelId, label: 'Hex Dumbbell' },
                { id: 'kettlebell' as EquipmentModelId, label: 'Cast Iron Kettlebell' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveModel(item.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition flex items-center space-x-1.5 cursor-pointer ${
                    activeModel === item.id
                      ? 'bg-[#FFC21A] text-black shadow-lg shadow-[#FFC21A]/20 scale-105'
                      : 'bg-[#141418] text-[#A5A5A5] hover:text-[#F5F5F5] border border-white/10'
                  }`}
                >
                  <Rotate3d className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#111114] rounded-3xl border border-white/10 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1c1c22_0%,#111114_75%)] pointer-events-none" />
            <Equipment3DViewer activeId={activeModel} className="relative z-10" />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: CTA
          ========================================================================= */}
      <section className="bg-[#0D0D10] text-[#F5F5F5] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Experience Our Training Floor In Person
          </h2>
          <p className="text-sm text-[#A5A5A5] max-w-xl mx-auto">
            Schedule a free walk-in facility tour with one of our head coaches. We will demonstrate equipment biomechanics and answer all questions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/contact"
              className="px-8 py-3.5 rounded-xl bg-[#FFC21A] text-black font-extrabold hover:bg-[#e5ad16] transition shadow-lg shadow-[#FFC21A]/20 text-sm"
            >
              Book A Facility Tour
            </Link>
            <Link
              to="/memberships"
              className="px-8 py-3.5 rounded-xl bg-[#141418] border border-white/10 text-white font-semibold hover:bg-[#1E1E24] transition text-sm"
            >
              Explore Memberships
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
