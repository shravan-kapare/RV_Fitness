import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-[#050505] border-t border-[#292929] text-[#A5A5A5] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-[#FFC21A] flex items-center justify-center text-black font-black">
                <Dumbbell className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-black tracking-wider text-[#F5F5F5] uppercase">
                RV <span className="text-[#FFC21A]">FITNESS</span>
              </span>
            </div>
            <p className="text-sm text-[#888888] leading-relaxed">
              Narsobawadi’s elite training sanctuary. Dedicated to authentic physical transformation, heavy resistance training, and functional endurance.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs text-[#888888]">
              <ShieldCheck className="w-4 h-4 text-[#FFC21A]" />
              <span>Certified Trainers & Biomechanic Equipment</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider mb-4 border-l-2 border-[#FFC21A] pl-2">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-[#FFC21A] transition">About RV Fitness</Link>
              </li>
              <li>
                <Link to="/memberships" className="hover:text-[#FFC21A] transition">Membership Plans</Link>
              </li>
              <li>
                <Link to="/facilities" className="hover:text-[#FFC21A] transition">Equipment & Facilities</Link>
              </li>
              <li>
                <Link to="/trainers" className="hover:text-[#FFC21A] transition">Certified Coaches</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-[#FFC21A] transition">Upcoming Events</Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-[#FFC21A] transition">Transformations & Gallery</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider mb-4 border-l-2 border-[#FFC21A] pl-2">
              Locate & Connect
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#FFC21A] shrink-0 mt-0.5" />
                <span>Near Datta Mandir, Narsobawadi, Taluka Shirol, Kolhapur, Maharashtra 416104</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#FFC21A] shrink-0" />
                <span className="font-mono tabular-nums">+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#FFC21A] shrink-0" />
                <span>info@rvfitness.com</span>
              </li>
            </ul>
          </div>

          {/* Timings */}
          <div>
            <h4 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider mb-4 border-l-2 border-[#FFC21A] pl-2">
              Gym Timings
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-[#FFC21A] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#F5F5F5] font-semibold">Monday – Saturday</p>
                  <p className="text-xs font-mono tabular-nums text-[#888888]">
                    Morning: 05:30 AM – 10:30 AM<br />
                    Evening: 04:30 PM – 10:00 PM
                  </p>
                </div>
              </div>
              <div className="pl-8">
                <p className="text-[#F5F5F5] font-semibold">Sunday</p>
                <p className="text-xs font-mono tabular-nums text-[#888888]">06:00 AM – 11:00 AM (Recovery & Cardio)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-[#1C1C1C] flex flex-col sm:flex-row items-center justify-between text-xs text-[#666666] space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} RV Fitness Narsobawadi. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Built with precision & passion for fitness excellence</span>
            <Heart className="w-3.5 h-3.5 text-[#FFC21A] fill-[#FFC21A] ml-1 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
