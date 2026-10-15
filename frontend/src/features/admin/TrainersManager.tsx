import React, { useState } from 'react';
import {
  useTrainers,
  useCreateTrainer,
  useUpdateTrainer,
  useDeleteTrainer,
  useToggleTrainerPublish,
  useToggleTrainerAvailable,
} from '@/hooks/useTrainers';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Award,
  Star,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Shield,
  Dumbbell,
  Clock,
  Sparkles,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Trainer } from '@/types';
import toast from 'react-hot-toast';

export const TrainersManager: React.FC = () => {
  const { data: trainers = [], isLoading } = useTrainers();
  const { mutateAsync: createTrainer, isPending: isCreating } = useCreateTrainer();
  const { mutateAsync: updateTrainer, isPending: isUpdating } = useUpdateTrainer();
  const { mutateAsync: deleteTrainer, isPending: isDeleting } = useDeleteTrainer();
  const { mutateAsync: togglePublish } = useToggleTrainerPublish();
  const { mutateAsync: toggleAvailable } = useToggleTrainerAvailable();

  // Add Trainer Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: 'Trainer@123456',
    specialization: 'Strength & Conditioning',
    experienceYears: 3,
    certifications: 'ISSA / K11 Certified',
    bio: '',
    photoUrl: '',
  });

  // Edit Trainer Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTrainerId, setEditingTrainerId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    specialization: '',
    experienceYears: 0,
    certifications: '',
    rating: 5.0,
    bio: '',
    photoUrl: '',
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTrainer({
        fullName: addForm.fullName.trim(),
        email: addForm.email.trim().toLowerCase(),
        phone: addForm.phone.trim() || undefined,
        password: addForm.password,
        specialization: addForm.specialization.trim(),
        experienceYears: Number(addForm.experienceYears),
        certifications: addForm.certifications.trim() || undefined,
        bio: addForm.bio.trim() || undefined,
        photoUrl: addForm.photoUrl.trim() || undefined,
      });
      setAddModalOpen(false);
      setAddForm({
        fullName: '',
        email: '',
        phone: '',
        password: 'Trainer@123456',
        specialization: 'Strength & Conditioning',
        experienceYears: 3,
        certifications: 'ISSA / K11 Certified',
        bio: '',
        photoUrl: '',
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add coach');
    }
  };

  const openEditModal = (t: Trainer) => {
    setEditingTrainerId(t.id);
    setEditForm({
      fullName: t.user?.fullName || '',
      phone: t.user?.phone || '',
      specialization: t.specialization || '',
      experienceYears: t.experienceYears || 0,
      certifications: t.certifications || '',
      rating: Number(t.rating) || 5.0,
      bio: t.bio || '',
      photoUrl: t.photoUrl || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrainerId) return;

    try {
      await updateTrainer({
        id: editingTrainerId,
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        specialization: editForm.specialization.trim(),
        experienceYears: Number(editForm.experienceYears),
        certifications: editForm.certifications.trim() || undefined,
        rating: Number(editForm.rating),
        bio: editForm.bio.trim() || undefined,
        photoUrl: editForm.photoUrl.trim() || undefined,
      });
      setEditModalOpen(false);
      setEditingTrainerId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update coach');
    }
  };

  const handleDelete = async (t: Trainer) => {
    const name = t.user?.fullName || 'Coach';
    const confirmed = window.confirm(
      `Are you sure you want to remove or deactivate ${name}?\n\nIf active members or workout routines are assigned to this coach, their account will be safely deactivated and unlisted to protect athlete records.`
    );
    if (!confirmed) return;

    try {
      await deleteTrainer(t.id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to process coach');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1c1c1c] border border-[#292929] text-[11px] font-semibold text-[#FFC21A] mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Staff & Coaching Operations</span>
          </div>
          <h1 className="text-3xl font-black text-[#F5F5F5] uppercase tracking-tight">
            Trainer Roster & Staff Directory
          </h1>
          <p className="text-sm text-[#A5A5A5] mt-1">
            Provision trainer accounts with portal access, assign athlete capacity, and publish public credentials.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-[#FFC21A] hover:bg-[#e5ad16] text-black font-extrabold text-xs transition shadow-lg shadow-[#FFC21A]/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Onboard New Coach</span>
        </button>
      </div>

      {/* Roster Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : trainers.length === 0 ? (
        <div className="text-center py-20 bg-[#111111] border border-[#292929] rounded-3xl p-8">
          <Users className="w-12 h-12 text-[#FFC21A] mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-[#F5F5F5]">No Coaches Registered Yet</h3>
          <p className="text-sm text-[#888] mt-1 max-w-md mx-auto">
            Click 'Onboard New Coach' to create user accounts with trainer workspace privileges.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((t: any) => {
            const isAvailable = t.isAvailable !== false;
            const isPublished = t.isPublished !== false;

            return (
              <div
                key={t.id}
                className="bg-[#111111] border border-[#292929] hover:border-[#383838] rounded-3xl overflow-hidden flex flex-col justify-between transition group shadow-md"
              >
                <div>
                  {/* Photo & Status Banner */}
                  <div className="relative h-48 bg-[#171717] overflow-hidden flex items-center justify-center">
                    {t.photoUrl ? (
                      <img
                        src={t.photoUrl}
                        alt={t.user?.fullName}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-[#222222] border-2 border-[#333] flex items-center justify-center text-3xl font-black text-[#FFC21A]">
                        {t.user?.fullName?.charAt(0) || 'C'}
                      </div>
                    )}

                    {/* Top status badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border backdrop-blur-md ${
                          isAvailable
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {isAvailable ? 'Taking Athletes' : 'Unavailable'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border backdrop-blur-md ${
                          isPublished
                            ? 'bg-[#FFC21A]/20 text-[#FFC21A] border-[#FFC21A]/40'
                            : 'bg-gray-800/80 text-gray-400 border-gray-700'
                        }`}
                      >
                        {isPublished ? 'Public' : 'Hidden'}
                      </span>
                    </div>

                    {/* Rating badge */}
                    <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-[#333] text-xs font-bold text-[#FFC21A] flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[#FFC21A]" />
                      <span>{Number(t.rating).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#F5F5F5]">{t.user?.fullName}</h3>
                      <p className="text-xs font-semibold text-[#FFC21A] uppercase tracking-wider mt-0.5">
                        {t.specialization}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#A5A5A5]">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-[#777]" />
                        <span className="font-mono text-[11px] truncate">{t.user?.email}</span>
                      </div>
                      {t.user?.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3.5 h-3.5 text-[#777]" />
                          <span className="font-mono text-[11px]">{t.user?.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-[#777]" />
                        <span>
                          Experience: <strong className="text-[#F5F5F5]">{t.experienceYears} Years</strong>
                        </span>
                      </div>
                      {t.certifications && (
                        <div className="flex items-center space-x-2">
                          <Award className="w-3.5 h-3.5 text-[#FFC21A]" />
                          <span className="truncate">{t.certifications}</span>
                        </div>
                      )}
                    </div>

                    {t.bio && (
                      <p className="text-xs text-[#888] line-clamp-2 leading-relaxed border-t border-[#222] pt-3">
                        {t.bio}
                      </p>
                    )}

                    {/* Assigned athlete metrics */}
                    <div className="bg-[#171717] p-3 rounded-xl border border-[#292929] flex items-center justify-between text-xs">
                      <span className="text-[#888]">Assigned Athletes:</span>
                      <span className="font-mono font-bold text-[#FFC21A]">
                        {t._count?.assignedMembers ?? t.assignedMembers?.length ?? 0} Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="p-6 pt-0 border-t border-[#222] space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <button
                      onClick={() => toggleAvailable(t.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center space-x-1.5 ${
                        isAvailable
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {isAvailable ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{isAvailable ? 'Mark Busy' : 'Make Open'}</span>
                    </button>

                    <button
                      onClick={() => togglePublish(t.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center space-x-1.5 ${
                        isPublished
                          ? 'bg-gray-800/60 hover:bg-gray-800 text-gray-300 border-gray-700'
                          : 'bg-[#FFC21A]/10 hover:bg-[#FFC21A]/20 text-[#FFC21A] border-[#FFC21A]/30'
                      }`}
                    >
                      {isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isPublished ? 'Hide Site' : 'Show Site'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openEditModal(t)}
                      className="py-2 px-3 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-[#333] text-xs font-semibold text-[#F5F5F5] transition flex items-center justify-center space-x-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#FFC21A]" />
                      <span>Edit Coach</span>
                    </button>

                    <button
                      onClick={() => handleDelete(t)}
                      className="py-2 px-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 text-xs font-semibold text-rose-400 transition flex items-center justify-center space-x-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Add New Coach */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[#292929] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#222]">
              <h3 className="text-xl font-bold text-[#F5F5F5]">Onboard Trainer / Coach</h3>
              <span className="text-xs font-mono text-[#FFC21A]">Role: TRAINER</span>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Patil"
                    value={addForm.fullName}
                    onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Email (Login ID) *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. vikram@rvfitness.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Initial Password</label>
                  <input
                    type="text"
                    required
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm font-mono text-[#F5F5F5] focus:border-[#FFC21A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Specialization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hypertrophy & Powerlifting"
                    value={addForm.specialization}
                    onChange={(e) => setAddForm({ ...addForm, specialization: e.target.value })}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Experience (Years) *</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    required
                    value={addForm.experienceYears}
                    onChange={(e) => setAddForm({ ...addForm, experienceYears: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm font-mono text-[#F5F5F5] focus:border-[#FFC21A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Certifications</label>
                <input
                  type="text"
                  placeholder="e.g. ACE Certified Personal Trainer, CPR/AED"
                  value={addForm.certifications}
                  onChange={(e) => setAddForm({ ...addForm, certifications: e.target.value })}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={addForm.photoUrl}
                  onChange={(e) => setAddForm({ ...addForm, photoUrl: e.target.value })}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Coach Biography</label>
                <textarea
                  rows={3}
                  placeholder="Tell athletes about their coaching philosophy and athletic background..."
                  value={addForm.bio}
                  onChange={(e) => setAddForm({ ...addForm, bio: e.target.value })}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#888] hover:text-[#F5F5F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 bg-[#FFC21A] text-black font-bold text-xs rounded-xl hover:bg-[#e5ad16] transition"
                >
                  {isCreating ? 'Provisioning...' : 'Provision Coach Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Coach */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[#292929] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#F5F5F5]">Update Coach Profile</h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Specialization *</label>
                  <input
                    type="text"
                    required
                    value={editForm.specialization}
                    onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Experience (Years) *</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    required
                    value={editForm.experienceYears}
                    onChange={(e) => setEditForm({ ...editForm, experienceYears: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm font-mono text-[#F5F5F5] focus:border-[#FFC21A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Rating (1.0 to 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editForm.rating}
                    onChange={(e) => setEditForm({ ...editForm, rating: parseFloat(e.target.value) || 5.0 })}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm font-mono text-[#F5F5F5] focus:border-[#FFC21A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Certifications</label>
                  <input
                    type="text"
                    value={editForm.certifications}
                    onChange={(e) => setEditForm({ ...editForm, certifications: e.target.value })}
                    className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Photo URL</label>
                <input
                  type="url"
                  value={editForm.photoUrl}
                  onChange={(e) => setEditForm({ ...editForm, photoUrl: e.target.value })}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Biography</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A]"
                />
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
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-[#FFC21A] text-black font-bold text-xs rounded-xl hover:bg-[#e5ad16] transition"
                >
                  {isUpdating ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
