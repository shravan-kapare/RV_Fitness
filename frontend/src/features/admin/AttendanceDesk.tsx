import React, { useState, useRef, useEffect } from 'react';
import {
  useDailyAttendance,
  useManualCheckIn,
  useScanQrAttendance,
  useAttendanceHistory,
} from '@/hooks/useAttendance';
import {
  QrCode,
  UserCheck,
  Clock,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Camera,
  CameraOff,
  Search,
  Calendar,
  History,
  Activity,
  ArrowRightLeft,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { formatDate } from '@/lib/formatters';
import toast from 'react-hot-toast';

export const AttendanceDesk: React.FC = () => {
  const [deskTab, setDeskTab] = useState<'TODAY' | 'HISTORY'>('TODAY');
  const [scanMode, setScanMode] = useState<'CODE' | 'TOKEN' | 'CAMERA'>('CODE');
  const [memberCodeInput, setMemberCodeInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [lastResult, setLastResult] = useState<any | null>(null);

  // Camera states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // History states
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState('');
  const [historyDateFrom, setHistoryDateFrom] = useState('');
  const [historyDateTo, setHistoryDateTo] = useState('');

  // Queries & Mutations
  const { data: attendanceData, isLoading, refetch, isFetching } = useDailyAttendance();
  const { data: historyResponse, isLoading: isLoadingHistory } = useAttendanceHistory({
    page: historyPage,
    limit: 15,
    search: historySearch || undefined,
    dateFrom: historyDateFrom || undefined,
    dateTo: historyDateTo || undefined,
  });

  const { mutateAsync: manualCheckIn, isPending: isCheckingIn } = useManualCheckIn();
  const { mutateAsync: scanQr, isPending: isScanning } = useScanQrAttendance();

  // Stop camera helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.message ||
          'Camera permission denied or camera device unavailable. Please allow access in browser settings or use manual input.'
      );
      setIsCameraActive(false);
    }
  };

  // Barcode / QR detection loop if BarcodeDetector is available
  useEffect(() => {
    let animId: number;
    let detector: any = null;

    if (isCameraActive && 'BarcodeDetector' in window) {
      try {
        detector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'code_128', 'ean_13'],
        });
      } catch (e) {
        console.warn('BarcodeDetector format error:', e);
      }
    }

    const checkFrame = async () => {
      if (isCameraActive && videoRef.current && detector && videoRef.current.readyState === 4) {
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const raw = barcodes[0].rawValue;
            if (raw) {
              stopCamera();
              if (raw.startsWith('RV-QR-')) {
                const res = await scanQr(raw);
                setLastResult(res.data);
              } else {
                const res = await manualCheckIn({ memberCode: raw.trim() });
                setLastResult(res.data);
              }
              return;
            }
          }
        } catch {
          // ignore detection frame errors
        }
      }
      if (isCameraActive) {
        animId = requestAnimationFrame(checkFrame);
      }
    };

    if (isCameraActive) {
      animId = requestAnimationFrame(checkFrame);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      stopCamera();
    };
  }, [isCameraActive]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberCodeInput.trim()) return;

    try {
      const response = await manualCheckIn({ memberCode: memberCodeInput.trim() });
      setLastResult(response.data);
      setMemberCodeInput('');
    } catch (err: any) {
      // toast is emitted by hook
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
      // toast is emitted by hook
    }
  };

  const records = attendanceData?.records || [];
  const activeCount =
    attendanceData?.activeInGymCount ?? records.filter((r: any) => !r.checkOutTime).length;
  const totalCount = attendanceData?.totalCheckIns ?? records.length;

  const historyRecords = historyResponse?.data || [];
  const historyTotalPages = historyResponse?.pagination?.totalPages || 1;

  const historyColumns: Column<any>[] = [
    {
      key: 'athlete',
      header: 'Athlete',
      render: (r: any) => (
        <div>
          <p className="font-bold text-white text-xs">{r.member?.user?.fullName || 'N/A'}</p>
          <p className="text-[10px] font-mono text-[#FFC21A]">{r.member?.memberCode}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (r: any) => <span className="text-xs text-[#A5A5A5]">{formatDate(r.date)}</span>,
    },
    {
      key: 'checkInTime',
      header: 'Time In',
      render: (r: any) => (
        <span className="font-mono text-xs text-white">
          {new Date(r.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      key: 'checkOutTime',
      header: 'Time Out',
      render: (r: any) => (
        <span className="font-mono text-xs text-[#A5A5A5]">
          {r.checkOutTime
            ? new Date(r.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            : '—'}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Admission Method',
      render: (r: any) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1C1C24] text-zinc-300 border border-white/5">
          {r.method === 'QR_CODE' ? '📱 Digital QR Pass' : '📋 Manual Desk'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: any) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            !r.checkOutTime
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          {!r.checkOutTime ? 'INSIDE GYM' : 'COMPLETED'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-fade-in">
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
            Real-time verified turnstile admissions via member codes, barcode scanners, or digital QR passes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-5 py-3 rounded-2xl bg-[#171717] border border-[#292929] text-center min-w-[120px]">
            <span className="text-[10px] text-[#888] uppercase block font-mono font-semibold">
              Visits Today
            </span>
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

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-[#292929] space-x-6">
        <button
          onClick={() => setDeskTab('TODAY')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition relative ${
            deskTab === 'TODAY' ? 'text-[#FFC21A]' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Today's Live Ledger
          {deskTab === 'TODAY' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFC21A]" />
          )}
        </button>

        <button
          onClick={() => setDeskTab('HISTORY')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition relative ${
            deskTab === 'HISTORY' ? 'text-[#FFC21A]' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Historical Records & Audit
          {deskTab === 'HISTORY' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFC21A]" />
          )}
        </button>
      </div>

      {deskTab === 'TODAY' ? (
        /* Main Terminal & Live Feed Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Check-in Terminal (5 cols) */}
          <div className="lg:col-span-5 bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
              <h3 className="text-lg font-bold text-[#F5F5F5] uppercase">Turnstile Terminal</h3>
              <div className="flex gap-1 bg-[#171717] p-1 rounded-xl border border-[#333]">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setScanMode('CODE');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    scanMode === 'CODE' ? 'bg-[#FFC21A] text-black font-bold' : 'text-[#888]'
                  }`}
                >
                  Code / Barcode
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setScanMode('TOKEN');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    scanMode === 'TOKEN' ? 'bg-[#FFC21A] text-black font-bold' : 'text-[#888]'
                  }`}
                >
                  Paste Token
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScanMode('CAMERA');
                    startCamera();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                    scanMode === 'CAMERA' ? 'bg-[#FFC21A] text-black font-bold' : 'text-[#888]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Camera</span>
                </button>
              </div>
            </div>

            {/* Mode 1: Manual Code or Laser Barcode Scanner */}
            {scanMode === 'CODE' && (
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
                    Type code or point laser scanner at member card. Supports instant Check-In & Check-Out.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isCheckingIn || !memberCodeInput.trim()}
                  isLoading={isCheckingIn}
                  className="w-full py-3.5 rounded-xl bg-[#FFC21A] hover:bg-[#e5ad16] text-black font-extrabold text-sm transition"
                >
                  <span>{isCheckingIn ? 'Verifying Admission...' : 'Process Member Admission'}</span>
                </Button>
              </form>
            )}

            {/* Mode 2: Paste QR Token */}
            {scanMode === 'TOKEN' && (
              <form onSubmit={handleQrSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-2">
                    Scan or Paste QR Token
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
                    Point 2D barcode scanner at member's mobile screen or paste token.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isScanning || !tokenInput.trim()}
                  isLoading={isScanning}
                  className="w-full py-3.5 rounded-xl bg-[#FFC21A] hover:bg-[#e5ad16] text-black font-extrabold text-sm transition"
                >
                  <span>{isScanning ? 'Verifying QR Token...' : 'Verify Digital QR Pass'}</span>
                </Button>
              </form>
            )}

            {/* Mode 3: Live Camera Viewfinder */}
            {scanMode === 'CAMERA' && (
              <div className="space-y-4">
                <div className="relative bg-black rounded-2xl overflow-hidden aspect-video border border-[#333] flex items-center justify-center">
                  {cameraError ? (
                    <div className="p-6 text-center text-xs text-zinc-400 space-y-2">
                      <CameraOff className="w-8 h-8 text-amber-500 mx-auto" />
                      <p className="font-bold text-white">Camera Unavailable</p>
                      <p className="text-[11px] text-zinc-500">{cameraError}</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={startCamera}
                        className="mt-2 text-xs"
                      >
                        Retry Camera
                      </Button>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {/* Scanning crosshair and laser effect */}
                      <div className="absolute inset-0 border-2 border-emerald-500/40 m-6 rounded-xl pointer-events-none flex items-center justify-center">
                        <div className="w-full h-0.5 bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50" />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs text-zinc-500">
                  <span>Hold member's QR code up to the camera lens.</span>
                  {isCameraActive && (
                    <Button variant="ghost" size="sm" onClick={stopCamera} className="text-xs">
                      Stop Camera
                    </Button>
                  )}
                </div>
              </div>
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
                  <div className="text-xs text-emerald-300 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/30 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Workout Completed: <strong>{lastResult.durationMinutes} minutes</strong>
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-[#222] text-xs text-[#777] space-y-1.5 leading-relaxed">
              <p>• <strong>Check-In:</strong> Verifies active membership in Asia/Kolkata timezone.</p>
              <p>• <strong>Duplicate Protection:</strong> Blocks duplicate check-ins within 3 minutes of entry.</p>
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
                <p className="text-[11px] text-[#666] mt-1">
                  Use the terminal on the left to admit athletes.
                </p>
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
                      const isInside = !r.checkOutTime;
                      return (
                        <tr key={r.id} className="hover:bg-[#171717] transition">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-[#F5F5F5] text-xs">
                              {r.member?.user?.fullName}
                            </p>
                            <p className="text-[10px] font-mono text-[#FFC21A]">
                              {r.member?.memberCode}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-white">
                            {new Date(r.checkInTime).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-[#888]">
                            {r.checkOutTime
                              ? new Date(r.checkOutTime).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                isInside
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-[#1c1c1c] text-[#888]'
                              }`}
                            >
                              {isInside ? 'INSIDE GYM' : 'CHECKED OUT'}
                            </span>
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
      ) : (
        /* Historical Records & Audit View */
        <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#F5F5F5] uppercase">
                Attendance Audit History
              </h3>
              <p className="text-xs text-[#A5A5A5] mt-0.5">
                Searchable registry of all past check-in sessions, duration, and verification logs
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#171717] p-3 rounded-xl border border-[#292929]">
            <SearchInput
              placeholder="Search member name, code, or phone..."
              value={historySearch}
              onChange={(val) => {
                setHistorySearch(val);
                setHistoryPage(1);
              }}
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">From:</span>
              <input
                type="date"
                value={historyDateFrom}
                onChange={(e) => {
                  setHistoryDateFrom(e.target.value);
                  setHistoryPage(1);
                }}
                className="bg-[#111111] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFC21A]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">To:</span>
              <input
                type="date"
                value={historyDateTo}
                onChange={(e) => {
                  setHistoryDateTo(e.target.value);
                  setHistoryPage(1);
                }}
                className="bg-[#111111] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFC21A]"
              />
            </div>
          </div>

          <Table
            columns={historyColumns}
            data={historyRecords}
            isLoading={isLoadingHistory}
            emptyMessage="No historical attendance records matching the criteria."
          />

          {historyTotalPages > 1 && (
            <div className="flex justify-end pt-2">
              <Pagination
                currentPage={historyPage}
                totalPages={historyTotalPages}
                onPageChange={setHistoryPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
