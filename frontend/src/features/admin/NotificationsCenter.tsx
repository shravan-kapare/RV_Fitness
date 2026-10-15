import React, { useState } from 'react';
import { useBroadcastNotification, useMyNotifications } from '@/hooks/useNotifications';
import { Bell, Send, Users, ShieldAlert, Sparkles, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const NotificationsCenter: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('INFO');
  const [targetType, setTargetType] = useState('ALL');

  const { data: notifications = [], isLoading } = useMyNotifications();
  const { mutate: broadcast, isPending: isBroadcasting } = useBroadcastNotification();

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    broadcast({
      title,
      message,
      type,
      targetType,
    }, {
      onSuccess: () => {
        setTitle('');
        setMessage('');
      }
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929]">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#FFC21A] uppercase tracking-wider mb-2">
          <Bell className="w-4 h-4" />
          <span>Communications Hub</span>
        </div>
        <h1 className="text-3xl font-black text-[#F5F5F5] uppercase">
          Broadcast Notifications
        </h1>
        <p className="text-sm text-[#A5A5A5] mt-1">
          Deliver instant announcements, schedule changes, or payment reminders to member & trainer dashboards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Broadcast Dispatcher */}
        <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] space-y-6">
          <h2 className="text-xl font-bold text-[#F5F5F5] uppercase border-l-2 border-[#FFC21A] pl-3">
            Dispatch Broadcast
          </h2>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Target Audience</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
              >
                <option value="ALL">All Members & Trainers</option>
                <option value="MEMBERS_ONLY">Members Only</option>
                <option value="TRAINERS_ONLY">Trainers Only</option>
                <option value="ADMIN_ONLY">Admins Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Notification Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
              >
                <option value="INFO">Information / Notice</option>
                <option value="WARNING">Warning / Maintenance</option>
                <option value="SUCCESS">Success / Achievement</option>
                <option value="ALERT">Urgent Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Announcement Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Special Holiday Hours / New Equipment Arrival"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#888] uppercase mb-1">Message Content *</label>
              <textarea
                rows={4}
                required
                placeholder="Write the full broadcast announcement..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-[#171717] border border-[#333] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#FFC21A] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isBroadcasting}
              className="w-full py-3.5 rounded-xl bg-[#FFC21A] hover:bg-[#e5ad16] text-black font-extrabold text-sm flex items-center justify-center space-x-2 transition disabled:opacity-50 shadow-lg shadow-[#FFC21A]/20"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>{isBroadcasting ? 'Broadcasting...' : 'Send Broadcast'}</span>
            </button>
          </form>
        </div>

        {/* History Feed */}
        <div className="lg:col-span-2 bg-[#111111] p-6 sm:p-8 rounded-3xl border border-[#292929] space-y-6">
          <h2 className="text-xl font-bold text-[#F5F5F5] uppercase border-l-2 border-[#FFC21A] pl-3">
            Recent Alerts & Dispatches
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-[#171717] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#888]">
              <p>No past broadcast history found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n: any) => (
                <div key={n.id} className="bg-[#171717] p-5 rounded-2xl border border-[#292929] space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-[#F5F5F5]">{n.title}</h4>
                    <span className="text-[10px] font-mono text-[#888]">
                      {new Date(n.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-[#A5A5A5] leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
