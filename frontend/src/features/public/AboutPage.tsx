import React from 'react';
import { Dumbbell, Target, Shield, Users, Trophy, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-16 space-y-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#FFC21A] tracking-widest uppercase mb-2 block">
          Our Heritage & Ethos
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#F5F5F5] uppercase tracking-tight">
          About RV Fitness
        </h1>
        <p className="text-base text-[#A5A5A5] mt-4 leading-relaxed">
          Founded in Narsobawadi, Maharashtra, RV Fitness was forged with a single non-negotiable objective: to bring world-class biomechanical training, heavy resistance standards, and authentic athletic coaching to our hometown.
        </p>
      </div>

      {/* Story & Philosophy Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] uppercase">
            No Shortcuts. Only Unfiltered Discipline.
          </h2>
          <p className="text-sm text-[#A5A5A5] leading-relaxed">
            Most modern gyms focus on aesthetics and casual workouts without addressing the fundamentals of human strength. At RV Fitness, we believe physical transformation begins with progressive overload, compound barbell lifts, metabolic conditioning, and structured recovery.
          </p>
          <p className="text-sm text-[#A5A5A5] leading-relaxed">
            Whether you are stepping into a weight room for the very first time or an experienced powerlifter aiming to break personal records, our coaches and equipment provide the ideal ecosystem for sustainable, injury-free physical prowess.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#F5F5F5]">
              <Trophy className="w-4 h-4 text-[#FFC21A]" />
              <span>Olympic Lifting Standard</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#F5F5F5]">
              <Award className="w-4 h-4 text-[#FFC21A]" />
              <span>Certified Sports Nutritionists</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111111] p-8 sm:p-10 rounded-3xl border border-[#292929] space-y-6">
          <h3 className="text-xl font-bold text-[#F5F5F5] uppercase border-l-2 border-[#FFC21A] pl-3">
            The RV Fitness Principles
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <Target className="w-5 h-5 text-[#FFC21A] shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-[#F5F5F5]">Biomechanical Accuracy</h4>
                <p className="text-xs text-[#888888] mt-0.5">Every rep is taught with precision form to safeguard spinal integrity and joint health.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Shield className="w-5 h-5 text-[#FFC21A] shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-[#F5F5F5]">Data-Driven Tracking</h4>
                <p className="text-xs text-[#888888] mt-0.5">We track your progress via weekly body fat, tape measurements, and member attendance analytics.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Users className="w-5 h-5 text-[#FFC21A] shrink-0 mt-1" />
              <div>
                <h4 className="text-sm font-bold text-[#F5F5F5]">Empowering Community</h4>
                <p className="text-xs text-[#888888] mt-0.5">A judgment-free, supportive brotherhood and sisterhood striving for physical excellence.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Quick Strip */}
      <div className="bg-[#111111] border border-[#292929] rounded-2xl p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-[#F5F5F5] uppercase">Ready to tour the facility?</h3>
        <p className="text-sm text-[#A5A5A5] max-w-xl mx-auto">
          Visit us near Datta Mandir, Narsobawadi. Meet the head coaches and try a free introductory movement session.
        </p>
        <Link
          to="/contact"
          className="inline-block px-6 py-3 rounded-xl bg-[#FFC21A] text-black font-bold text-sm hover:bg-[#e5ad16] transition"
        >
          Book An Introductory Tour
        </Link>
      </div>
    </div>
  );
};
