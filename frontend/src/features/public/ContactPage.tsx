import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSubmitInquiry } from '@/hooks/usePublic';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, CheckCircle } from 'lucide-react';

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
        : 'General Gym Inquiry';

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
    submitInquiry(
      { fullName, email, phone, subject, message },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
      }
    );
  };

  return (
    <div className="py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#FFC21A] tracking-widest uppercase mb-2 block">
          Visit Us or Reach Out
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#F5F5F5] uppercase tracking-tight">
          Connect With RV Fitness
        </h1>
        <p className="text-base text-[#A5A5A5] mt-4 leading-relaxed">
          Have questions about memberships, personal training, or scheduling a free movement screening? Send us a message or walk in directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Contact Info & Location */}
        <div className="space-y-8">
          <div className="bg-[#111111] p-8 sm:p-10 rounded-3xl border border-[#292929] space-y-6">
            <h3 className="text-2xl font-bold text-[#F5F5F5] uppercase border-l-2 border-[#FFC21A] pl-3">
              Gym Location & Details
            </h3>

            <div className="space-y-5 text-sm">
              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-[#FFC21A] shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-[#F5F5F5]">Address</h4>
                  <p className="text-xs text-[#888888] mt-1 leading-relaxed">
                    Near Datta Mandir, Main Road, Narsobawadi, Taluka Shirol, District Kolhapur, Maharashtra 416104
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="w-5 h-5 text-[#FFC21A] shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-[#F5F5F5]">Phone & WhatsApp</h4>
                  <p className="text-xs font-mono tabular-nums text-[#888888] mt-1">
                    +91 98765 43210 / +91 91234 56789
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="w-5 h-5 text-[#FFC21A] shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-[#F5F5F5]">Email</h4>
                  <p className="text-xs text-[#888888] mt-1">info@rvfitness.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="w-5 h-5 text-[#FFC21A] shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-[#F5F5F5]">Operating Schedule</h4>
                  <p className="text-xs font-mono tabular-nums text-[#888888] mt-1">
                    Monday to Saturday: 5:30 AM – 10:30 AM & 4:30 PM – 10:00 PM<br />
                    Sunday: 6:00 AM – 11:00 AM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ note */}
          <div className="bg-[#171717] p-6 rounded-2xl border border-[#292929] flex items-center space-x-4">
            <MessageSquare className="w-8 h-8 text-[#FFC21A] shrink-0" />
            <div>
              <h5 className="text-sm font-bold text-[#F5F5F5]">Walk-ins are always welcome</h5>
              <p className="text-xs text-[#888888] mt-0.5">Feel free to visit directly during operating hours to inspect our machinery and meet the coaching staff.</p>
            </div>
          </div>
        </div>

        {/* Working Inquiry Form */}
        <div className="bg-[#111111] p-8 sm:p-10 rounded-3xl border border-[#292929]">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-[#FFC21A] mx-auto animate-bounce" />
              <h3 className="text-2xl font-bold text-[#F5F5F5]">Inquiry Received!</h3>
              <p className="text-sm text-[#A5A5A5] max-w-md mx-auto">
                Thank you for reaching out to RV Fitness Narsobawadi. A membership representative will contact you via phone or email shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className="mt-4 px-6 py-2.5 rounded-xl bg-[#1c1c1c] border border-[#333] text-xs font-semibold text-[#F5F5F5]"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-2xl font-bold text-[#F5F5F5] uppercase mb-2">
                Send Us a Message
              </h3>
              <p className="text-xs text-[#888888] mb-6">
                Fill in your details below and our team will get in touch.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#A5A5A5] uppercase tracking-wider mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rohit Shinde"
                  className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FFC21A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A5A5A5] uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FFC21A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A5A5A5] uppercase tracking-wider mb-2">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FFC21A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5A5A5] uppercase tracking-wider mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FFC21A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5A5A5] uppercase tracking-wider mb-2">
                  Message / Requirements
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your fitness goals or questions..."
                  className="w-full bg-[#171717] border border-[#292929] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FFC21A]"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 rounded-xl bg-[#FFC21A] hover:bg-[#e5ad16] text-black font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#FFC21A]/20 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>{isPending ? 'Sending...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
