import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle2, User, Clock, Users } from 'lucide-react';
import api from '@/lib/api';
import EmptyState from '@/components/EmptyState';

const iconFor = (type) => {
  switch (type) {
    case 'task_assigned': return { i: User, t: 'text-purple-300', b: 'bg-purple-500/10' };
    case 'task_completed': return { i: CheckCircle2, t: 'text-emerald-300', b: 'bg-emerald-500/10' };
    case 'deadline': return { i: Clock, t: 'text-amber-300', b: 'bg-amber-500/10' };
    case 'member_joined': return { i: Users, t: 'text-blue-300', b: 'bg-blue-500/10' };
    default: return { i: Bell, t: 'text-slate-300', b: 'bg-white/5' };
  }
};

const Notifications = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
  });
  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };
  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  const items = data?.notifications || [];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-2">Notifications</div>
          <h2>Your <span className="serif-highlight text-gradient">signals</span>.</h2>
        </div>
        {items.some((n) => !n.read) && (
          <button className="btn-secondary" onClick={markAllRead} data-testid="notifications-read-all">Mark all read</button>
        )}
      </div>

      {isLoading ? (
        <div className="min-h-[30vh] flex items-center justify-center"><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="All quiet" description="You're all caught up. New updates will show here." testId="empty-notifications" />
      ) : (
        <div className="space-y-2" data-testid="notifications-list">
          {items.map((n) => {
            const I = iconFor(n.type);
            return (
              <div key={n._id} className={`to-card p-4 flex items-start gap-3 cursor-pointer ${!n.read ? '!border-purple-500/30' : ''}`} onClick={() => !n.read && markRead(n._id)} data-testid={`notification-${n._id}`}>
                <div className={`w-9 h-9 rounded-lg border border-white/5 flex items-center justify-center ${I.b} ${I.t} shrink-0`}>
                  <I.i size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{n.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{n.message}</div>
                  <div className="text-[10px] text-slate-600 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shrink-0 mt-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
