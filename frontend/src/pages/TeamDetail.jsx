import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Copy, ChevronRight, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const TeamDetail = () => {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: async () => (await api.get(`/teams/${id}`)).data,
  });

  if (isLoading) return <div className="min-h-[40vh] flex items-center justify-center"><div className="spinner" /></div>;
  const t = data?.team;
  if (!t) return <div className="text-slate-400">Team not found.</div>;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Link to="/app/teams" className="hover:text-white">Teams</Link>
          <ChevronRight size={12} />
          <span>{t.name}</span>
        </div>
        <h2>{t.name}</h2>
        <p className="text-slate-400 mt-2">{t.description || 'No description'}</p>
      </div>

      <div className="to-card p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-base">Invite teammates</h3>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary"
              onClick={() => { navigator.clipboard.writeText(t.inviteCode); toast.success('Code copied'); }}
              data-testid="team-detail-copy-code"
            >
              <Copy size={13} /> Copy code
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                const link = `${window.location.origin}/join/${t.inviteCode}`;
                navigator.clipboard.writeText(link);
                toast.success('Invite link copied');
              }}
              data-testid="team-detail-copy-link"
            >
              <LinkIcon size={13} /> Copy invite link
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Invite code</div>
            <div className="text-3xl font-mono tracking-widest text-gradient-strong">{t.inviteCode}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Shareable link</div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs font-mono text-slate-300 break-all" data-testid="team-detail-invite-link">
              {typeof window !== 'undefined' ? `${window.location.origin}/join/${t.inviteCode}` : ''}
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Anyone with this link joins the team as soon as they sign in (or sign up).
        </p>
      </div>

      <div className="to-card p-6">
        <h3 className="text-base mb-4">Members ({t.members.length})</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {t.members.map((m) => (
            <div key={m.user?._id} className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]" data-testid={`team-member-${m.user?._id}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-semibold uppercase">
                {m.user?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{m.user?.name}</div>
                <div className="text-xs text-slate-500 truncate">{m.user?.email}</div>
                {m.user?.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.user.skills.slice(0, 3).map((s) => <span key={s} className="badge text-[10px]">{s}</span>)}
                  </div>
                )}
              </div>
              <span className="badge badge-gray text-[10px]">{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;
