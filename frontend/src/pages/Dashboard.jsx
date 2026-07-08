import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Rocket,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import EmptyState from '@/components/EmptyState';

const StatCard = ({ label, value, icon: Icon, tone = 'purple' }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="to-card p-5"
    data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div
        className={`w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center ${
          tone === 'purple' ? 'bg-purple-500/10 text-purple-300'
            : tone === 'blue' ? 'bg-blue-500/10 text-blue-300'
            : tone === 'green' ? 'bg-emerald-500/10 text-emerald-300'
            : 'bg-amber-500/10 text-amber-300'
        }`}
      >
        <Icon size={15} />
      </div>
    </div>
    <div className="text-3xl font-medium">{value}</div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/analytics/dashboard')).data,
  });

  if (isLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>
  );

  const counts = data?.counts || {};
  const projects = data?.projects || [];
  const upcoming = data?.upcoming || [];
  const weekly = data?.weekly || [];
  const statusData = [
    { name: 'To Do', v: counts.todo || 0 },
    { name: 'In Progress', v: counts.inProgress || 0 },
    { name: 'Review', v: counts.review || 0 },
    { name: 'Done', v: counts.completed || 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-2">Dashboard</div>
          <h2>Hi <span className="serif-highlight text-gradient">{user?.name?.split(' ')[0]}</span>, here's your orbit.</h2>
          <p className="text-slate-400 mt-2">A snapshot of your projects, tasks and momentum today.</p>
        </div>
        <Link to="/app/projects" className="btn-primary" data-testid="dashboard-new-project">
          <Sparkles size={14} /> New project
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Active projects" value={counts.projects || 0} icon={Rocket} tone="purple" />
        <StatCard label="Your open tasks" value={counts.myTasksToday || 0} icon={Clock} tone="blue" />
        <StatCard label="Upcoming deadlines" value={counts.upcomingDeadlines || 0} icon={AlertTriangle} tone="yellow" />
        <StatCard label="Tasks completed" value={counts.completed || 0} icon={CheckCircle2} tone="green" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="to-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base">Weekly productivity</h3>
              <p className="text-xs text-slate-500 mt-1">Tasks completed across your projects</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0A0D14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                <Area type="monotone" dataKey="completed" stroke="#8B5CF6" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="to-card p-6">
          <h3 className="text-base mb-1">Status mix</h3>
          <p className="text-xs text-slate-500 mb-4">Across all your active projects</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0A0D14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                <Bar dataKey="v" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="to-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base">Active projects</h3>
            <Link to="/app/projects" className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          {projects.length === 0 ? (
            <EmptyState
              icon={Rocket}
              title="No projects yet"
              description="Create your first project to kick off your team's collaboration."
              action={<Link to="/app/projects" className="btn-primary">Create project</Link>}
              testId="empty-projects-dashboard"
            />
          ) : (
            <div className="space-y-3" data-testid="dashboard-projects-list">
              {projects.slice(0, 5).map((p) => (
                <Link
                  key={p._id}
                  to={`/app/projects/${p._id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-purple-500/40 hover:bg-white/[0.04] transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{p.name}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">{p.status}</div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-xs text-slate-500 mb-1">Progress</div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-xs text-slate-300">{p.progress}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="to-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base">Upcoming deadlines</h3>
            <span className="badge badge-yellow">{upcoming.length}</span>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Nothing pressing"
              description="No tasks with imminent deadlines. Keep it up."
              testId="empty-deadlines"
            />
          ) : (
            <div className="space-y-3" data-testid="dashboard-upcoming-list">
              {upcoming.map((t) => (
                <div key={t._id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{t.title}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(t.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span className={`badge ${t.priority === 'high' || t.priority === 'critical' ? 'badge-red' : 'badge-blue'}`}>{t.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
