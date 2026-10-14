import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Lock, Mail, ArrowRight, AlertCircle, Shield } from 'lucide-react';
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
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid credentials. Please try again.';
      setError(msg);
    }
  };

  const handleFillDemo = (roleEmail: string, pass: string) => {
    setEmail(roleEmail);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Container */}
      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D97706] to-[#FBBF24] items-center justify-center shadow-xl shadow-amber-500/20 mb-4 border border-amber-400/30">
            <Dumbbell className="w-7 h-7 text-black stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            RV <span className="text-[#F59E0B]">FITNESS</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">
            Billing & Payment Management System
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Narsobawadi, Maharashtra
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Sign In to Billing Portal</h2>
            <p className="text-xs text-gray-400 mt-1">
              Authorized gym administrators and members only
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
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

          {/* Quick Demo Fill Buttons for Testing/Evaluation */}
          <div className="mt-8 pt-6 border-t border-[#262626]">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-3">
              <Shield className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Test Credentials (Demo Mode)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@rvfitness.com', 'Admin@123456')}
                className="px-3 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] border border-[#333] text-gray-300 text-left transition-colors"
              >
                <span className="block font-semibold text-white">Admin Staff</span>
                <span className="text-[10px] text-gray-400">admin@rvfitness.com</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('rohit.shinde@example.com', 'Member@123456')}
                className="px-3 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] border border-[#333] text-gray-300 text-left transition-colors"
              >
                <span className="block font-semibold text-white">Gym Member</span>
                <span className="text-[10px] text-gray-400">rohit.shinde@example.com</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Protected by Role-Based Authorization & Immutable Audit Logs</p>
          <p className="mt-1 text-[11px] text-gray-400">RV Fitness Billing Engine v1.0.0</p>
        </div>
      </div>
    </div>
  );
};
