import React, { useState } from 'react';
import { 
  useMemberships, 
  useExpiringMemberships, 
  useFreezeMembership, 
  useUnfreezeMembership, 
  useRenewMembership, 
  useCancelMembership 
} from '@/hooks/useMemberships';
import { useMembershipPlans } from '@/hooks/useMembershipPlans';
import { 
  UserCheck, 
  PauseCircle, 
  PlayCircle, 
  RotateCw, 
  XCircle, 
  Clock, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MembershipsRenewals: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'EXPIRING' | 'ACTIVE' | 'FROZEN'>('ALL');
  const [selectedMembership, setSelectedMembership] = useState<any>(null);
  const [modalAction, setModalAction] = useState<'FREEZE' | 'RENEW' | null>(null);

  // Form states
  const [freezeDays, setFreezeDays] = useState('14');
  const [freezeReason, setFreezeReason] = useState('College examinations / out of town');
  const [renewPlanId, setRenewPlanId] = useState('');

  const { data: allMemberships = [], isLoading: isLoadingAll } = useMemberships();
  const { data: expiringMemberships = [], isLoading: isLoadingExpiring } = useExpiringMemberships(14);
  const { data: plans = [] } = useMembershipPlans();

  const { mutate: freezeMem, isPending: isFreezing } = useFreezeMembership();
  const { mutate: unfreezeMem, isPending: isUnfreezing } = useUnfreezeMembership();
  const { mutate: renewMem, isPending: isRenewing } = useRenewMembership();
  const { mutate: cancelMem, isPending: isCancelling } = useCancelMembership();

  const displayedList = filter === 'EXPIRING'
    ? expiringMemberships
    : filter === 'ACTIVE'
      ? allMemberships.filter((m: any) => m.status === 'ACTIVE')
      : filter === 'FROZEN'
        ? allMemberships.filter((m: any) => m.status === 'FROZEN')
        : allMemberships;

  const handleFreezeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMembership) return;
    freezeMem({
      id: selectedMembership.id,
      freezeDays: parseInt(freezeDays, 10),
      reason: freezeReason,
    }, {
      onSuccess: () => {
        setModalAction(null);
      }
    });
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMembership) return;
    renewMem({
      id: selectedMembership.id,
      newPlanId: renewPlanId || undefined,
    }, {
      onSuccess: () => {
        setModalAction(null);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-[#FFC21A] uppercase tracking-wider">
            Membership Lifecycle
          </span>
          <h1 className="text-3xl font-black text-[#F5F5F5] uppercase mt-1">
            Subscriptions & Renewals
          </h1>
          <p className="text-sm text-[#A5A5A5] mt-1">
            Manage contract extensions, freeze periods, and expiring membership notices.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="px-4 py-2 rounded-xl bg-[#171717] border border-[#292929] text-center">
            <span className="text-[10px] text-[#888] uppercase block">Expiring (14d)</span>
            <span className="text-lg font-black font-mono text-[#FFC21A]">
              {expiringMemberships.length}
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#171717] border border-[#292929] text-center">
            <span className="text-[10px] text-[#888] uppercase block">Total Active</span>
            <span className="text-lg font-black font-mono text-emerald-400">
              {allMemberships.filter((m: any) => m.status === 'ACTIVE').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['ALL', 'EXPIRING', 'ACTIVE', 'FROZEN'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              filter === tab
                ? 'bg-[#FFC21A] text-black shadow'
                : 'bg-[#111111] text-[#888] hover:text-[#F5F5F5] border border-[#292929]'
            }`}
          >
            {tab === 'EXPIRING' ? 'Expiring Soon (14d)' : tab}
          </button>
        ))}
      </div>

      {/* Memberships Table */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#A5A5A5]">
            <thead className="bg-[#171717] text-xs uppercase font-mono text-[#888] border-b border-[#292929]">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Current Plan</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">End Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {displayedList.map((m: any) => (
                <tr key={m.id} className="hover:bg-[#171717]/50 transition">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-[#F5F5F5]">{m.member?.user?.fullName || 'Member'}</p>
                    <span className="text-xs font-mono text-[#FFC21A]">{m.member?.memberCode}</span>
                  </td>
                  <td className="py-3 px-4 text-[#F5F5F5]">{m.plan?.name || 'Standard'}</td>
                  <td className="py-3 px-4 font-mono text-xs">
                    {new Date(m.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[#F5F5F5]">
                    {new Date(m.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                        m.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : m.status === 'FROZEN'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMembership(m);
                        setRenewPlanId(m.planId);
                        setModalAction('RENEW');
                      }}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222] border border-[#333] text-xs text-[#FFC21A] font-semibold transition"
                      title="Renew Membership"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Renew</span>
                    </button>

                    {m.status === 'ACTIVE' ? (
                      <button
                        onClick={() => {
                          setSelectedMembership(m);
                          setModalAction('FREEZE');
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222] border border-[#333] text-xs text-[#A5A5A5] hover:text-[#F5F5F5] font-semibold transition"
                        title="Freeze Membership"
                      >
                        <PauseCircle className="w-3.5 h-3.5" />
                        <span>Freeze</span>
                      </button>
                    ) : m.status === 'FROZEN' ? (
                      <button
                        onClick={() => unfreezeMem(m.id)}
                        disabled={isUnfreezing}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 font-semibold text-xs transition"
                        title="Unfreeze Membership"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Unfreeze</span>
                      </button>
                    ) : null}

                    {m.status !== 'CANCELLED' && (
                      <button
                        onClick={() => {
                          if (confirm(`Cancel membership for ${m.member?.user?.fullName}?`)) {
                            cancelMem(m.id);
                          }
                        }}
                        className="inline-flex items-center space-x-1 px-2 py-1.5 text-xs text-[#666] hover:text-red-400 transition"
                        title="Cancel Membership"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Freeze */}
      {modalAction === 'FREEZE' && selectedMembership && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[#292929] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
              <h3 className="text-xl font-bold text-[#F5F5F5]">Freeze Membership</h3>
              <button onClick={() => setModalAction(null)} className="text-[#888] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleFreezeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">
                  Freeze Duration (Days) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  required
                  value={freezeDays}
                  onChange={(e) => setFreezeDays(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Reason *</label>
                <input
                  type="text"
                  required
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setModalAction(null)}
                  className="px-4 py-2 text-xs text-[#888]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFreezing}
                  className="px-6 py-2 bg-[#FFC21A] text-black font-bold text-xs rounded-xl hover:bg-[#e5ad16] transition disabled:opacity-50"
                >
                  {isFreezing ? 'Freezing...' : 'Confirm Freeze'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Renew */}
      {modalAction === 'RENEW' && selectedMembership && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[#292929] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
              <h3 className="text-xl font-bold text-[#F5F5F5]">Renew Membership</h3>
              <button onClick={() => setModalAction(null)} className="text-[#888] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRenewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Select Plan</label>
                <select
                  value={renewPlanId}
                  onChange={(e) => setRenewPlanId(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
                >
                  {plans.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.durationDays} Days)
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-[#888] leading-relaxed">
                Renewing extends the end date from the current expiration date and generates a corresponding renewal invoice automatically.
              </p>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setModalAction(null)}
                  className="px-4 py-2 text-xs text-[#888]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRenewing}
                  className="px-6 py-2 bg-[#FFC21A] text-black font-bold text-xs rounded-xl hover:bg-[#e5ad16] transition disabled:opacity-50"
                >
                  {isRenewing ? 'Renewing...' : 'Confirm Renewal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
