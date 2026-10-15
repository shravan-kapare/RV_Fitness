import React, { useState } from 'react';
import { usePublicPlans } from '@/hooks/usePublic';
import { formatCurrency } from '@/lib/formatters';
import { Check, ShieldCheck, Tag, ArrowRight, HelpCircle, Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export const MembershipsPage: React.FC = () => {
  const { data: plans = [], isLoading } = usePublicPlans();
  const [couponCode, setCouponCode] = useState('');
  const [discountMsg, setDiscountMsg] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'DIWALI2026') {
      setDiscountMsg('Active code DIWALI2026 verified: Flat 15% off applied at desk on semi-annual & annual plans!');
    } else if (code === 'WELCOME500') {
      setDiscountMsg('Code WELCOME500 verified: ₹500 discount eligible for first-time Narsobawadi members!');
    } else if (code) {
      setDiscountMsg(`Code "${code}" noted. Desk staff will apply any applicable voucher on registration.`);
    }
  };

  const comparisonFeatures = [
    { title: 'Turnstile QR Digital Pass Access', basic: true, standard: true, elite: true },
    { title: 'Full Strength & Free-Weight Floor', basic: true, standard: true, elite: true },
    { title: 'Secure Locker & Changing Amenities', basic: true, standard: true, elite: true },
    { title: 'RO Chilled Pure Drinking Water', basic: true, standard: true, elite: true },
    { title: 'Personalized Workout Routine', basic: false, standard: true, elite: true },
    { title: 'Diet & Macronutrient Guidance', basic: false, standard: true, elite: true },
    { title: 'Monthly Body Composition & BMI Audit', basic: false, standard: true, elite: true },
    { title: 'Priority Certified Trainer Mentorship', basic: false, standard: false, elite: true },
    { title: 'Steam Bath & Recovery Lounge Sessions', basic: false, standard: false, elite: true },
  ];

  return (
    <div className="space-y-0 pb-0 overflow-x-hidden">
      {/* =========================================================================
          HERO: TRANSPARENT TIERS
          ========================================================================= */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-[#0A0A0A] text-[#F5F5F5] border-b border-[#222222]">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center brightness-[0.3]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop')`,
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
                Transparent Rates • 18% GST Included
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
              INVEST IN YOUR <span className="text-[#FFC21A]">STRENGTH</span>.
            </h1>

            <p className="text-base sm:text-lg text-[#CCCCCC] leading-relaxed">
              Zero hidden registration fees. Transparent monthly, semi-annual, and annual plans with full locker and coach access in Narsobawadi.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: VOUCHER BAR & DYNAMIC PLANS (Dark Obsidian #080808)
          ========================================================================= */}
      <section className="bg-[#080808] text-[#F5F5F5] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#1F1F1F]">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Promo Code Bar */}
          <div className="max-w-md mx-auto bg-[#141418] p-4 rounded-2xl border border-white/10 shadow-lg text-center">
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-grow">
                <Tag className="w-4 h-4 text-[#FFC21A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Promo code (e.g. DIWALI2026)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-[#1A1A20] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5F5F5] placeholder-[#737373] focus:outline-none focus:border-[#FFC21A]"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-[#FFC21A] text-black font-extrabold text-xs rounded-xl hover:bg-[#e5ad16] transition cursor-pointer shadow-sm"
              >
                Apply
              </button>
            </form>
            {discountMsg && (
              <p className="text-xs text-[#FFC21A] mt-2.5 font-mono">{discountMsg}</p>
            )}
          </div>

          {/* Dynamic Plans Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-[#141418] rounded-3xl border border-white/10 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {plans.map((plan: any, idx: number) => {
                const isFeatured = idx === 1;

                return (
                  <ScrollReveal key={plan.id} direction="up" delay={idx * 0.1}>
                    <div
                      className={`relative flex flex-col justify-between p-8 sm:p-10 rounded-3xl transition duration-300 h-full ${
                        isFeatured
                          ? 'bg-gradient-to-b from-[#1C1C22] via-[#141418] to-[#0E0E12] border-2 border-[#FFC21A] shadow-2xl shadow-[#FFC21A]/10 -translate-y-2'
                          : 'bg-[#141418] border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {isFeatured && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FFC21A] text-black font-extrabold text-xs uppercase tracking-wider shadow">
                          Most Popular Selection
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-[#9CA3AF]">{plan.durationDays} Days Active Pass</span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#1A1A22] border border-white/10 text-[#FFC21A]">
                            18% GST Incl.
                          </span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-black text-white uppercase mb-1">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-[#9CA3AF] mb-6 line-clamp-2">
                          {plan.description || `${plan.durationDays} Days Unrestricted Turnstile Gym Floor Access`}
                        </p>

                        <div className="mb-6 pb-6 border-b border-white/10">
                          <span className="text-4xl sm:text-5xl font-black font-mono tabular-nums text-white">
                            {formatCurrency(plan.pricePaisa)}
                          </span>
                          <span className="text-xs text-[#9CA3AF] ml-2 font-mono">
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
                                  {pb.benefit?.title || pb.benefit?.name || 'Gym Access Privilege'}
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
                            : 'bg-[#1A1A22] hover:bg-[#22222A] border border-white/10 text-white'
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
          SECTION 2: TIER COMPARISON MATRIX (Warm Editorial Light #F5F4F0)
          ========================================================================= */}
      <section className="bg-[#F5F4F0] text-[#171717] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E5E4E0]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#B45309] tracking-widest uppercase mb-2 block font-mono">
              Privilege Breakdown
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#171717]">
              Compare Package Privileges
            </h2>
            <p className="text-sm text-[#525252] mt-2">
              All plans include complete equipment floor access and day locker facilities.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E5E4E0] shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-[#F0EFEA] border-b border-[#E5E4E0] text-xs font-bold uppercase tracking-wider text-[#171717]">
                  <th className="p-4 sm:p-5">Facility Privilege</th>
                  <th className="p-4 sm:p-5 text-center">Monthly</th>
                  <th className="p-4 sm:p-5 text-center text-[#B45309]">6 Months</th>
                  <th className="p-4 sm:p-5 text-center">Annual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEA]">
                {comparisonFeatures.map((feat, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-[#FAFAF8]' : 'bg-white'}>
                    <td className="p-4 sm:p-5 font-medium text-[#171717]">{feat.title}</td>
                    <td className="p-4 sm:p-5 text-center">
                      {feat.basic ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-[#A5A5A5]">—</span>
                      )}
                    </td>
                    <td className="p-4 sm:p-5 text-center bg-[#FDF8EC]">
                      {feat.standard ? (
                        <Check className="w-4 h-4 text-[#B45309] mx-auto stroke-[2.5]" />
                      ) : (
                        <span className="text-[#A5A5A5]">—</span>
                      )}
                    </td>
                    <td className="p-4 sm:p-5 text-center">
                      {feat.elite ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[2.5]" />
                      ) : (
                        <span className="text-[#A5A5A5]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: TRANSPARENT FAQS (Dark Technical Charcoal #0D0D10)
          ========================================================================= */}
      <section className="bg-[#0D0D10] text-[#F5F5F5] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-[#FFC21A] tracking-widest uppercase mb-1 block">
              Clear Policies
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#141418] p-6 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#FFC21A]" />
                <span>Can I freeze my membership?</span>
              </h4>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Yes. 6-Month and Annual plans allow membership freezing for medical or travel reasons (up to 30 days) upon request at the front desk.
              </p>
            </div>

            <div className="bg-[#141418] p-6 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#FFC21A]" />
                <span>What payment methods are supported?</span>
              </h4>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                We accept UPI (GPay, PhonePe, Paytm), cash at desk, NEFT/IMPS bank transfer, and credit/debit cards. Official digital receipts are provided instantly.
              </p>
            </div>

            <div className="bg-[#141418] p-6 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#FFC21A]" />
                <span>Is personal training required?</span>
              </h4>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                No. General floor coaches are always present to assist with form, spot heavy lifts, and ensure safety across all active members at no extra charge.
              </p>
            </div>

            <div className="bg-[#141418] p-6 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#FFC21A]" />
                <span>How does the Turnstile QR pass work?</span>
              </h4>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Upon enrollment, your member portal generates a dynamic digital QR pass. Present your phone at the front-desk scanner for instant turnstile check-in.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
