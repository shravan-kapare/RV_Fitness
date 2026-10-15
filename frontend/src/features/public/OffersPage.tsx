import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublicOffers } from '@/hooks/usePublic';
import {
  Tag,
  Copy,
  Check,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Percent,
  Gift,
  HelpCircle,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OffersPage: React.FC = () => {
  const { data: offers = [], isLoading } = usePublicOffers();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="space-y-0 pb-16 bg-[#080808] text-[#F5F5F5] min-h-screen">
      {/* =========================================================================
          HERO SECTION: CINEMATIC GYM BACKGROUND WITH PROMOTIONAL FOCUS
          ========================================================================= */}
      <section className="relative min-h-[46vh] lg:min-h-[50vh] flex items-center overflow-hidden border-b border-white/10 bg-[#0A0A0A]">
        {/* Full-bleed Gym Photo */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1800&auto=format&fit=crop')`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/95 via-[#080808]/80 to-[#080808]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/50" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-20">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#161616]/85 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC21A]" />
              <span className="text-xs font-semibold tracking-wider text-[#D4D4D4] uppercase font-mono">
                Verified Promotions • Narsobawadi
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
              EXCLUSIVE <span className="text-[#FFC21A]">OFFERS</span> & PROMOTIONS
            </h1>

            <p className="text-base sm:text-lg text-[#CCCCCC] leading-relaxed max-w-2xl">
              Unlock seasonal fee waivers, quarterly bundle savings, and student incentives. All promotional vouchers are redeemable online or at the RV Fitness front desk.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ACTIVE VOUCHERS GRID
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
              Active Vouchers & Coupon Codes
            </h2>
            <p className="text-xs sm:text-sm text-[#A5A5A5] mt-0.5">
              Copy your preferred code to apply instant discounts to membership enrollments.
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#141418] border border-white/10 text-[#FFC21A] self-start sm:self-auto">
            {offers.length} ACTIVE {offers.length === 1 ? 'OFFER' : 'OFFERS'}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-[#141418] rounded-3xl border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-20 bg-[#141418] rounded-3xl border border-white/10 max-w-2xl mx-auto p-8 shadow-xl">
            <Tag className="w-14 h-14 text-[#FFC21A] mx-auto mb-4 opacity-75" />
            <h3 className="text-xl font-bold text-white uppercase tracking-tight">No Active Public Coupons Found</h3>
            <p className="text-sm text-[#A5A5A5] mt-2 max-w-md mx-auto">
              Current public coupons may have concluded, but special corporate, student, or athlete group rates are available directly at the desk.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#FFC21A] hover:bg-[#e0a816] text-[#080808] font-bold text-xs uppercase transition shadow-lg shadow-[#FFC21A]/10"
              >
                <span>Ask Desk For Deals</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {offers.map((offer: any) => {
              const isCopied = copiedCode === offer.code;
              const formattedDate = offer.validTo
                ? new Date(offer.validTo).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Limited Time';

              return (
                <div
                  key={offer.id}
                  className="group relative bg-[#141418] rounded-3xl border border-white/10 hover:border-[#FFC21A]/50 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between"
                >
                  {/* Decorative glowing gradient circle */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFC21A]/5 rounded-bl-full pointer-events-none group-hover:bg-[#FFC21A]/10 transition-colors duration-500" />

                  {/* Voucher Header & Body */}
                  <div className="p-8 sm:p-10 space-y-6 relative z-10">
                    <div className="flex items-center justify-between gap-4">
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#1A1A22] border border-white/10 text-xs font-bold text-[#FFC21A]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>VERIFIED PROMOTION</span>
                      </div>

                      <div className="flex items-center space-x-1.5 text-xs font-mono text-[#A5A5A5]">
                        <Clock className="w-3.5 h-3.5 text-[#FFC21A]" />
                        <span>Valid: {formattedDate}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                        {offer.discountType === 'PERCENTAGE' ? (
                          <span>
                            {offer.discountValue}% <span className="text-[#FFC21A]">OFF</span>
                          </span>
                        ) : (
                          <span>
                            ₹{(offer.discountValue / 100).toLocaleString('en-IN')}{' '}
                            <span className="text-[#FFC21A]">FLAT DISCOUNT</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-white uppercase">{offer.title}</h3>

                      <p className="text-sm text-[#A5A5A5] leading-relaxed">
                        Applicable on full admission dues or extended package durations. Present during registration to apply this reduction instantly.
                      </p>
                    </div>
                  </div>

                  {/* Voucher Ticket Tear / Coupon Footer */}
                  <div className="bg-[#101014] border-t border-dashed border-white/15 p-6 sm:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
                    {/* Ticket notches */}
                    <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-[#080808] border-r border-white/10" />
                    <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-[#080808] border-l border-white/10" />

                    <div>
                      <span className="block text-[10px] uppercase font-mono tracking-widest text-[#737373]">
                        PROMOTIONAL VOUCHER CODE
                      </span>
                      <span className="text-xl sm:text-2xl font-black font-mono text-[#FFC21A] tracking-wider">
                        {offer.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => copyCode(offer.code)}
                        className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase transition-all duration-200 cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-[#1C1C24] hover:bg-[#252530] text-white border border-white/10 hover:border-[#FFC21A]/40'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-[#FFC21A]" />
                            <span>COPY CODE</span>
                          </>
                        )}
                      </button>

                      <Link
                        to="/memberships"
                        className="inline-flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-[#FFC21A] hover:bg-[#e0a816] text-[#080808] font-bold text-xs uppercase transition shadow-md shadow-[#FFC21A]/10"
                      >
                        <span>USE NOW</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================================
          HOW REDEMPTION WORKS
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-[#141418] rounded-3xl border border-white/10 p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-mono font-bold text-[#FFC21A] tracking-widest uppercase block mb-2">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              How To Redeem Your Offer
            </h2>
            <p className="text-sm text-[#A5A5A5] mt-2">
              Claiming your promotional discount is frictionless and immediate across all verified tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-[#101014] p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFC21A]/10 border border-[#FFC21A]/30 flex items-center justify-center text-[#FFC21A] font-black text-sm">
                01
              </div>
              <h3 className="font-bold text-white uppercase text-base">Select Your Plan</h3>
              <p className="text-xs text-[#A5A5A5] leading-relaxed">
                Review our Monthly, Quarterly, Half-Yearly, or Annual strength tiers to determine what fits your fitness goals.
              </p>
            </div>

            <div className="bg-[#101014] p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFC21A]/10 border border-[#FFC21A]/30 flex items-center justify-center text-[#FFC21A] font-black text-sm">
                02
              </div>
              <h3 className="font-bold text-white uppercase text-base">Copy or Quote Code</h3>
              <p className="text-xs text-[#A5A5A5] leading-relaxed">
                Click Copy Code above or take a screenshot to quote to the desk manager during your facility tour.
              </p>
            </div>

            <div className="bg-[#101014] p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFC21A]/10 border border-[#FFC21A]/30 flex items-center justify-center text-[#FFC21A] font-black text-sm">
                03
              </div>
              <h3 className="font-bold text-white uppercase text-base">Instant Discount Applied</h3>
              <p className="text-xs text-[#A5A5A5] leading-relaxed">
                The billing engine deducts the discount amount before tax calculation. Your receipt will reflect the subsidized total.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ & POLICY ACCORDION
          ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-mono font-bold text-[#FFC21A] uppercase tracking-widest block">
            Clarity & Rules
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
            Promotion Terms & FAQs
          </h2>
        </div>

        <div className="space-y-4">
          <div className="bg-[#141418] p-6 rounded-2xl border border-white/10">
            <h4 className="font-bold text-white text-sm sm:text-base mb-1.5 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-[#FFC21A]" />
              <span>Can I stack multiple promotional coupons on one invoice?</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#A5A5A5] leading-relaxed pl-6">
              Only one promotional coupon can be applied per invoice transaction. If you possess multiple codes, our staff will apply the one providing the maximum savings.
            </p>
          </div>

          <div className="bg-[#141418] p-6 rounded-2xl border border-white/10">
            <h4 className="font-bold text-white text-sm sm:text-base mb-1.5 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-[#FFC21A]" />
              <span>Are discounts available on renewal or only new admissions?</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#A5A5A5] leading-relaxed pl-6">
              Unless explicitly specified as a 'New Member Exclusive', all listed coupons are valid for current active members renewing before their expiration date.
            </p>
          </div>

          <div className="bg-[#141418] p-6 rounded-2xl border border-white/10">
            <h4 className="font-bold text-white text-sm sm:text-base mb-1.5 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-[#FFC21A]" />
              <span>Do coupons apply to Personal Training packages?</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#A5A5A5] leading-relaxed pl-6">
              General membership coupons apply strictly to gym floor access. Specialized 1-on-1 personal coaching packages carry separate bundle rates discussed with your coach.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BOTTOM CTA BANNER
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#181820] to-[#111116] border border-white/15 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-[#FFC21A] uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>RV Fitness Desk • Narsobawadi</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Ready to Lock In Your Fitness Membership?
            </h3>
            <p className="text-sm text-[#A5A5A5] max-w-xl">
              Visit our facility near Datta Mandir road today to experience the equipment before committing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <Link
              to="/memberships"
              className="px-6 py-3.5 rounded-xl bg-[#FFC21A] hover:bg-[#e0a816] text-[#080808] font-black text-xs uppercase tracking-wider transition-all duration-200 text-center shadow-lg shadow-[#FFC21A]/20"
            >
              Explore Memberships
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3.5 rounded-xl bg-[#1C1C24] hover:bg-[#252530] border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 text-center"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
