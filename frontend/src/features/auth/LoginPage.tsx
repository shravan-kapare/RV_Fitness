import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Dumbbell,
  ArrowRight,
  AlertCircle,
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both your registered email and password.');
      return;
    }

    try {
      await login(email, password);
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === 'TRAINER') {
        navigate('/trainer');
      } else if (currentUser?.role === 'MEMBER') {
        navigate('/member');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify your credentials or contact gym admin.';
      setError(msg);
    }
  };

  const handleFillDemo = (roleEmail: string, pass: string) => {
    setEmail(roleEmail);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col lg:flex-row text-[#F5F5F5] select-none relative">
      {/* Back to Home floating button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-30 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#141418]/80 hover:bg-[#1A1A22] border border-white/10 text-xs font-semibold text-[#CCCCCC] transition backdrop-blur-md"
      >
        <ChevronLeft className="w-4 h-4 text-[#FFC21A]" />
        <span>Return to Website</span>
      </Link>

      {/* Left Column: Athletic Editorial Showcase (Hidden on Mobile, 55% on Large screens) */}
      <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden flex-col justify-between p-12 xl:p-16 border-r border-white/10">
        {/* Full-bleed Gym Background */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop')`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/90 via-[#080808]/75 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/60 pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#16161A]/80 border border-white/10 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#FFC21A]" />
            <span className="text-xs font-mono font-semibold tracking-wider text-[#D4D4D4] uppercase">
              Narsobawadi • High Performance System
            </span>
          </div>
        </div>

        {/* Center Editorial Quote */}
        <div className="relative z-10 max-w-xl space-y-5">
          <h2 className="text-4xl xl:text-5xl font-black uppercase text-white tracking-tight leading-[1.05]">
            POWERED BY <br />
            <span className="text-[#FFC21A]">PRECISION</span> & PURPOSE.
          </h2>
          <p className="text-base text-[#D4D4D4] leading-relaxed">
            Access your unified fitness portal. Real-time biometric attendance tracking, personal workout regimes, body composition metrics, and transparent billing operations.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-[#141418]/80 border border-white/10 backdrop-blur-md space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#737373] tracking-widest block">
                Security Standard
              </span>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#FFC21A]" />
                Role-Enforced Access
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#141418]/80 border border-white/10 backdrop-blur-md space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#737373] tracking-widest block">
                Financial Protocol
              </span>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FFC21A]" />
                BigInt Precision Ledger
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Facility Coordinates */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[#888888] border-t border-white/10 pt-6">
          <span>RV FITNESS CENTER • NARSOBAWADI</span>
          <span>SYSTEM VERSION 2.4.0</span>
        </div>
      </div>

      {/* Right Column: High-End Authentication Card (45% on Large, Full on Mobile) */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFC21A] flex items-center justify-center shadow-lg shadow-[#FFC21A]/20">
                <Dumbbell className="w-5 h-5 text-[#080808] stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-black uppercase tracking-tight text-white block">
                  RV <span className="text-[#FFC21A]">FITNESS</span>
                </span>
                <span className="text-[10px] font-mono tracking-widest text-[#737373] uppercase">
                  MANAGEMENT PORTAL
                </span>
              </div>
            </div>

            <div className="pt-2">
              <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                Sign In to Account
              </h1>
              <p className="text-xs sm:text-sm text-[#A5A5A5] mt-1">
                Enter your credentials to enter your role-specific dashboard.
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/60 flex items-start gap-3 text-xs text-rose-300 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block">Access Denied</span>
                <span className="text-rose-200/90">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#CCCCCC]">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@rvfitness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#141418] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#FFC21A] transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#CCCCCC]">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#141418] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#FFC21A] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#737373] hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full justify-center h-12 text-xs font-black uppercase tracking-wider bg-[#FFC21A] text-[#080808] hover:bg-[#e0a816] shadow-xl shadow-[#FFC21A]/15 cursor-pointer"
              >
                <span>Authenticate & Enter</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-6 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-[#A5A5A5] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#FFC21A]" />
                Demo Credentials Shortcut
              </span>
              <span className="text-[10px] font-mono text-[#737373]">1-Click Autofill</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@rvfitness.com', 'Admin@123456')}
                className="p-3 rounded-xl bg-[#141418] hover:bg-[#1A1A22] border border-white/10 hover:border-[#FFC21A]/50 text-left transition duration-200 cursor-pointer group"
              >
                <span className="block text-xs font-bold text-white group-hover:text-[#FFC21A] transition">
                  Admin
                </span>
                <span className="text-[10px] font-mono text-[#737373] truncate block mt-0.5">
                  admin@
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('trainer@rvfitness.com', 'Trainer@123456')}
                className="p-3 rounded-xl bg-[#141418] hover:bg-[#1A1A22] border border-white/10 hover:border-[#FFC21A]/50 text-left transition duration-200 cursor-pointer group"
              >
                <span className="block text-xs font-bold text-white group-hover:text-[#FFC21A] transition">
                  Trainer
                </span>
                <span className="text-[10px] font-mono text-[#737373] truncate block mt-0.5">
                  trainer@
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('rohit.shinde@example.com', 'Member@123456')}
                className="p-3 rounded-xl bg-[#141418] hover:bg-[#1A1A22] border border-white/10 hover:border-[#FFC21A]/50 text-left transition duration-200 cursor-pointer group"
              >
                <span className="block text-xs font-bold text-white group-hover:text-[#FFC21A] transition">
                  Member
                </span>
                <span className="text-[10px] font-mono text-[#737373] truncate block mt-0.5">
                  rohit@
                </span>
              </button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[11px] font-mono text-[#525252]">
            Protected by Cryptographic JWT & Server Sessions • RV Fitness
          </div>
        </div>
      </div>
    </div>
  );
};
