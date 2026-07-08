import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Rocket, Plus, Users, Calendar, Zap, Flame } from 'lucide-react';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';

const statusTone = {
  planning: 'badge-gray',
  active: 'badge',
  'on-hold': 'badge-yellow',
  completed: 'badge-green',
};
const priorityTone = {
  low: 'badge-gray',
  medium: 'badge-blue',
  high: 'badge-yellow',
  critical: 'badge-red',
};

const ProjectCard = ({ p }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="to-card p-6 group"
    data-testid={`project-card-${p._id}`}
  >
    <Link to={`/app/projects/${p._id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            {p.hackathonMode && <Flame size={13} className="text-orange-400" />}
            <h3 className="text-base font-medium truncate">{p.name}</h3>
          </div>
          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{p.description || 'No description'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className={`badge ${statusTone[p.status] || 'badge'}`}>{p.status}</span>
        <span className={`badge ${priorityTone[p.priority] || 'badge'}`}>{p.priority}</span>
      </div>
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Progress</span>
          <span>{p.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all" style={{ width: `${p.progress}%` }} />
        </div>
      </div>
      <div className="flex items-center gap-4 mt-5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5"><Users size={12} /> {p.members?.length || 1}</div>
        {p.deadline && (
          <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(p.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div>
        )}
      </div>
    </Link>
  </motion.div>
);

const Projects = () => {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '', description: '', problemStatement: '', techStack: '', priority: 'medium', deadline: '', hackathonMode: false,
  });
  const [saving, setSaving] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data,
  });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/projects', {
        ...form,
        techStack: form.techStack ? form.techStack.split(',').map((s) => s.trim()).filter(Boolean) : [],
        deadline: form.deadline || undefined,
      });
      toast.success('Project created');
      setShowCreate(false);
      setForm({ name: '', description: '', problemStatement: '', techStack: '', priority: 'medium', deadline: '', hackathonMode: false });
      qc.invalidateQueries({ queryKey: ['projects'] });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const projects = data?.projects || [];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-2">Projects</div>
          <h2>Your <span className="serif-highlight text-gradient">missions</span> in orbit.</h2>
          <p className="text-slate-400 mt-2">Each project has its own board, chat and AI studio.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)} data-testid="projects-create-btn">
          <Plus size={14} /> New project
        </button>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center"><div className="spinner" /></div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="No projects yet"
          description="Create your first project — pick a name, a problem statement, and let TeamOrbit help you ship."
          action={<button className="btn-primary" onClick={() => setShowCreate(true)}>Create project</button>}
          testId="empty-projects"
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="projects-grid">
          {projects.map((p) => <ProjectCard key={p._id} p={p} />)}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New project" size="lg" testId="project-create-modal">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Project name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="SmartCity Hackathon Entry" data-testid="project-name" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A one-liner about your project" />
          </div>
          <div>
            <label className="label">Problem statement</label>
            <textarea className="textarea" value={form.problemStatement} onChange={(e) => setForm({ ...form, problemStatement: e.target.value })} placeholder="What problem are you solving?" />
          </div>
          <div>
            <label className="label">Tech stack (comma-separated)</label>
            <input className="input" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} placeholder="React, Node.js, MongoDB" data-testid="project-tech" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="label">Deadline</label>
              <input type="date" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={form.hackathonMode} onChange={(e) => setForm({ ...form, hackathonMode: e.target.checked })} className="accent-purple-500" />
            <Zap size={14} className="text-orange-400" /> Hackathon mode
          </label>
          <button type="submit" disabled={saving} className="btn-primary w-full justify-center" data-testid="project-create-submit">
            {saving ? <div className="spinner" /> : 'Create project'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
