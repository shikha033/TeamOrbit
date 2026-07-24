// import React from 'react';
// import { Link, useParams } from 'react-router-dom';
// import { useQuery } from '@tanstack/react-query';
// import toast from 'react-hot-toast';
// import {
//   KanbanSquare,
//   MessageSquare,
//   Sparkles,
//   Users,
//   Calendar,
//   Flame,
//   ChevronRight,
//   Copy,
//   Link as LinkIcon,
// } from 'lucide-react';
// import api from '@/lib/api';

// const ProjectDetail = () => {
//   const { id } = useParams();
//   const { data, isLoading } = useQuery({
//     queryKey: ['project', id],
//     queryFn: async () => (await api.get(`/projects/${id}`)).data,
//   });

//   if (isLoading) return (
//     <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>
//   );
//   const p = data?.project;
//   if (!p) return <div className="text-slate-400">Project not found.</div>;

//   return (
//     <div className="space-y-8">
//       <div className="flex items-start justify-between flex-wrap gap-4">
//         <div>
//           <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
//             <Link to="/app/projects" className="hover:text-white">Projects</Link>
//             <ChevronRight size={12} />
//             <span>{p.name}</span>
//           </div>
//           <div className="flex items-center gap-3 mb-2">
//             {p.hackathonMode && <Flame size={20} className="text-orange-400" />}
//             <h2>{p.name}</h2>
//           </div>
//           <p className="text-slate-400 max-w-3xl leading-relaxed">{p.description || 'No description provided yet.'}</p>
//         </div>
//       </div>

//       <div className="grid md:grid-cols-3 gap-5">
//         <Link to={`/app/projects/${id}/board`} className="to-card p-6 group" data-testid="project-open-board">
//           <KanbanSquare size={22} className="text-purple-300 mb-4" />
//           <h3 className="text-base">Kanban board</h3>
//           <p className="text-sm text-slate-400 mt-1">Drag and drop tasks across To Do → Review → Done.</p>
//         </Link>
//         <Link to={`/app/projects/${id}/chat`} className="to-card p-6" data-testid="project-open-chat">
//           <MessageSquare size={22} className="text-blue-300 mb-4" />
//           <h3 className="text-base">Team chat</h3>
//           <p className="text-sm text-slate-400 mt-1">Live project chat with read receipts and typing indicator.</p>
//         </Link>
//         <Link to={`/app/projects/${id}/ai`} className="to-card p-6" data-testid="project-open-ai">
//           <Sparkles size={22} className="text-cyan-300 mb-4" />
//           <h3 className="text-base">AI Studio</h3>
//           <p className="text-sm text-slate-400 mt-1">Generate docs, presentations, meeting-to-tasks, deadline risk.</p>
//         </Link>
//       </div>

//       <div className="grid lg:grid-cols-3 gap-5">
//         <div className="to-card p-6 lg:col-span-2 space-y-6">
//           <div>
//             <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Problem statement</div>
//             <p className="text-slate-300 leading-relaxed">{p.problemStatement || 'Not yet defined. Add one from the edit view.'}</p>
//           </div>
//           <div>
//             <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Tech stack</div>
//             {p.techStack?.length ? (
//               <div className="flex flex-wrap gap-2">
//                 {p.techStack.map((t) => <span key={t} className="badge">{t}</span>)}
//               </div>
//             ) : <p className="text-slate-500 text-sm">No stack tagged.</p>}
//           </div>
//           <div>
//             <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Progress</div>
//             <div className="flex items-center gap-3">
//               <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
//                 <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${p.progress}%` }} />
//               </div>
//               <span className="text-sm font-medium">{p.progress}%</span>
//             </div>
//           </div>
//         </div>

//         <div className="to-card p-6 space-y-5">
//           <div>
//             <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Status</div>
//             <span className="badge">{p.status}</span>
//           </div>
//           <div>
//             <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Priority</div>
//             <span className={`badge ${p.priority === 'critical' ? 'badge-red' : p.priority === 'high' ? 'badge-yellow' : 'badge-blue'}`}>{p.priority}</span>
//           </div>
//           {p.deadline && (
//             <div>
//               <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Deadline</div>
//               <div className="flex items-center gap-2 text-sm">
//                 <Calendar size={14} className="text-slate-400" />
//                 {new Date(p.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
//               </div>
//             </div>
//           )}
//           <div>
//             <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2 flex items-center justify-between">
//               <span>Members</span>
//               <Users size={12} />
//             </div>
//             <div className="space-y-2">
//               {(p.members || []).map((m) => (
//                 <div key={m._id} className="flex items-center gap-3 text-sm" data-testid={`project-member-${m._id}`}>
//                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-semibold uppercase">
//                     {m.name?.charAt(0)}
//                   </div>
//                   <div className="min-w-0 flex-1">
//                     <div className="truncate">{m.name}</div>
//                     <div className="text-xs text-slate-500 truncate">{m.email}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//           {p.team && (
//             <div>
//               <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Team invite code</div>
//               <div className="flex items-center gap-2">
//                 <button
//                   className="flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 font-mono"
//                   onClick={() => { navigator.clipboard.writeText(p.team.inviteCode); toast.success('Code copied'); }}
//                   data-testid="copy-invite-code"
//                 >
//                   {p.team.inviteCode} <Copy size={12} />
//                 </button>
//                 <button
//                   className="btn-ghost !p-1.5"
//                   title="Copy shareable invite link"
//                   onClick={() => {
//                     navigator.clipboard.writeText(`${window.location.origin}/join/${p.team.inviteCode}`);
//                     toast.success('Invite link copied');
//                   }}
//                   data-testid="copy-invite-link"
//                 >
//                   <LinkIcon size={12} />
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectDetail;
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  KanbanSquare,
  MessageSquare,
  Sparkles,
  Users,
  Calendar,
  Flame,
  ChevronRight,
  Copy,
  Link as LinkIcon,
  Pencil,
} from 'lucide-react';
import api from '@/lib/api';
import Modal from '@/components/Modal';

