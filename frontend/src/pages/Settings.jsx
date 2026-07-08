import React from 'react';
import { useAuth } from '@/lib/auth';
import { LogOut, Moon, Bell, Shield } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-2">Settings</div>
        <h2>Your <span className="serif-highlight text-gradient">preferences</span>.</h2>
      </div>

      <div className="to-card p-6">
        <div className="flex items-center gap-3 mb-3">
          <Moon size={16} className="text-purple-300" />
          <h3 className="text-base">Appearance</h3>
        </div>
        <p className="text-sm text-slate-500">TeamOrbit is dark-first by design. A light mode is on our roadmap.</p>
      </div>

      <div className="to-card p-6">
        <div className="flex items-center gap-3 mb-3">
          <Bell size={16} className="text-blue-300" />
          <h3 className="text-base">Notifications</h3>
        </div>
        <div className="space-y-3 text-sm">
          {['Task assigned', 'Task completed', 'Deadline reminder', 'Chat messages'].map((n) => (
            <label key={n} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span>{n}</span>
              <input type="checkbox" defaultChecked className="accent-purple-500 w-4 h-4" />
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
