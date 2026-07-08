import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import api from '@/lib/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => (await api.get(`/projects/${id}`)).data,
  });

  if (isLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center"><div className="spinner" /></div>
  );
  const p = data?.project;
  if (!p) return <div className="text-slate-400">Project not found.</div>;

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
    </div>
  );
};

export default ProjectDetail;
