import React, { useState } from 'react';
import { useMembershipPlans } from '@/hooks/useMembershipPlans';
import { useBenefits, useCreateBenefit } from '@/hooks/useTrainers';
import { formatCurrency } from '@/lib/formatters';
import { Package, Plus, Check, Sparkles, Tag, Layers, Edit2, Trash2, Power, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

export const PlansBenefitsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: plans = [], isLoading: isLoadingPlans } = useMembershipPlans();
  const { data: benefits = [], isLoading: isLoadingBenefits } = useBenefits();
  const { mutate: createBenefit, isPending: isCreatingBenefit } = useCreateBenefit();

  const [activeTab, setActiveTab] = useState<'PLANS' | 'BENEFITS'>('PLANS');

  // New Benefit form
  const [benefitName, setBenefitName] = useState('');
  const [benefitDesc, setBenefitDesc] = useState('');
  const [benefitCat, setBenefitCat] = useState('ACCESS');

  // New Plan form modal
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planDays, setPlanDays] = useState('30');
  const [planPriceRupees, setPlanPriceRupees] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);

  // Edit Plan modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDays, setEditDays] = useState('30');
  const [editPriceRupees, setEditPriceRupees] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editSelectedBenefits, setEditSelectedBenefits] = useState<string[]>([]);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  const handleBenefitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBenefit(
      {
        name: benefitName,
        description: benefitDesc,
        category: benefitCat,
      },
      {
        onSuccess: () => {
          setBenefitName('');
          setBenefitDesc('');
        },
      }
    );
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingPlan(true);
      const pricePaisa = Math.round(parseFloat(planPriceRupees) * 100);
      await api.post('/membership-plans', {
        name: planName,
        description: planDescription || undefined,
        durationDays: parseInt(planDays, 10),
        pricePaisa,
        taxRateBps: 1800,
        benefitIds: selectedBenefits.map((id, index) => ({
          benefitId: id,
          displayOrder: index + 1,
          isIncluded: true,
        })),
      });
      toast.success('Membership plan created');
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
      setPlanModalOpen(false);
      setPlanName('');
      setPlanPriceRupees('');
      setPlanDescription('');
      setSelectedBenefits([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to create plan');
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  const openEditModal = (plan: any) => {
    setEditingPlanId(plan.id);
    setEditName(plan.name);
    setEditDays(String(plan.durationDays));
    setEditPriceRupees(String(Math.round(Number(plan.pricePaisa) / 100)));
    setEditDescription(plan.description || '');
    setEditActive(plan.isActive ?? true);
    const existingBenefitIds = (plan.planBenefits || []).map((pb: any) => pb.benefitId || pb.benefit?.id).filter(Boolean);
    setEditSelectedBenefits(existingBenefitIds);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlanId) return;

    try {
      setIsUpdatingPlan(true);
      const pricePaisa = Math.round(parseFloat(editPriceRupees) * 100);
      await api.patch(`/membership-plans/${editingPlanId}`, {
        name: editName,
        description: editDescription || null,
        durationDays: parseInt(editDays, 10),
        pricePaisa,
        isActive: editActive,
        isPublished: editActive,
        benefitIds: editSelectedBenefits.map((id, index) => ({
          benefitId: id,
          displayOrder: index + 1,
          isIncluded: true,
        })),
      });
      toast.success(`Plan '${editName}' updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
      setEditModalOpen(false);
      setEditingPlanId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update plan');
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const handleToggleActive = async (plan: any) => {
    try {
      const response = await api.patch(`/membership-plans/${plan.id}/toggle-active`);
      toast.success(response.data.message || 'Plan status updated');
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle plan status');
    }
  };

  const handleDeletePlan = async (plan: any) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove or archive '${plan.name}'?\n\nIf members or invoices are linked, it will be safely archived to protect financial audit history.`
    );
    if (!confirmed) return;

    try {
      const response = await api.delete(`/membership-plans/${plan.id}`);
      toast.success(response.data.message || 'Plan processed');
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete plan');
    }
  };

  const toggleBenefit = (id: string) => {
    if (selectedBenefits.includes(id)) {
      setSelectedBenefits(selectedBenefits.filter((b) => b !== id));
    } else {
      setSelectedBenefits([...selectedBenefits, id]);
    }
  };

  const toggleEditBenefit = (id: string) => {
    if (editSelectedBenefits.includes(id)) {
      setEditSelectedBenefits(editSelectedBenefits.filter((b) => b !== id));
    } else {
      setEditSelectedBenefits([...editSelectedBenefits, id]);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Title */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-[#FFC21A] uppercase tracking-wider">
            Tier & Privilege Architecture
          </span>
          <h1 className="text-3xl font-black text-[#F5F5F5] uppercase mt-1">
            Plans & Benefits Manager
          </h1>
          <p className="text-sm text-[#A5A5A5] mt-1">
            Configure membership pricing, duration days, and dynamically attach reusable privileges.
          </p>
        </div>

        <div className="flex gap-2">
          {activeTab === 'PLANS' ? (
            <button
              onClick={() => setPlanModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#FFC21A] hover:bg-[#e5ad16] text-black font-bold text-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Membership Tier</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('PLANS')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'PLANS'
              ? 'bg-[#FFC21A] text-black shadow'
              : 'bg-[#111111] text-[#888] hover:text-[#F5F5F5] border border-[#292929]'
          }`}
        >
          Membership Plans ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab('BENEFITS')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'BENEFITS'
              ? 'bg-[#FFC21A] text-black shadow'
              : 'bg-[#111111] text-[#888] hover:text-[#F5F5F5] border border-[#292929]'
          }`}
        >
          Reusable Privileges ({benefits.length})
        </button>
      </div>

      {/* 1. PLANS TAB */}
      {activeTab === 'PLANS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p: any) => {
            const isActive = p.isActive !== false;
            return (
              <div
                key={p.id}
                className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between transition ${
                  isActive
                    ? 'bg-[#111111] border-[#292929] hover:border-[#383838]'
                    : 'bg-[#0d0d0d] border-rose-950/40 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#888]">{p.durationDays} Days Duration</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {isActive ? 'ACTIVE' : 'ARCHIVED'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-[#F5F5F5] uppercase mt-2">{p.name}</h3>
                  {p.description && (
                    <p className="text-xs text-[#888] mt-1 line-clamp-2">{p.description}</p>
                  )}

                  <div className="my-4 pb-4 border-b border-[#222]">
                    <span className="text-3xl font-black font-mono tabular-nums text-[#FFC21A]">
                      {formatCurrency(p.pricePaisa)}
                    </span>
                    <span className="text-xs text-[#888] font-mono ml-2">/ {p.durationDays} Days</span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider block">
                      Attached Privileges:
                    </span>
                    {p.planBenefits && p.planBenefits.length > 0 ? (
                      p.planBenefits.map((pb: any) => (
                        <div key={pb.id} className="flex items-center space-x-2 text-xs text-[#CCCCCC]">
                          <Check className="w-3.5 h-3.5 text-[#FFC21A] shrink-0" />
                          <span className="font-medium">
                            {pb.benefit?.name || pb.benefit?.title || pb.title || 'Gym Privilege'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#666] italic">No specific privileges attached.</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#222] space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#888]">
                    <span>GST: 18% included</span>
                    <span className="font-mono">{p.isPublished ? 'Published' : 'Hidden'}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1c1c1c]">
                    <button
                      onClick={() => openEditModal(p)}
                      className="inline-flex items-center justify-center space-x-1 py-2 px-2.5 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-[#333] text-xs font-semibold text-[#F5F5F5] transition"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#FFC21A]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`inline-flex items-center justify-center space-x-1 py-2 px-2.5 rounded-xl border text-xs font-semibold transition ${
                        isActive
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Archive' : 'Restore'}</span>
                    </button>
                    <button
                      onClick={() => handleDeletePlan(p)}
                      className="inline-flex items-center justify-center space-x-1 py-2 px-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 text-xs font-semibold text-rose-400 transition"
                      title="Safely remove or archive tier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. BENEFITS TAB */}
      {activeTab === 'BENEFITS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] space-y-4">
            <h3 className="text-lg font-bold text-[#F5F5F5] uppercase border-l-2 border-[#FFC21A] pl-3">
              Add New Privilege
            </h3>
            <form onSubmit={handleBenefitSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Privilege Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Hydro-Massage Lounge"
                  value={benefitName}
                  onChange={(e) => setBenefitName(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Category</label>
                <select
                  value={benefitCat}
                  onChange={(e) => setBenefitCat(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                >
                  <option value="ACCESS">ACCESS</option>
                  <option value="COACHING">COACHING</option>
                  <option value="AMENITY">AMENITY</option>
                  <option value="NUTRITION">NUTRITION</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={benefitDesc}
                  onChange={(e) => setBenefitDesc(e.target.value)}
                  placeholder="Details of the perk..."
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingBenefit}
                className="w-full py-3 bg-[#FFC21A] text-black font-bold text-xs rounded-xl hover:bg-[#e5ad16] transition"
              >
                {isCreatingBenefit ? 'Saving...' : 'Create Privilege'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929]">
            <h3 className="text-lg font-bold text-[#F5F5F5] uppercase border-l-2 border-[#FFC21A] pl-3 mb-6">
              Registered Gym Privileges
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((b: any) => (
                <div key={b.id} className="bg-[#171717] p-4 rounded-xl border border-[#292929] flex items-start space-x-3">
                  <Check className="w-4 h-4 text-[#FFC21A] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#F5F5F5]">{b.name || b.title}</h4>
                    <span className="text-[10px] font-mono text-[#FFC21A]">{b.category || 'ACCESS'}</span>
                    {b.description && (
                      <p className="text-xs text-[#888] mt-1">{b.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: New Membership Plan */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[#292929] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4">
            <h3 className="text-xl font-bold text-[#F5F5F5]">Create Membership Tier</h3>
            <form onSubmit={handlePlanSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Plan Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6-Month Semi-Annual Pro"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Ideal for disciplined transformations"
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Duration (Days) *</label>
                  <input
                    type="number"
                    required
                    value={planDays}
                    onChange={(e) => setPlanDays(e.target.value)}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm font-mono text-[#F5F5F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 10000"
                    value={planPriceRupees}
                    onChange={(e) => setPlanPriceRupees(e.target.value)}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm font-mono text-[#F5F5F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-2">
                  Attach Privileges:
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2 bg-[#171717] p-3 rounded-xl border border-[#333]">
                  {benefits.map((b: any) => (
                    <label key={b.id} className="flex items-center space-x-2 text-xs text-[#CCC] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBenefits.includes(b.id)}
                        onChange={() => toggleBenefit(b.id)}
                        className="rounded border-[#444] text-[#FFC21A] focus:ring-0"
                      />
                      <span>{b.name || b.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#888] hover:text-[#F5F5F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPlan}
                  className="px-5 py-2 bg-[#FFC21A] text-black font-bold text-xs rounded-xl hover:bg-[#e5ad16] transition"
                >
                  {isSubmittingPlan ? 'Creating...' : 'Create Tier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Membership Plan */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[#292929] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4">
            <h3 className="text-xl font-bold text-[#F5F5F5]">Edit Membership Plan</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Plan Title *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Duration (Days) *</label>
                  <input
                    type="number"
                    required
                    value={editDays}
                    onChange={(e) => setEditDays(e.target.value)}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm font-mono text-[#F5F5F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={editPriceRupees}
                    onChange={(e) => setEditPriceRupees(e.target.value)}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm font-mono text-[#F5F5F5]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="editPlanActive"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="rounded border-[#444] text-[#FFC21A] focus:ring-0"
                />
                <label htmlFor="editPlanActive" className="text-xs font-semibold text-[#CCC] cursor-pointer">
                  Plan is Active and Available for Public Registration
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-2">
                  Attach Privileges:
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2 bg-[#171717] p-3 rounded-xl border border-[#333]">
                  {benefits.map((b: any) => (
                    <label key={b.id} className="flex items-center space-x-2 text-xs text-[#CCC] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editSelectedBenefits.includes(b.id)}
                        onChange={() => toggleEditBenefit(b.id)}
                        className="rounded border-[#444] text-[#FFC21A] focus:ring-0"
                      />
                      <span>{b.name || b.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#888] hover:text-[#F5F5F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPlan}
                  className="px-5 py-2 bg-[#FFC21A] text-black font-bold text-xs rounded-xl hover:bg-[#e5ad16] transition"
                >
                  {isUpdatingPlan ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
