import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSubmitInquiry } from '@/hooks/usePublic';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  CheckCircle,
  Sparkles,
  Navigation,
  Compass,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const prePlan = searchParams.get('plan');
  const preTrainer = searchParams.get('trainer');
  const preEvent = searchParams.get('event');

  const defaultSubject = prePlan
    ? `Membership Inquiry: ${prePlan}`
    : preTrainer
      ? `Personal Training with ${preTrainer}`
      : preEvent
        ? `Event Registration: ${preEvent}`
        : 'General Membership Inquiry';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (defaultSubject) setSubject(defaultSubject);
  }, [defaultSubject]);

  const { mutate: submitInquiry, isPending } = useSubmitInquiry();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      toast.error('Please complete all required fields.');
      return;
    }

    submitInquiry(
      { fullName, email, phone, subject, message },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast.success('Inquiry submitted successfully!');
        },
        onError: () => {
          toast.error('Failed to submit inquiry. Please call the front desk directly.');
        },
      }
    );
  };

  return (
    <div className="space-y-0 pb-20 bg-[#080808] text-[#F5F5F5] min-h-screen">
      {/* =========================================================================
          HERO SECTION: CINEMATIC GYM ENVIRONMENT
          ========================================================================= */}
      <section className="relative min-h-[46vh] lg:min-h-[50vh] flex items-center overflow-hidden border-b border-white/10 bg-[#0A0A0A]">
        {/* Full-bleed Gym Photo */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1800&auto=format&fit=crop')`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/95 via-[#080808]/85 to-[#080808]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/50" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-20">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#161616]/85 border border-white/10 backdrop-blur-md">
              <MapPin className="w-3.5 h-3.5 text-[#FFC21A]" />
              <span className="text-xs font-semibold tracking-wider text-[#D4D4D4] uppercase font-mono">
                Datta Mandir Road • Narsobawadi
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
              GET IN TOUCH <span className="text-[#FFC21A]">WITH RV FITNESS</span>
            </h1>

            <p className="text-base sm:text-lg text-[#CCCCCC] leading-relaxed max-w-2xl">
              Schedule a personalized tour, speak with our certified coaches, or request membership guidance. We are located right in the heart of Narsobawadi.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MAIN CONTENT: LOCATION & INQUIRY FORM
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Gym Location & Operational Times (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#141418] rounded-3xl border border-white/10 p-8 sm:p-10 shadow-xl space-y-8">
              <div className="border-b border-white/10 pb-5">
                <span className="text-[11px] font-mono font-bold text-[#FFC21A] uppercase tracking-widest block mb-1">
                  Facility Coordinates
                </span>
                <h2 className="text-2xl font-black uppercase text-white tracking-tight">
                  Narsobawadi Headquarters
                </h2>
              </div>

              <div className="space-y-6">
                {/* Physical Address */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1A22] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-[#FFC21A]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase">Physical Address</h3>
                    <p className="text-xs text-[#A5A5A5] leading-relaxed">
                      Near Datta Mandir, Main Road, Narsobawadi,<br />
                      Taluka Shirol, District Kolhapur, Maharashtra — 416104
                    </p>
                    <div className="pt-1">
                      <span className="text-[11px] font-mono text-[#FFC21A] bg-[#FFC21A]/10 px-2 py-0.5 rounded border border-[#FFC21A]/20">
                        Landmark: 2 mins from Krishna River Ghat
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operating Shifts */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1A22] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5 text-[#FFC21A]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase">Floor Operating Hours</h3>
                    <div className="text-xs text-[#A5A5A5] font-mono space-y-0.5">
                      <div className="flex justify-between gap-4">
                        <span className="text-[#D4D4D4]">Mon — Sat Morning:</span>
                        <span className="text-white font-bold">5:30 AM – 10:30 AM</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#D4D4D4]">Mon — Sat Evening:</span>
                        <span className="text-white font-bold">4:30 PM – 10:00 PM</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-[#D4D4D4]">Sunday Morning:</span>
                        <span className="text-[#FFC21A] font-bold">6:00 AM – 11:00 AM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Telephony & Direct Line */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1A22] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-5 h-5 text-[#FFC21A]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase">Desk Phone & WhatsApp</h3>
                    <p className="text-xs font-mono text-[#A5A5A5]">
                      +91 98765 43210 / +91 91234 56789
                    </p>
                    <div className="flex gap-2 pt-1">
                      <a
                        href="tel:+919876543210"
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#1C1C24] hover:bg-[#252530] border border-white/10 text-white transition inline-flex items-center space-x-1"
                      >
                        <Phone className="w-3 h-3 text-[#FFC21A]" />
                        <span>Call Desk</span>
                      </a>
                      <a
                        href="https://wa.me/919876543210"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition inline-flex items-center space-x-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Official Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1A22] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-5 h-5 text-[#FFC21A]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase">Official Email</h3>
                    <p className="text-xs font-mono text-[#A5A5A5]">info@rvfitness.com</p>
                    <p className="text-[11px] text-[#737373]">Responses typically within 3 business hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Walk-In Welcomed Notice */}
            <div className="bg-[#141418] rounded-2xl border border-white/10 p-6 flex items-start space-x-4">
              <ShieldCheck className="w-8 h-8 text-[#FFC21A] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase">Walk-in Facility Previews</h4>
                <p className="text-xs text-[#A5A5A5] mt-1 leading-relaxed">
                  No appointment needed for a guided tour of our Olympic racks, cable apparatus, and athlete locker rooms. Drop in during morning or evening operational hours.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Submission Terminal (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-[#141418] rounded-3xl border border-white/10 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFC21A]/5 rounded-bl-full pointer-events-none" />

              {submitted ? (
                <div className="py-16 text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                      Inquiry Dispatched
                    </h3>
                    <p className="text-sm text-[#A5A5A5] max-w-md mx-auto leading-relaxed">
                      Thank you for contacting RV Fitness Narsobawadi. Our membership desk has logged your request and will reach out via phone or email shortly.
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setMessage('');
                      }}
                      className="px-6 py-3 rounded-xl bg-[#1C1C24] hover:bg-[#252530] border border-white/10 text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="border-b border-white/10 pb-5">
                    <span className="text-[11px] font-mono font-bold text-[#FFC21A] uppercase tracking-widest block mb-1">
                      Direct Communication Channel
                    </span>
                    <h2 className="text-2xl font-black uppercase text-white tracking-tight">
                      Send Us an Inquiry
                    </h2>
                    <p className="text-xs text-[#A5A5A5] mt-1">
                      Whether you need tier pricing, trainer consultations, or event details, our team responds promptly.
                    </p>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#D4D4D4] uppercase tracking-wider">
                      Full Name <span className="text-[#FFC21A]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Vikram Salunkhe"
                      className="w-full bg-[#16161A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#FFC21A] transition"
                    />
                  </div>

                  {/* Contact Methods (Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-[#D4D4D4] uppercase tracking-wider">
                        Email Address <span className="text-[#FFC21A]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[#16161A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#FFC21A] transition"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-[#D4D4D4] uppercase tracking-wider">
                        Phone Number <span className="text-[#FFC21A]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile"
                        className="w-full bg-[#16161A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#FFC21A] transition"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#D4D4D4] uppercase tracking-wider">
                      Subject / Topic <span className="text-[#FFC21A]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Inquiring about Annual Plan"
                      className="w-full bg-[#16161A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#FFC21A] transition"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#D4D4D4] uppercase tracking-wider">
                      Detailed Note or Fitness Goals
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your previous training experience, target goals, or questions regarding equipment..."
                      className="w-full bg-[#16161A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#FFC21A] transition resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-4 rounded-xl bg-[#FFC21A] hover:bg-[#e0a816] text-[#080808] font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl shadow-[#FFC21A]/15 transition duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isPending ? 'TRANSMITTING INQUIRY...' : 'DISPATCH INQUIRY'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
