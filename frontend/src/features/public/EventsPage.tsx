import React from 'react';
import { usePublicEvents } from '@/hooks/usePublic';
import { Calendar, MapPin, Trophy, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EventsPage: React.FC = () => {
  const { data: events = [], isLoading } = usePublicEvents();

  return (
    <div className="py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#FFC21A] tracking-widest uppercase mb-2 block">
          Community Competitions & Seminars
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#F5F5F5] uppercase tracking-tight">
          Gym Events & Workshops
        </h1>
        <p className="text-base text-[#A5A5A5] mt-4 leading-relaxed">
          Test your maximum strength, learn injury prevention, and compete in community challenges hosted regularly at RV Fitness.
        </p>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="space-y-6 max-w-4xl mx-auto">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-[#111111] rounded-3xl border border-[#292929] animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] rounded-3xl border border-[#292929] max-w-2xl mx-auto">
          <Trophy className="w-12 h-12 text-[#FFC21A] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-[#F5F5F5]">No Upcoming Events Right Now</h3>
          <p className="text-sm text-[#888888] mt-2">
            Check back soon or follow our noticeboard for new powerlifting meets and nutrition seminars!
          </p>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {events.map((ev: any) => (
            <div
              key={ev.id}
              className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] hover:border-[#FFC21A]/50 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-xs text-[#FFC21A] font-mono">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(ev.eventDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1 text-[#A5A5A5]">
                    <MapPin className="w-4 h-4 text-[#FFC21A]" />
                    <span>{ev.location}</span>
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-[#F5F5F5]">{ev.title}</h3>
                <p className="text-sm text-[#A5A5A5] leading-relaxed max-w-2xl">
                  {ev.description}
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  to={`/contact?event=${encodeURIComponent(ev.title)}`}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#FFC21A] hover:bg-[#e5ad16] text-black font-bold text-sm transition"
                >
                  <span>Register Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
