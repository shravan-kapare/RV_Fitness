import React from 'react';
import { usePublicOffers } from '@/hooks/usePublic';
import { Tag, Copy, Check, Clock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const OffersPage: React.FC = () => {
  const { data: offers = [], isLoading } = usePublicOffers();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);
  };

  return (
    <div className="py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#FFC21A] tracking-widest uppercase mb-2 block">
          Seasonal Deals & Special Discounts
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#F5F5F5] uppercase tracking-tight">
          Current Offers & Codes
        </h1>
        <p className="text-base text-[#A5A5A5] mt-4 leading-relaxed">
          Take advantage of limited-time promotional pricing on quarterly and annual memberships. Apply these codes online or present them at the front desk.
        </p>
      </div>

      {/* Offers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-[#111111] rounded-3xl border border-[#292929] animate-pulse" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] rounded-3xl border border-[#292929] max-w-xl mx-auto">
          <Tag className="w-12 h-12 text-[#FFC21A] mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-[#F5F5F5]">No Active Public Offers Currently</h3>
          <p className="text-xs text-[#888888] mt-1">
            Check with the front desk for student, corporate, or bundle discounts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {offers.map((offer: any) => (
            <div
              key={offer.id}
              className="bg-gradient-to-br from-[#141414] to-[#0e0e0e] p-8 rounded-3xl border border-[#292929] hover:border-[#FFC21A]/50 transition relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC21A]/5 rounded-bl-full pointer-events-none" />

              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#1c1c1c] border border-[#333] text-[11px] font-bold text-[#FFC21A] mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {offer.discountType === 'PERCENTAGE'
                      ? `${offer.discountValue}% DISCOUNT`
                      : `₹${(offer.discountValue / 100).toFixed(0)} FLAT OFF`}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-[#F5F5F5] uppercase mb-2">{offer.title}</h3>

                <div className="flex items-center space-x-2 text-xs text-[#888888] font-mono mb-6">
                  <Clock className="w-4 h-4 text-[#FFC21A]" />
                  <span>
                    Valid until: {new Date(offer.validTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-[#222222] flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-[#888888] uppercase tracking-wider">Coupon Code</span>
                  <span className="text-lg font-black font-mono text-[#FFC21A] tracking-wider">{offer.code}</span>
                </div>
                <button
                  onClick={() => copyCode(offer.code)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-[#333] text-xs font-bold text-[#F5F5F5] transition"
                >
                  <Copy className="w-3.5 h-3.5 text-[#FFC21A]" />
                  <span>Copy Code</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
