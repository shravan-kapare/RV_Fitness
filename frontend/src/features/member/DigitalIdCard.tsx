import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useMemberQrToken } from '@/hooks/useAttendance';
import { QrCode, RefreshCw, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export const DigitalIdCard: React.FC = () => {
  const { data: tokenData, isLoading, refetch, isFetching } = useMemberQrToken();
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (!tokenData?.expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(tokenData.expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        refetch();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tokenData, refetch]);

  return (
    <div className="max-w-md mx-auto">
      {/* Physical Card Mockup */}
      <div className="bg-gradient-to-b from-[#1c1c1c] via-[#121212] to-[#0d0d0d] rounded-3xl border-2 border-[#FFC21A]/50 p-6 sm:p-8 shadow-2xl shadow-[#FFC21A]/10 text-center relative overflow-hidden">
        {/* Top RV Fitness Brand Banner */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#292929]">
          <div className="text-left">
            <span className="text-xl font-black tracking-wider text-[#F5F5F5] uppercase">
              RV <span className="text-[#FFC21A]">FITNESS</span>
            </span>
            <span className="block text-[9px] tracking-widest text-[#888] uppercase font-mono">
              DIGITAL TURNSTILE PASS
            </span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#111111] border border-[#333] text-[10px] font-bold text-[#FFC21A]">
            <span className="w-2 h-2 rounded-full bg-[#FFC21A] animate-ping" />
            <span>ACTIVE</span>
          </div>
        </div>

        {/* Member Identity Details */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#F5F5F5]">{tokenData?.memberName || 'Member'}</h2>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <span className="text-xs font-mono tabular-nums text-[#FFC21A] tracking-wider">
              ID: {tokenData?.memberCode || 'RVF-MEMBER'}
            </span>
            {tokenData?.planName && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-[11px] text-zinc-400 font-medium">{tokenData.planName}</span>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Rotating QR Code */}
        <div className="bg-white p-5 rounded-2xl inline-block shadow-inner mx-auto mb-6">
          {isLoading ? (
            <div className="w-56 h-56 flex flex-col items-center justify-center text-zinc-600 text-xs">
              <RefreshCw className="w-8 h-8 text-[#FFC21A] animate-spin mb-2" />
              <span>Generating Secure Pass...</span>
            </div>
          ) : (tokenData?.qrPayload || tokenData?.token) ? (
            <QRCodeSVG
              value={(tokenData.qrPayload || tokenData.token)!}
              size={220}
              level="H"
              includeMargin={false}
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          ) : (
            <div className="w-56 h-56 flex flex-col items-center justify-center text-zinc-800 text-xs p-4 text-center">
              <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
              <span className="font-bold text-sm">Pass Not Active</span>
              <span className="text-[11px] text-zinc-500 mt-1 leading-snug">
                An active gym membership is required for turnstile check-in. Please contact the front desk.
              </span>
            </div>
          )}
        </div>

        {/* Live Expiry Countdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-xs font-mono tabular-nums text-[#A5A5A5]">
            <ClockIcon />
            <span>Auto-refreshes in: <strong className="text-[#FFC21A]">{timeLeft}s</strong></span>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-1 rounded hover:bg-[#222] text-[#888] hover:text-[#F5F5F5] transition"
              title="Manual Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <p className="text-[11px] text-[#777777] leading-relaxed max-w-xs mx-auto">
            Scan this screen at the turnstile or front desk scanner for verified attendance access.
          </p>
        </div>
      </div>
    </div>
  );
};

function ClockIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-[#FFC21A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
