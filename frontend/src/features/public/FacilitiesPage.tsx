import React from 'react';
import { Dumbbell, Flame, Zap, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export const FacilitiesPage: React.FC = () => {
  const facilityZones = [
    {
      title: 'Heavy Resistance & Free Weights',
      subtitle: 'Engineered for Powerlifters and Bodybuilders',
      icon: Dumbbell,
      description: 'Olympic lifting platforms, calibrated rubber bumper plates, competition barbells, and heavy urethane dumbbells up to 50 kg.',
      highlights: [
        '4 Heavy-duty power racks with safety straps',
        'Deadlift platform with sound dampening',
        'Dumbbells from 2.5 kg to 50 kg in pairs',
        'Adjustable incline, flat, and decline benches',
      ],
    },
    {
      title: 'Targeted Machine Biomechanics',
      subtitle: 'Isolation and Hypertrophy Precision',
      icon: Zap,
      description: 'Converging and diverging axis machinery designed to match natural human muscle arcs with zero joint compromise.',
      highlights: [
        'Linear bearing 45-degree leg press & hack squat',
        'Dual adjustable cable cross pulldowns',
        'Prone hamstring curl & leg extension',
        'Plate-loaded ISO chest & shoulder press',
      ],
    },
    {
      title: 'Cardiovascular Theater',
      subtitle: 'Aerobic Power and Metabolic Conditioning',
      icon: Flame,
      description: 'Commercial stamina equipment equipped with heart rate telemetry to elevate athletic conditioning and stamina.',
      highlights: [
        'Commercial high-incline sprint treadmills',
        'Concept2 wind-resistance rowing machines',
        'Assault air bikes for high-intensity intervals',
        'Spin cycles and magnetic cross-trainers',
      ],
    },
    {
      title: 'Functional Turf & Agility Track',
      subtitle: 'Dynamic Movement & Core Integrity',
      icon: Sparkles,
      description: 'Heavy sprint turf for weighted sled pushes, plyometric boxes, and battle ropes to develop explosive speed and stability.',
      highlights: [
        'Heavy-duty sprint turf strip',
        'Push/Pull prowler sleds with Olympic horns',
        'Cast iron Russian kettlebells (8kg to 32kg)',
        'Battle ropes, slam balls, and foam plyo boxes',
      ],
    },
  ];

  return (
    <div className="py-16 space-y-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#FFC21A] tracking-widest uppercase mb-2 block">
          Elite Infrastructure
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#F5F5F5] uppercase tracking-tight">
          Equipment & Facilities
        </h1>
        <p className="text-base text-[#A5A5A5] mt-4 leading-relaxed">
          Every barbell, cable, and machine at RV Fitness has been curated specifically for optimum biomechanical loading and safe progressive overload.
        </p>
      </div>

      {/* Facility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {facilityZones.map((zone, idx) => {
          const IconComponent = zone.icon;
          return (
            <ScrollReveal key={zone.title} direction="up" delay={idx * 0.1}>
              <div
                className="bg-[#111111] p-8 sm:p-10 rounded-3xl border border-white/10 hover:border-[#FFC21A]/50 transition flex flex-col justify-between h-full"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#171717] border border-[#292929] flex items-center justify-center text-[#FFC21A] mb-6">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#F5F5F5] uppercase">{zone.title}</h3>
                  <p className="text-xs text-[#FFC21A] font-semibold mb-4">{zone.subtitle}</p>
                  <p className="text-sm text-[#A5A5A5] mb-6 leading-relaxed">{zone.description}</p>

                  <div className="space-y-2.5 pt-4 border-t border-[#222222]">
                    {zone.highlights.map((h, i) => (
                      <div key={i} className="flex items-center space-x-3 text-xs sm:text-sm text-[#CCCCCC]">
                        <CheckCircle2 className="w-4 h-4 text-[#FFC21A] shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Hygiene & Amenities Banner */}
      <div className="bg-[#111111] border border-[#292929] p-8 sm:p-12 rounded-3xl text-center space-y-6">
        <h3 className="text-2xl font-bold text-[#F5F5F5] uppercase">
          Hygiene, Comfort & Security
        </h3>
        <p className="text-sm text-[#A5A5A5] max-w-2xl mx-auto leading-relaxed">
          Full air conditioning with high CFM air exchangers, daily deep disinfection routines, digital member lockers, clean shower stalls, and 24/7 CCTV surveillance throughout common areas.
        </p>
        <Link
          to="/contact"
          className="inline-block px-8 py-3.5 rounded-xl bg-[#FFC21A] text-black font-bold text-sm hover:bg-[#e5ad16] transition"
        >
          Book a Free Gym Walkthrough
        </Link>
      </div>
    </div>
  );
};
