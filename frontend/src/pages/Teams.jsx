import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Users, Plus, Copy, LogIn, Link as LinkIcon } from 'lucide-react';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';

const Teams = () => {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = React.useState(false);
  const [showJoin, setShowJoin] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', description: '', college: '' });
  const [joinCode, setJoinCode] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => (await api.get('/teams')).data,
  });

  const createTeam = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/teams', form);
      toast.success('Team created');
      setShowCreate(false);
      setForm({ name: '', description: '', college: '' });
      qc.invalidateQueries({ queryKey: ['teams'] });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create team');
    } finally { setSaving(false); }
  };
  const joinTeam = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/teams/join', { inviteCode: joinCode });
      toast.success('Joined team');
      setShowJoin(false);
      setJoinCode('');
      qc.invalidateQueries({ queryKey: ['teams'] });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to join team');
    } finally { setSaving(false); }
  };

  const teams = data?.teams || [];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-2">Teams</div>
          <h2>Your <span className="serif-highlight text-gradient">crew</span>.</h2>
          <p className="text-slate-400 mt-2">Create a team, share the code, and invite your college friends.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setShowJoin(true)} data-testid="teams-join-btn"><LogIn size={14} /> Join with code</button>
          <button className="btn-primary" onClick={() => setShowCreate(true)} data-testid="teams-create-btn"><Plus size={14} /> New team</button>
        </div>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center"><div className="spinner" /></div>
      ) : teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teams yet"
          description="Create your first team or join one using an invite code from a friend."
          action={<div className="flex gap-2"><button className="btn-primary" onClick={() => setShowCreate(true)}>Create team</button><button className="btn-secondary" onClick={() => setShowJoin(true)}>Join with code</button></div>}
          testId="empty-teams"
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="teams-grid">
          {teams.map((t) => (
            <Link to={`/app/teams/${t._id}`} key={t._id} className="to-card p-6" data-testid={`team-card-${t._id}`}>
              <h3 className="text-base">{t.name}</h3>
              <p className="text-sm text-slate-400 mt-2 line-clamp-2">{t.description || 'No description'}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {(t.members || []).slice(0, 5).map((m, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-[#121620] text-[10px] font-semibold flex items-center justify-center uppercase">
                      {m.user?.name?.charAt(0) || '?'}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(t.inviteCode); toast.success('Code copied'); }}
                    className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 font-mono px-2 py-1 rounded-md hover:bg-white/5"
                    data-testid={`team-copy-code-${t._id}`}
                  >
                    {t.inviteCode} <Copy size={11} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const link = `${window.location.origin}/join/${t.inviteCode}`;
                      navigator.clipboard.writeText(link);
                      toast.success('Invite link copied');
                    }}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/5"
                    title="Copy invite link"
                    data-testid={`team-copy-link-${t._id}`}
                  >
                    <LinkIcon size={11} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New team" testId="team-create-modal">
        <form onSubmit={createTeam} className="space-y-4">
          <div>
            <label className="label">Team name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="team-name-input" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">College</label>
            <input className="input" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full justify-center" data-testid="team-create-submit">
            {saving ? <div className="spinner" /> : 'Create team'}
          </button>
        </form>
      </Modal>

      <Modal open={showJoin} onClose={() => setShowJoin(false)} title="Join a team" testId="team-join-modal">
        <form onSubmit={joinTeam} className="space-y-4">
          <div>
            <label className="label">Invite code</label>
            <input required className="input uppercase tracking-widest text-center font-mono" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="ABCD1234" data-testid="team-join-code" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full justify-center" data-testid="team-join-submit">
            {saving ? <div className="spinner" /> : 'Join team'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Teams;
