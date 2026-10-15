import React, { useState } from 'react';
import { useDailyAttendance, useManualCheckIn, useScanQrAttendance } from '@/hooks/useAttendance';
import { QrCode, UserCheck, Clock, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, Activity, ArrowRightLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const AttendanceDesk: React.FC = () => {
  const [memberCodeInput, setMemberCodeInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [scanMode, setScanMode] = useState<'CODE' | 'TOKEN'>('CODE');
  const [lastResult, setLastResult] = useState<any | null>(null);

  const { data: attendanceData, isLoading, refetch, isFetching } = useDailyAttendance();
  const { mutateAsync: manualCheckIn, isPending: isCheckingIn } = useManualCheckIn();
  const { mutateAsync: scanQr, isPending: isScanning } = useScanQrAttendance();

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberCodeInput.trim()) return;

    try {
      const response = await manualCheckIn({ memberCode: memberCodeInput.trim() });
      setLastResult(response.data);
      setMemberCodeInput('');
    } catch (err: any) {
      // toast is already emitted by hook
    }
  };

  const handleQrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    try {
      const response = await scanQr(tokenInput.trim());
      setLastResult(response.data);
      setTokenInput('');
    } catch (err: any) {
      // toast is already emitted by hook
    }
  };

  const records = attendanceData?.records || [];
  const activeCount = attendanceData?.activeInGymCount ?? records.filter((r) => !r.checkOutTime).length;
  const totalCount = attendanceData?.totalCheckIns ?? records.length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Title & Live Status Metrics */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1c1c1c] border border-[#292929] text-[11px] font-semibold text-[#FFC21A] mb-2 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Turnstile Access Control</span>
          </div>
          <h1 className="text-3xl font-black text-[#F5F5F5] uppercase tracking-tight">
            Turnstile & Attendance Desk
          </h1>
          <p className="text-sm text-[#A5A5A5] mt-1">
            Real-time verified turnstile admissions via member codes or rotating digital QR tokens.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-5 py-3 rounded-2xl bg-[#171717] border border-[#292929] text-center min-w-[120px]">
            <span className="text-[10px] text-[#888] uppercase block font-mono font-semibold">Total Visits Today</span>
            <span className="text-2xl font-black font-mono tabular-nums text-[#FFC21A]">
              {totalCount}
            </span>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-[#171717] border border-emerald-500/20 text-center min-w-[120px]">
            <span className="text-[10px] text-emerald-400 uppercase block font-mono font-semibold flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Inside Gym
            </span>
            <span className="text-2xl font-black font-mono tabular-nums text-emerald-400">
              {activeCount}
            </span>
          </div>
        </div>
      </div>

      {/* Main Terminal & Live Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Check-in Terminal (5 cols) */}
        <div className="lg:col-span-5 bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
            <h3 className="text-lg font-bold text-[#F5F5F5] uppercase">Turnstile Terminal</h3>
            <div className="flex gap-1 bg-[#171717] p-1 rounded-xl border border-[#333]">
              <button
                type="button"
                onClick={() => setScanMode('CODE')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  scanMode === 'CODE' ? 'bg-[#FFC21A] text-black font-bold' : 'text-[#888]'
                }`}
              >
                Member Code
              </button>
              <button
                type="button"
                onClick={() => setScanMode('TOKEN')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  scanMode === 'TOKEN' ? 'bg-[#FFC21A] text-black font-bold' : 'text-[#888]'
                }`}
              >
                QR Pass
              </button>
            </div>
          </div>

          {/* Form */}
          {scanMode === 'CODE' ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-2">
                  Enter or Scan Member Code
                </label>
                <div className="relative">
                  <UserCheck className="w-5 h-5 text-[#FFC21A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. RV-2026-0001"
                    value={memberCodeInput}
                    onChange={(e) => setMemberCodeInput(e.target.value.toUpperCase())}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl pl-10 pr-3 py-3 text-sm font-mono text-[#F5F5F5] placeholder-[#666] focus:border-[#FFC21A] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#666] mt-1.5">
                  Type code or scan member barcode card. Supports instant Check-In & Check-Out.
                </p>
              </div>

              <button
                type="submit"
                disabled={isCheckingIn || !memberCodeInput.trim()}
                className="w-full py-3.5 rounded-xl bg-[#FFC21A] hover:bg-[#e5ad16] text-black font-extrabold text-sm transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-[#FFC21A]/20"
              >
                <span>{isCheckingIn ? 'Verifying Admission...' : 'Process Member Admission'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleQrSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-2">
                  Scan QR Digital ID Token
                </label>
                <div className="relative">
                  <QrCode className="w-5 h-5 text-[#FFC21A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Scan output (RV-QR-...)"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl pl-10 pr-3 py-3 text-xs font-mono text-[#F5F5F5] placeholder-[#666] focus:border-[#FFC21A] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#666] mt-1.5">
                  Point laser scanner at member's mobile Turnstile QR screen.
                </p>
              </div>

              <button
                type="submit"
                disabled={isScanning || !tokenInput.trim()}
                className="w-full py-3.5 rounded-xl bg-[#FFC21A] hover:bg-[#e5ad16] text-black font-extrabold text-sm transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-[#FFC21A]/20"
              >
                <span>{isScanning ? 'Verifying QR Token...' : 'Verify Digital QR Pass'}</span>
              </button>
            </form>
          )}

          {/* Recent Scan Feedback Card */}
          {lastResult && (
            <div className="bg-[#171717] p-5 rounded-2xl border border-emerald-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {lastResult.action === 'CHECK_OUT' ? 'CHECK-OUT CONFIRMED' : 'CHECK-IN VERIFIED'}
                </span>
                <span className="text-[11px] font-mono text-[#888]">
                  {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-[#F5F5F5]">{lastResult.member?.name}</h4>
                <div className="flex items-center gap-2 text-xs font-mono text-[#A5A5A5] mt-0.5">
                  <span className="text-[#FFC21A] font-bold">{lastResult.member?.code}</span>
                  <span>•</span>
                  <span>{lastResult.member?.planName}</span>
                </div>
              </div>

              {lastResult.durationMinutes !== undefined && (
                <div className="text-xs text-emerald-300 bg-emerald-950/30 p-2 rounded-lg border border-emerald-800/30">
                  Workout Session: <strong>{lastResult.durationMinutes} minutes</strong>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-[#222] text-xs text-[#777] space-y-1.5 leading-relaxed">
            <p>• <strong>Check-In:</strong> Validates active, unexpired membership in Narsobawadi timezone.</p>
            <p>• <strong>Duplicate Prevention:</strong> Blocks duplicate scans within 3 minutes of entry.</p>
            <p>• <strong>Check-Out:</strong> Scanning after workout records session duration and marks athlete exited.</p>
          </div>
        </div>

        {/* Right Column: Live Attendee Log (7 cols) */}
        <div className="lg:col-span-7 bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
            <h3 className="text-lg font-bold text-[#F5F5F5] uppercase border-l-2 border-[#FFC21A] pl-3">
              Today's Turnstile Ledger ({records.length})
            </h3>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center space-x-1.5 text-xs text-[#888] hover:text-[#FFC21A] transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-[#171717] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#888]">
              <Clock className="w-10 h-10 text-[#FFC21A] mx-auto mb-2 opacity-50" />
              <p>No check-ins recorded today yet.</p>
              <p className="text-[11px] text-[#666] mt-1">Use the terminal on the left to verify athletes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#A5A5A5]">
                <thead className="bg-[#171717] text-xs uppercase font-mono text-[#888] border-b border-[#292929]">
                  <tr>
                    <th className="py-3 px-4">Athlete</th>
                    <th className="py-3 px-4">Time In</th>
                    <th className="py-3 px-4">Time Out</th>
                    <th className="py-3 px-4">Floor Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {records.map((r: any) => {
                    const isInside = r.checkOutTime === null;

                    return (
                      <tr key={r.id} className="hover:bg-[#171717]/50 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#F5F5F5] text-xs">
                            {r.member?.user?.fullName || 'Verified Athlete'}
                          </p>
                          <p className="font-mono text-[11px] text-[#FFC21A]">
                            {r.member?.memberCode || '—'}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-[#F5F5F5]">
                          {new Date(r.checkInTime).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs">
                          {r.checkOutTime ? (
                            <span className="text-[#888]">
                              {new Date(r.checkOutTime).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          ) : (
                            <span className="text-[#555]">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono">
                          {isInside ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              IN GYM
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-800/40 border border-gray-700 text-gray-400">
                              ✓ COMPLETED
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
