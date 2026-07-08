import React from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = React.useState({ name: user?.name || '', bio: user?.bio || '', college: user?.college || '', avatar: user?.avatar || '' });
  const [skills, setSkills] = React.useState(user?.skills || []);
  const [skillInput, setSkillInput] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput('');
  };
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', { ...form, skills });
      updateUser(data.user);
      toast.success('Profile updated');
    } catch { toast.error('Update failed'); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-2">Profile</div>
        <h2>Your <span className="serif-highlight text-gradient">public identity</span>.</h2>
        <p className="text-slate-400 mt-2">Skills and bio drive AI task recommendations, so keep them accurate.</p>
      </div>

      <div className="to-card p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-semibold uppercase">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <div className="text-lg font-medium">{user?.name}</div>
            <div className="text-sm text-slate-500">{user?.email}</div>
            <div className="text-xs text-slate-500 mt-1 uppercase tracking-widest">{user?.role}</div>
          </div>
        </div>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="profile-name" />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea className="textarea" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A short bio your teammates will see" data-testid="profile-bio" />
          </div>
          <div>
            <label className="label">College</label>
            <input className="input" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
          </div>
          <div>
            <label className="label">Skills</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Add a skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              />
              <button type="button" className="btn-secondary" onClick={addSkill}>Add</button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3" data-testid="profile-skills-list">
                {skills.map((s) => (
                  <span key={s} className="badge">
                    {s}
                    <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} className="text-purple-300 hover:text-white">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="label">Stats</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="text-xs text-slate-500">Tasks completed</div>
                <div className="text-2xl font-medium">{user?.tasksCompleted || 0}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="text-xs text-slate-500">Activity score</div>
                <div className="text-2xl font-medium text-gradient-strong">{user?.activityScore || 0}</div>
              </div>
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary" data-testid="profile-save">
            {saving ? <div className="spinner" /> : 'Save profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
