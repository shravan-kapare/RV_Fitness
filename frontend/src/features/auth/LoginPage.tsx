import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password');
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
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Invalid credentials. Please verify your email and password.';
      setError(msg);
    }
  };

  const handleFillDemo = (roleEmail: string, pass: string) => {
    setEmail(roleEmail);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col justify-center items-center p-4 relative select-none">
      {/* Container */}
      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-[#FFC21A] items-center justify-center shadow-lg shadow-[#FFC21A]/10 mb-2">
            <Dumbbell className="w-6 h-6 text-[#080808] stroke-[2.5]" />
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-2xl font-black tracking-tight text-[#F5F5F5]">
              RV <span className="text-[#FFC21A]">FITNESS</span>
            </h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1C1C1C] text-[#A5A5A5] border border-[#292929]">
              BILLING
            </span>
          </div>
          <p className="text-xs text-[#A5A5A5]">
            Narsobawadi, Kolhapur District, Maharashtra
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111111] border border-[#292929] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#F5F5F5] tracking-tight">Sign In to Billing Portal</h2>
            <p className="text-xs text-[#A5A5A5] mt-1">
              Authorized gym administrators and members only
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Authentication Failed</span>
                <span className="text-rose-300/90">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Staff / Member Email"
              type="email"
              placeholder="admin@rvfitness.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Secure Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full justify-center text-sm font-semibold h-11"
              >
                <span>Access Portal</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>

          {/* Test Credentials Demo Mode */}
          <div className="mt-6 pt-5 border-t border-[#222222]">
            <div className="flex items-center gap-1.5 text-xs text-[#A5A5A5] font-semibold mb-3">
              <Shield className="w-3.5 h-3.5 text-[#FFC21A]" />
              <span>Test Credentials (Demo Mode)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@rvfitness.com', 'Admin@123456')}
                className="p-2 rounded-lg bg-[#171717] hover:bg-[#1E1E1E] border border-[#292929] hover:border-[#383838] text-left transition-colors cursor-pointer"
              >
                <span className="block font-semibold text-[#F5F5F5] text-[11px]">Admin Staff</span>
                <span className="text-[9px] text-[#737373] truncate block">admin@</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('trainer@rvfitness.com', 'Trainer@123456')}
                className="p-2 rounded-lg bg-[#171717] hover:bg-[#1E1E1E] border border-[#292929] hover:border-[#383838] text-left transition-colors cursor-pointer"
              >
                <span className="block font-semibold text-[#F5F5F5] text-[11px]">Trainer</span>
                <span className="text-[9px] text-[#737373] truncate block">trainer@</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('rohit.shinde@example.com', 'Member@123456')}
                className="p-2 rounded-lg bg-[#171717] hover:bg-[#1E1E1E] border border-[#292929] hover:border-[#383838] text-left transition-colors cursor-pointer"
              >
                <span className="block font-semibold text-[#F5F5F5] text-[11px]">Member</span>
                <span className="text-[9px] text-[#737373] truncate block">rohit@</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-[#737373] space-y-1">
          <p>Protected by Server-Enforced Role-Based Authorization</p>
          <p className="text-[11px] text-[#525252]">RV Fitness Billing Engine • Narsobawadi</p>
        </div>
      </div>
    </div>
  );
};
