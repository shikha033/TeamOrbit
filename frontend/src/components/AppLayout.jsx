import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  Bell,
  Sparkles,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Orbit,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

const NavItem = ({ to, icon: Icon, label, badge }) => (
  <NavLink
    to={to}
    end
    data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
    className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
  >
    <Icon size={18} />
    <span className="flex-1">{label}</span>
    {badge > 0 && (
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        {badge}
      </span>
    )}
  </NavLink>
);

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = () =>
      api.get('/notifications').then((r) => {
        setUnread((r.data.notifications || []).filter((n) => !n.read).length);
      }).catch(() => {});
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0A0D14]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-white/5 bg-[#0A0D14] p-5 sticky top-0 h-screen">
        <div
          className="flex items-center gap-2 mb-8 cursor-pointer"
          onClick={() => navigate('/app')}
          data-testid="sidebar-logo"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-pulse-glow">
            <Orbit size={20} className="text-white" />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight">TeamOrbit</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">student teams</div>
          </div>
        </div>

        <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2 px-3">Workspace</div>
        <nav className="flex flex-col gap-1 mb-6">
          <NavItem to="/app" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/app/projects" icon={FolderKanban} label="Projects" />
          <NavItem to="/app/teams" icon={Users} label="Teams" />
          <NavItem to="/app/analytics" icon={BarChart3} label="Analytics" />
        </nav>

        <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2 px-3">Personal</div>
        <nav className="flex flex-col gap-1 mb-auto">
          <NavItem to="/app/notifications" icon={Bell} label="Notifications" badge={unread} />
          <NavItem to="/app/profile" icon={UserIcon} label="Profile" />
          <NavItem to="/app/settings" icon={SettingsIcon} label="Settings" />
        </nav>

        <div className="mt-4 to-glass rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold uppercase text-sm shrink-0">
              {(user?.name || '?').charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" data-testid="sidebar-user-name">{user?.name}</div>
              <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
            </div>
            <button
              className="btn-ghost !p-2"
              data-testid="sidebar-logout"
              onClick={logout}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-h-screen relative">
        {/* Top bar */}
        <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0A0D14]/80 backdrop-blur-xl">
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="input pl-9 py-2"
                placeholder="Search projects, tasks, teammates…"
                data-testid="topbar-search"
              />
            </div>
            <button className="btn-secondary !py-2 !px-3" onClick={() => navigate('/app/notifications')} data-testid="topbar-notifications">
              <Bell size={16} />
              {unread > 0 && (
                <span className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  {unread}
                </span>
              )}
            </button>
            <button className="btn-primary !py-2 !px-3" onClick={() => navigate('/app/projects')} data-testid="topbar-new-project">
              <Sparkles size={16} /> New Project
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6 lg:p-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default AppLayout;
