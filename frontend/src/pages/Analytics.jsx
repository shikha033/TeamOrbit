import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, TrendingUp } from 'lucide-react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import api from '@/lib/api';

const COLORS = ['#8B5CF6', '#3B82F6', '#00C2FF', '#22C55E', '#F59E0B', '#EF4444'];

const Analytics = () => {
  const [projectId, setProjectId] = React.useState('');
  const { data: proj } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data,
  });
  const projects = proj?.projects || [];
  React.useEffect(() => {
    if (!projectId && projects.length) setProjectId(projects[0]._id);
  }, [projects, projectId]);

  const { data: dash } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/analytics/dashboard')).data,
  });

  const { data: contrib } = useQuery({
    queryKey: ['contribution', projectId],
    queryFn: async () => (await api.get(`/analytics/contribution/${projectId}`)).data,
    enabled: !!projectId,
  });
  const { data: lb } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => (await api.get('/analytics/leaderboard')).data,
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-2">Analytics</div>
        <h2>Fair, transparent <span className="serif-highlight text-gradient">contribution</span>.</h2>
        <p className="text-slate-400 mt-2">Track completion, workload distribution and every teammate's real impact.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="to-card p-6">
          <h3 className="text-base mb-4">Weekly momentum</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dash?.weekly || []}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0A0D14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                <Bar dataKey="completed" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="to-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base">Contribution split</h3>
            <select className="input !w-auto !py-1.5 !px-3 text-xs" value={projectId} onChange={(e) => setProjectId(e.target.value)} data-testid="analytics-project-select">
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <PieChart>
                <Pie
                  data={(contrib?.contributions || []).filter((c) => c?.user && c.score > 0)}
                  dataKey="score"
                  nameKey={(d) => d?.user?.name || 'Unknown'}
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={2}
                  label={(d) => `${d.percentage}%`}
                >
                  {(contrib?.contributions || []).filter((c) => c?.user && c.score > 0).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#0A0D14" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0A0D14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="to-card p-6">
        <h3 className="text-base mb-4">Team contribution breakdown</h3>
        {(contrib?.contributions || []).length === 0 ? (
          <p className="text-slate-500 text-sm">Add and complete tasks to see contribution stats.</p>
        ) : (
          <div className="space-y-3" data-testid="analytics-contribution-list">
            {contrib.contributions.map((c) => (
              <div key={c.user._id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-semibold uppercase shrink-0">
                  {c.user.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{c.user.name}</div>
                  <div className="text-xs text-slate-500">{c.completed}/{c.assigned} tasks · {c.comments} comments</div>
                </div>
                <div className="w-40">
                  <div className="text-xs text-slate-500 mb-1 text-right">{c.percentage}%</div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${c.percentage}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="to-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={16} className="text-amber-300" />
          <h3 className="text-base">Leaderboard</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3" data-testid="analytics-leaderboard">
          {(lb?.leaderboard || []).map((u, i) => (
            <div key={u._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-semibold">{i + 1}</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-semibold uppercase">
                {u.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{u.name}</div>
                <div className="text-xs text-slate-500">{u.tasksCompleted} completed</div>
              </div>
              <div className="text-sm text-purple-300 flex items-center gap-1">
                <TrendingUp size={12} /> {u.activityScore}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
