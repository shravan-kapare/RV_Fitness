import React, { useState } from 'react';
import { useMembers } from '@/hooks/useMembers';
import {
  Users,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  Edit2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  QrCode,
  CreditCard,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/formatters';
import { Member } from '@/types';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

export const MembersManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: 'Member@123456',
    gender: 'MALE',
    dateOfBirth: '2000-01-01',
    address: 'Narsobawadi, Shirol, Kolhapur',
    emergencyContact: '+91 98765 00000',
    notes: 'Registered at front desk',
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    phone: '',
    address: '',
    emergencyContact: '',
    notes: '',
    isActive: true,
  });

  const { data: response, isLoading } = useMembers({
    limit: 100,
    search: search || undefined,
    isActive: statusFilter === 'ACTIVE' ? true : statusFilter === 'INACTIVE' ? false : undefined,
  });

  const members: Member[] = response?.data || [];

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/members', {
        fullName: regForm.fullName.trim(),
        email: regForm.email.trim().toLowerCase(),
        phone: regForm.phone.trim(),
        password: regForm.password,
        gender: regForm.gender,
        dateOfBirth: regForm.dateOfBirth ? new Date(regForm.dateOfBirth).toISOString() : undefined,
        address: regForm.address.trim() || undefined,
        emergencyContact: regForm.emergencyContact.trim() || undefined,
        notes: regForm.notes.trim() || undefined,
      });

      toast.success('Member profile created successfully!');
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setIsRegisterOpen(false);
      setRegForm({
        fullName: '',
        email: '',
        phone: '',
        password: 'Member@123456',
        gender: 'MALE',
        dateOfBirth: '2000-01-01',
        address: 'Narsobawadi, Shirol, Kolhapur',
        emergencyContact: '+91 98765 00000',
        notes: '',
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Failed to register member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      setIsSubmitting(true);
      await api.patch(`/members/${editingMember.id}`, {
        address: editForm.address.trim() || undefined,
        emergencyContact: editForm.emergencyContact.trim() || undefined,
        notes: editForm.notes.trim() || undefined,
        isActive: editForm.isActive,
      });

      toast.success('Member details updated');
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setEditingMember(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (m: Member) => {
    setEditingMember(m);
    setEditForm({
      phone: m.user?.phone || '',
      address: m.address || '',
      emergencyContact: m.emergencyContact || '',
      notes: m.notes || '',
      isActive: m.isActive,
    });
  };

  const activeCount = members.filter((m) => m.isActive).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner & Control Bar */}
      <div className="bg-[#141418] p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#1A1A22] border border-white/10 text-[11px] font-mono font-bold text-[#FFC21A] mb-1.5">
            <Users className="w-3 h-3" />
            <span>ATHLETE ROSTER & ENROLLMENT</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Members Directory
          </h1>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Manage athlete credentials, profile biometrics, membership linkages, and contact files.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#101014] border border-white/10 text-center">
            <span className="text-[10px] font-mono text-[#737373] uppercase block font-semibold">Active Members</span>
            <span className="text-lg font-bold font-mono text-[#FFC21A] tabular-nums">
              {activeCount} / {members.length}
            </span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsRegisterOpen(true)}
            className="font-bold text-xs uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Register Member</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#141418] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, code, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#101014] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#FFC21A] transition"
          />
        </div>

        <div className="inline-flex items-center p-1 rounded-xl bg-[#101014] border border-white/10 text-xs font-mono self-start sm:self-auto">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase transition text-[11px] cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#1C1C24] text-[#FFC21A] border border-white/10 shadow'
                  : 'text-[#A5A5A5] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-[#141418] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center">
            <LoadingSpinner size="lg" />
            <p className="text-xs text-[#737373] mt-2">Loading member database...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-[#737373]">
            <Users className="w-12 h-12 mx-auto text-[#333] mb-3" />
            <h3 className="text-sm font-bold text-white uppercase">No Members Found</h3>
            <p className="text-xs text-[#A5A5A5] mt-1 max-w-sm mx-auto">
              {search ? 'No athlete matched your search criteria.' : 'Start by registering your first gym member above.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101014] text-[#737373] uppercase font-mono border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Member Code</th>
                  <th className="py-3.5 px-4 font-semibold">Athlete Name</th>
                  <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                  <th className="py-3.5 px-4 font-semibold">Enrollment</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#FFC21A]">
                      {m.memberCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block text-sm">
                        {m.user?.fullName || 'Gym Member'}
                      </span>
                      <span className="text-[11px] text-[#737373] font-mono">
                        {m.gender || 'ATHLETE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5 font-mono">
                      <div className="flex items-center gap-1.5 text-white">
                        <Phone className="w-3 h-3 text-[#FFC21A]" />
                        <span>{m.user?.phone || 'No phone'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#737373] text-[11px]">
                        <Mail className="w-3 h-3" />
                        <span>{m.user?.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#A5A5A5] font-mono">
                      {formatDate(m.joinDate)}
                    </td>
                    <td className="py-3.5 px-4">
                      {m.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold font-mono text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold font-mono text-[10px]">
                          INACTIVE
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(m)}
                          className="text-xs px-2.5 py-1 h-auto"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1 text-[#FFC21A]" />
                          <span>Edit</span>
                        </Button>
                        <Link to={`/invoices/create`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs px-2.5 py-1 h-auto font-mono text-[11px]"
                          >
                            <CreditCard className="w-3 h-3 mr-1" />
                            <span>Bill</span>
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Member Modal */}
      {isRegisterOpen && (
        <Modal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          title="Register New Gym Athlete"
          size="lg"
        >
          <form onSubmit={handleRegisterSubmit} className="space-y-4 p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                required
                placeholder="e.g. Rahul Patil"
                value={regForm.fullName}
                onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
              />

              <Input
                label="Email Address *"
                type="email"
                required
                placeholder="rahul.patil@example.com"
                value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone / WhatsApp *"
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={regForm.phone}
                onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
              />

              <Input
                label="Default Portal Password"
                type="text"
                value={regForm.password}
                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#CCCCCC]">
                  Gender
                </label>
                <select
                  value={regForm.gender}
                  onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                  className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFC21A]"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <Input
                label="Date of Birth"
                type="date"
                value={regForm.dateOfBirth}
                onChange={(e) => setRegForm({ ...regForm, dateOfBirth: e.target.value })}
              />
            </div>

            <Input
              label="Physical Address / Landmark"
              placeholder="e.g. Near Datta Mandir, Narsobawadi"
              value={regForm.address}
              onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
            />

            <Input
              label="Emergency Contact Phone"
              placeholder="+91 98765 43210"
              value={regForm.emergencyContact}
              onChange={(e) => setRegForm({ ...regForm, emergencyContact: e.target.value })}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#CCCCCC]">
                Registration Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Medical history, referral, or goals note..."
                value={regForm.notes}
                onChange={(e) => setRegForm({ ...regForm, notes: e.target.value })}
                className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#FFC21A] resize-none"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsRegisterOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                className="font-bold text-xs uppercase"
              >
                <span>Save & Register Athlete</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <Modal
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          title={`Edit Member Profile — ${editingMember.memberCode}`}
          size="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 p-2">
            <div>
              <p className="text-sm font-bold text-white">{editingMember.user?.fullName}</p>
              <p className="text-xs text-[#737373] font-mono">{editingMember.user?.email}</p>
            </div>

            <Input
              label="Address"
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
            />

            <Input
              label="Emergency Contact"
              value={editForm.emergencyContact}
              onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#CCCCCC]">
                Internal Notes
              </label>
              <textarea
                rows={2}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFC21A] resize-none"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="editActive"
                checked={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="w-4 h-4 accent-[#FFC21A] rounded"
              />
              <label htmlFor="editActive" className="text-xs text-white font-bold cursor-pointer">
                Active Member Account (Uncheck to freeze turnstile admissions)
              </label>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditingMember(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                className="font-bold text-xs uppercase"
              >
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
