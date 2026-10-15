import React, { useState } from 'react';
import { usePublicPlans } from '@/hooks/usePublic';
import { formatCurrency } from '@/lib/formatters';
import { Check, ShieldCheck, Tag, ArrowRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export const MembershipsPage: React.FC = () => {
  const { data: plans = [], isLoading } = usePublicPlans();
  const [couponCode, setCouponCode] = useState('');
  const [discountMsg, setDiscountMsg] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'WELCOME500') {
      setDiscountMsg('Promo code WELCOME500 applied: ₹500 off eligible on quarterly & annual plans at desk!');
    } else {
      setDiscountMsg(`Code "${couponCode}" saved for desk registration.`);
    }
  };

  return (
    <div className="py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#FFC21A] tracking-widest uppercase mb-2 block">
          Transparent Rates • No Hidden Fees
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#F5F5F5] uppercase tracking-tight">
          Membership Packages
        </h1>
        <p className="text-base text-[#A5A5A5] mt-4 leading-relaxed">
          Select an authentic membership tier tailored to your lifestyle. All memberships feature turnstile QR check-in, free locker usage, and professional trainer guidance.
        </p>
      </div>

      {/* Coupon Bar */}
      <div className="max-w-md mx-auto bg-[#111111] p-4 rounded-2xl border border-[#292929] text-center">
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <div className="relative flex-grow">
            <Tag className="w-4 h-4 text-[#FFC21A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Promo / Referral Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full bg-[#171717] border border-[#333] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-[#FFC21A]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#FFC21A] text-black font-bold text-xs rounded-xl hover:bg-[#e5ad16] transition"
          >
            Apply
          </button>
        </form>
        {discountMsg && (
          <p className="text-xs text-[#FFC21A] mt-2 font-mono">{discountMsg}</p>
        )}
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-[#111111] rounded-2xl border border-[#292929] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan: any, idx: number) => {
            const isFeatured = idx === 1;
            return (
              <ScrollReveal key={plan.id} direction="up" delay={idx * 0.12}>
                <div
                  className={`relative flex flex-col justify-between p-8 rounded-3xl transition duration-300 h-full ${
                    isFeatured
                      ? 'bg-gradient-to-b from-[#181818] to-[#111111] border-2 border-[#FFC21A] shadow-2xl shadow-[#FFC21A]/10 scale-105'
                      : 'bg-[#111111] border border-[#292929] hover:border-[#3d3d3d]'
                  }`}
                >
                  {isFeatured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FFC21A] text-black font-extrabold text-xs uppercase tracking-wider">
                      Most Recommended
                    </div>
                  )}

                  <div>
                    <h3 className="text-2xl font-black text-[#F5F5F5] uppercase mb-1">{plan.name}</h3>
                    <p className="text-xs text-[#888888] mb-6">
                      {plan.description || `${plan.durationDays} Days Unrestricted Training Floor Access`}
                    </p>

                    <div className="mb-6 pb-6 border-b border-[#222222]">
                      <span className="text-4xl sm:text-5xl font-black font-mono tabular-nums text-[#F5F5F5]">
                        {formatCurrency(plan.pricePaisa)}
                      </span>
                      <span className="text-xs text-[#888888] ml-2 font-mono">
                        / {plan.durationDays} Days
                      </span>
                    </div>

                    <div className="space-y-3 mb-8">
                      <p className="text-xs font-bold text-[#A5A5A5] uppercase tracking-wider">
                        Privileges & Amenities:
                      </p>
                      {plan.planBenefits && plan.planBenefits.length > 0 ? (
                        plan.planBenefits.map((pb: any) => (
                          <div key={pb.id} className="flex items-center space-x-3 text-sm text-[#CCCCCC]">
                            <Check className="w-4 h-4 text-[#FFC21A] shrink-0" />
                            <span>{pb.benefit?.name || pb.benefit?.title || 'Gym Privilege'}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-center space-x-3 text-sm text-[#CCCCCC]">
                            <Check className="w-4 h-4 text-[#FFC21A] shrink-0" />
                            <span>Full Strength & Cardio Floor Access</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-[#CCCCCC]">
                            <Check className="w-4 h-4 text-[#FFC21A] shrink-0" />
                            <span>Locker & Shower Facility</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-[#CCCCCC]">
                            <Check className="w-4 h-4 text-[#FFC21A] shrink-0" />
                            <span>General Trainer Floor Guidance</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-[#CCCCCC]">
                            <Check className="w-4 h-4 text-[#FFC21A] shrink-0" />
                            <span>QR Digital ID Card for Turnstile Pass</span>
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
                        : 'bg-[#171717] hover:bg-[#222222] border border-[#292929] text-[#F5F5F5]'
                    }`}
                  >
                    <span>Register for {plan.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}

      {/* FAQ Section */}
      <div className="bg-[#111111] p-8 sm:p-12 rounded-3xl border border-[#292929] max-w-4xl mx-auto space-y-8">
        <h3 className="text-2xl font-bold text-[#F5F5F5] uppercase text-center">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#F5F5F5] flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-[#FFC21A]" />
              <span>Can I freeze my membership?</span>
            </h4>
            <p className="text-xs text-[#888888] leading-relaxed">
              Yes, active memberships can be frozen for exam periods, medical recovery, or travel by speaking with the reception desk.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#F5F5F5] flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-[#FFC21A]" />
              <span>What payment methods are supported?</span>
            </h4>
            <p className="text-xs text-[#888888] leading-relaxed">
              We accept UPI (Google Pay, PhonePe, Paytm), cash, card swipes, and direct bank transfers with instant digital receipts.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#F5F5F5] flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-[#FFC21A]" />
              <span>Are personal trainers included?</span>
            </h4>
            <p className="text-xs text-[#888888] leading-relaxed">
              General form guidance and workout splits are included in all memberships. Dedicated 1-on-1 personal coaching is available separately.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#F5F5F5] flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-[#FFC21A]" />
              <span>How does desk turnstile check-in work?</span>
            </h4>
            <p className="text-xs text-[#888888] leading-relaxed">
              Members scan their dynamic QR Pass on their phone screen at the desk scanner for hands-free, instant attendance verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