const ProjectDetail = () => {
  const { id } = useParams();
  const qc = useQueryClient();
  const [showEdit, setShowEdit] = React.useState(false);
  const [form, setForm] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => (await api.get(`/projects/${id}`)).data,
  });

  if (isLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>
  );
  const p = data?.project;
  if (!p) return <div className="text-slate-400">Project not found.</div>;

  const openEdit = () => {
    setForm({
      name: p.name || '',
      description: p.description || '',
      problemStatement: p.problemStatement || '',
      techStack: (p.techStack || []).join(', '),
      status: p.status || 'planning',
      priority: p.priority || 'medium',
      deadline: p.deadline ? new Date(p.deadline).toISOString().slice(0, 10) : '',
    });
    setShowEdit(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/projects/${id}`, {
        ...form,
        techStack: form.techStack ? form.techStack.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      toast.success('Project updated');
      setShowEdit(false);
      qc.invalidateQueries({ queryKey: ['project', id] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <Link to="/app/projects" className="hover:text-white">Projects</Link>
            <ChevronRight size={12} />
            <span>{p.name}</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            {p.hackathonMode && <Flame size={20} className="text-orange-400" />}
            <h2>{p.name}</h2>
          </div>
          <p className="text-slate-400 max-w-3xl leading-relaxed">{p.description || 'No description provided yet.'}</p>
        </div>
        <button className="btn-secondary" onClick={openEdit} data-testid="project-edit-btn">
          <Pencil size={14} /> Edit project
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <Link to={`/app/projects/${id}/board`} className="to-card p-6 group" data-testid="project-open-board">
          <KanbanSquare size={22} className="text-purple-300 mb-4" />
          <h3 className="text-base">Kanban board</h3>
          <p className="text-sm text-slate-400 mt-1">Drag and drop tasks across To Do → Review → Done.</p>
        </Link>
        <Link to={`/app/projects/${id}/chat`} className="to-card p-6" data-testid="project-open-chat">
          <MessageSquare size={22} className="text-blue-300 mb-4" />
          <h3 className="text-base">Team chat</h3>
          <p className="text-sm text-slate-400 mt-1">Live project chat with read receipts and typing indicator.</p>
        </Link>
        <Link to={`/app/projects/${id}/ai`} className="to-card p-6" data-testid="project-open-ai">
          <Sparkles size={22} className="text-cyan-300 mb-4" />
          <h3 className="text-base">AI Studio</h3>
          <p className="text-sm text-slate-400 mt-1">Generate docs, presentations, meeting-to-tasks, deadline risk.</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="to-card p-6 lg:col-span-2 space-y-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Problem statement</div>
            <p className="text-slate-300 leading-relaxed">{p.problemStatement || 'Not yet defined. Add one from the edit view.'}</p>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Tech stack</div>
            {p.techStack?.length ? (
              <div className="flex flex-wrap gap-2">
                {p.techStack.map((t) => <span key={t} className="badge">{t}</span>)}
              </div>
            ) : <p className="text-slate-500 text-sm">No stack tagged.</p>}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Progress</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${p.progress}%` }} />
              </div>
              <span className="text-sm font-medium">{p.progress}%</span>
            </div>
          </div>
        </div>

        <div className="to-card p-6 space-y-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Status</div>
            <span className="badge">{p.status}</span>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Priority</div>
            <span className={`badge ${p.priority === 'critical' ? 'badge-red' : p.priority === 'high' ? 'badge-yellow' : 'badge-blue'}`}>{p.priority}</span>
          </div>
          {p.deadline && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Deadline</div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-slate-400" />
                {new Date(p.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          )}
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2 flex items-center justify-between">
              <span>Members</span>
              <Users size={12} />
            </div>
            <div className="space-y-2">
              {(p.members || []).map((m) => (
                <div key={m._id} className="flex items-center gap-3 text-sm" data-testid={`project-member-${m._id}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-semibold uppercase">
                    {m.name?.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{m.name}</div>
                    <div className="text-xs text-slate-500 truncate">{m.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {p.team && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Team invite code</div>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 font-mono"
                  onClick={() => { navigator.clipboard.writeText(p.team.inviteCode); toast.success('Code copied'); }}
                  data-testid="copy-invite-code"
                >
                  {p.team.inviteCode} <Copy size={12} />
                </button>
                <button
                  className="btn-ghost !p-1.5"
                  title="Copy shareable invite link"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/join/${p.team.inviteCode}`);
                    toast.success('Invite link copied');
                  }}
                  data-testid="copy-invite-link"
                >
                  <LinkIcon size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit project" size="lg" testId="project-edit-modal">
        {form && (
          <form onSubmit={saveEdit} className="space-y-4">
            <div>
              <label className="label">Project name</label>
              <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="project-edit-name" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea required className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Problem statement</label>
              <textarea required className="textarea" value={form.problemStatement} onChange={(e) => setForm({ ...form, problemStatement: e.target.value })} />
            </div>
            <div>
              <label className="label">Tech stack (comma-separated)</label>
              <input required className="input" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} data-testid="project-edit-tech" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} data-testid="project-edit-status">
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
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
                <input required type="date" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center" data-testid="project-edit-submit">
              {saving ? <div className="spinner" /> : 'Save changes'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ProjectDetail;
