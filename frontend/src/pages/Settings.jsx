import React from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { LogOut, Bell, Shield } from 'lucide-react';

const PREF_FIELDS = [
  { key: 'taskAssigned', label: 'Task assigned' },
  { key: 'taskCompleted', label: 'Task completed' },
  { key: 'deadline', label: 'Deadline reminder' },
  { key: 'chat', label: 'Chat messages' },
];

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const [prefs, setPrefs] = React.useState({
    taskAssigned: true,
    taskCompleted: true,
    deadline: true,
    chat: true,
    ...(user?.notificationPrefs || {}),
  });
  const [saving, setSaving] = React.useState(false);

  const toggle = async (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', { notificationPrefs: next });
      updateUser(data.user);
    } catch {
      toast.error('Could not save preference');
      setPrefs(prefs); // revert on failure
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-2">Settings</div>
        <h2>Your <span className="serif-highlight text-gradient">preferences</span>.</h2>
      </div>

      <div className="to-card p-6">
        <div className="flex items-center gap-3 mb-3">
          <Bell size={16} className="text-blue-300" />
          <h3 className="text-base">Notifications</h3>
        </div>
        <div className="space-y-3 text-sm">
          {PREF_FIELDS.map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={!!prefs[key]}
                onChange={() => toggle(key)}
                disabled={saving}
                className="accent-purple-500 w-4 h-4"
                data-testid={`settings-pref-${key}`}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="to-card p-6">
        <div className="flex items-center gap-3 mb-3">
          <Shield size={16} className="text-emerald-300" />
          <h3 className="text-base">Privacy & Account</h3>
        </div>
        <div className="text-sm text-slate-400 mb-3">Signed in as <span className="text-slate-200 font-medium">{user?.email}</span></div>
        <button className="btn-secondary" onClick={logout} data-testid="settings-logout">
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  );
};

export default Settings;
