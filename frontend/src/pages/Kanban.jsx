import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import {
  Plus,
  MessageSquare,
  Paperclip,
  CheckSquare,
  Sparkles,
  ChevronRight,
  Trash2,
  Upload,
  Download,
} from 'lucide-react';
import api from '@/lib/api';
import Modal from '@/components/Modal';

const COLUMNS = [
  { id: 'todo', label: 'To Do', tint: 'from-slate-500/40 to-transparent' },
  { id: 'in-progress', label: 'In Progress', tint: 'from-blue-500/40 to-transparent' },
  { id: 'review', label: 'Review', tint: 'from-amber-500/40 to-transparent' },
  { id: 'completed', label: 'Completed', tint: 'from-emerald-500/40 to-transparent' },
];

const priorityBadge = { low: 'badge-gray', medium: 'badge-blue', high: 'badge-yellow', critical: 'badge-red' };

const Kanban = () => {
  const { id } = useParams();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = React.useState(false);
  const [openTask, setOpenTask] = React.useState(null);
  const [newTask, setNewTask] = React.useState({ title: '', description: '', priority: 'medium', deadline: '', assignees: [] });
  const [aiSuggesting, setAiSuggesting] = React.useState(false);
  const [aiSuggestion, setAiSuggestion] = React.useState(null);
  const [comment, setComment] = React.useState('');
  const [checklistInput, setChecklistInput] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const { data: projectData } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => (await api.get(`/projects/${id}`)).data,
  });
  const { data, isLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => (await api.get(`/tasks?project=${id}`)).data,
  });
  const tasks = data?.tasks || [];
  const project = projectData?.project;
  const members = project?.members || [];

  const byCol = (col) => tasks.filter((t) => t.status === col).sort((a, b) => (a.order || 0) - (b.order || 0));

  React.useEffect(() => {
    if (!openTask) return;
    const fresh = tasks.find((t) => t._id === openTask._id);
    if (fresh && fresh !== openTask) setOpenTask(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const updated = [...tasks];
    const moving = updated.find((t) => t._id === draggableId);
    moving.status = destination.droppableId;
    qc.setQueryData(['tasks', id], { tasks: updated });
    try {
      await api.put(`/tasks/${draggableId}`, { status: destination.droppableId, order: destination.index });
      qc.invalidateQueries({ queryKey: ['tasks', id] });
    } catch (err) {
      toast.error('Reorder failed');
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, project: id, deadline: newTask.deadline || undefined });
      toast.success('Task created');
      setShowCreate(false);
      setNewTask({ title: '', description: '', priority: 'medium', deadline: '', assignees: [] });
      setAiSuggestion(null);
      qc.invalidateQueries({ queryKey: ['tasks', id] });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const toggleNewTaskAssignee = (uid) => {
    setNewTask((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(uid) ? prev.assignees.filter((x) => x !== uid) : [...prev.assignees, uid],
    }));
  };

  const askAI = async () => {
    if (!newTask.title) return toast.error('Add a title first');
    setAiSuggesting(true);
    try {
      const { data } = await api.post('/ai/task-distribution', {
        projectId: id,
        taskTitle: newTask.title,
        taskDescription: newTask.description,
      });
      setAiSuggestion(data.suggestion);
    } catch (err) {
      toast.error('AI suggestion failed');
    } finally { setAiSuggesting(false); }
  };

  const submitComment = async () => {
    if (!comment.trim() || !openTask) return;
    try {
      const { data } = await api.post(`/tasks/${openTask._id}/comment`, { text: comment });
      setOpenTask(data.task);
      setComment('');
      qc.invalidateQueries({ queryKey: ['tasks', id] });
    } catch { toast.error('Failed'); }
  };

  const toggleChecklist = async (idx) => {
    const cl = [...openTask.checklist];
    cl[idx].done = !cl[idx].done;
    const { data } = await api.put(`/tasks/${openTask._id}`, { checklist: cl });
    setOpenTask(data.task);
    qc.invalidateQueries({ queryKey: ['tasks', id] });
  };

  const addChecklistItem = async () => {
    if (!checklistInput.trim() || !openTask) return;
    const cl = [...(openTask.checklist || []), { text: checklistInput.trim(), done: false }];
    try {
      const { data } = await api.put(`/tasks/${openTask._id}`, { checklist: cl });
      setOpenTask(data.task);
      setChecklistInput('');
      qc.invalidateQueries({ queryKey: ['tasks', id] });
    } catch { toast.error('Failed to add item'); }
  };

  const removeChecklistItem = async (idx) => {
    const cl = openTask.checklist.filter((_, i) => i !== idx);
    try {
      const { data } = await api.put(`/tasks/${openTask._id}`, { checklist: cl });
      setOpenTask(data.task);
      qc.invalidateQueries({ queryKey: ['tasks', id] });
    } catch { toast.error('Failed to remove item'); }
  };

  const updateTaskField = async (field, value) => {
    try {
      const { data } = await api.put(`/tasks/${openTask._id}`, { [field]: value });
      setOpenTask(data.task);
      qc.invalidateQueries({ queryKey: ['tasks', id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    } catch { toast.error('Update failed'); }
  };

  const toggleAssignee = async (uid) => {
    const current = (openTask.assignees || []).map((a) => a._id);
    const next = current.includes(uid) ? current.filter((x) => x !== uid) : [...current, uid];
    await updateTaskField('assignees', next);
  };

  const deleteTask = async () => {
    if (!openTask) return;
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await api.delete(`/tasks/${openTask._id}`);
      toast.success('Task deleted');
      setOpenTask(null);
      qc.invalidateQueries({ queryKey: ['tasks', id] });
    } catch { toast.error('Failed to delete task'); }
  };

  const uploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !openTask) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      await api.post(`/files/upload/${openTask._id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { data } = await api.get(`/tasks/${openTask._id}`);
      setOpenTask(data.task);
      qc.invalidateQueries({ queryKey: ['tasks', id] });
      toast.success('File attached');
    } catch { toast.error('Upload failed'); } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fileUrl = (path) => `${(process.env.REACT_APP_BACKEND_URL || '')}${path}`;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link to="/app/projects" className="hover:text-white">Projects</Link>
            <ChevronRight size={12} />
            <Link to={`/app/projects/${id}`} className="hover:text-white">{project?.name || 'Loading'}</Link>
            <ChevronRight size={12} />
            <span>Board</span>
          </div>
          <h2>Kanban board</h2>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)} data-testid="kanban-new-task">
          <Plus size={14} /> New task
        </button>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center"><div className="spinner" /></div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-5 overflow-x-auto pb-6" data-testid="kanban-board">
            {COLUMNS.map((col) => {
              const items = byCol(col.id);
              return (
                <div key={col.id} className="kanban-column" data-testid={`kanban-col-${col.id}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-6 rounded-full bg-gradient-to-b ${col.tint}`} />
                      <div className="font-medium text-sm">{col.label}</div>
                      <span className="text-xs text-slate-500">{items.length}</span>
                    </div>
                  </div>
                  <Droppable droppableId={col.id}>
                    {(prov) => (
                      <div ref={prov.innerRef} {...prov.droppableProps} className="col-body min-h-[40px]">
                        {items.map((t, index) => (
                          <Draggable key={t._id} draggableId={t._id} index={index}>
                            {(dp) => (
                              <div
                                ref={dp.innerRef}
                                {...dp.draggableProps}
                                {...dp.dragHandleProps}
                                onClick={() => setOpenTask(t)}
                                className="task-card"
                                data-testid={`kanban-task-${t._id}`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="text-sm font-medium leading-snug">{t.title}</div>
                                  <span className={`badge ${priorityBadge[t.priority]}`}>{t.priority}</span>
                                </div>
                                {t.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{t.description}</p>}
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <div className="flex items-center gap-3">
                                    {t.checklist?.length > 0 && (
                                      <span className="flex items-center gap-1"><CheckSquare size={11} />
                                        {t.checklist.filter((c) => c.done).length}/{t.checklist.length}
                                      </span>
                                    )}
                                    {t.comments?.length > 0 && <span className="flex items-center gap-1"><MessageSquare size={11} /> {t.comments.length}</span>}
                                    {t.attachments?.length > 0 && <span className="flex items-center gap-1"><Paperclip size={11} /> {t.attachments.length}</span>}
                                  </div>
                                  {t.assignees?.length > 0 && (
                                    <div className="flex -space-x-1.5">
                                      {t.assignees.slice(0, 3).map((a) => (
                                        <div key={a._id} className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border border-[#1A1F2C] text-[9px] font-semibold flex items-center justify-center uppercase">
                                          {a.name?.charAt(0)}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {prov.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* New Task Modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); setAiSuggestion(null); }} title="New task" size="lg" testId="task-create-modal">
        <form onSubmit={createTask} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input required className="input" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} data-testid="task-title-input" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="textarea" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select className="input" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="label">Deadline</label>
              <input type="date" className="input" value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">Assignees</label>
            {members.length === 0 ? (
              <p className="text-xs text-slate-500">No project members to assign yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2" data-testid="task-assignee-picker">
                {members.map((m) => {
                  const active = newTask.assignees.includes(m._id);
                  return (
                    <button
                      type="button"
                      key={m._id}
                      onClick={() => toggleNewTaskAssignee(m._id)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs border transition-colors ${active ? 'border-purple-400 bg-purple-500/15 text-white' : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'}`}
                      data-testid={`task-assignee-option-${m._id}`}
                    >
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[9px] font-semibold uppercase">
                        {m.name?.charAt(0)}
                      </span>
                      {m.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="to-card !bg-purple-500/5 !border-purple-500/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles size={14} className="text-purple-300" />
                <span className="font-medium">AI Task Distribution</span>
              </div>
              <button type="button" className="btn-secondary !py-1.5 !px-3 !text-xs" onClick={askAI} disabled={aiSuggesting} data-testid="task-ai-suggest">
                {aiSuggesting ? <div className="spinner" /> : 'Suggest owner'}
              </button>
            </div>
            {aiSuggestion && (
              <div className="mt-3 text-sm">
                <div><span className="text-slate-400">Recommended:</span> <span className="text-purple-300 font-medium">{aiSuggestion.recommended}</span></div>
                <div className="text-xs text-slate-500 mt-1">{aiSuggestion.reason}</div>
                {aiSuggestion.alternates?.length > 0 && (
                  <div className="text-xs text-slate-500 mt-1">Alternates: {aiSuggestion.alternates.join(', ')}</div>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary w-full justify-center" data-testid="task-create-submit">Create task</button>
        </form>
      </Modal>

      {/* Task detail modal */}
      <Modal open={!!openTask} onClose={() => setOpenTask(null)} title={openTask?.title || 'Task'} size="lg" testId="task-detail-modal">
        {openTask && (
          <div className="space-y-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Description</div>
              <p className="text-sm text-slate-300 leading-relaxed">{openTask.description || '—'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <select className="input" value={openTask.status} onChange={(e) => updateTaskField('status', e.target.value)} data-testid="task-edit-status">
                  {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select className="input" value={openTask.priority} onChange={(e) => updateTaskField('priority', e.target.value)} data-testid="task-edit-priority">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Deadline</label>
              <input
                type="date"
                className="input"
                value={openTask.deadline ? new Date(openTask.deadline).toISOString().slice(0, 10) : ''}
                onChange={(e) => updateTaskField('deadline', e.target.value || null)}
                data-testid="task-edit-deadline"
              />
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Assignees</div>
              {members.length === 0 ? (
                <p className="text-xs text-slate-500">No project members to assign.</p>
              ) : (
                <div className="flex flex-wrap gap-2" data-testid="task-detail-assignee-picker">
                  {members.map((m) => {
                    const active = (openTask.assignees || []).some((a) => a._id === m._id);
                    return (
                      <button
                        type="button"
                        key={m._id}
                        onClick={() => toggleAssignee(m._id)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs border transition-colors ${active ? 'border-purple-400 bg-purple-500/15 text-white' : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'}`}
                        data-testid={`task-detail-assignee-${m._id}`}
                      >
                        <span className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[9px] font-semibold uppercase">
                          {m.name?.charAt(0)}
                        </span>
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Checklist</div>
              <div className="space-y-1.5">
                {(openTask.checklist || []).map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm hover:bg-white/5 rounded p-1.5 group">
                    <label className="flex items-center gap-2 flex-1 cursor-pointer">
                      <input type="checkbox" checked={c.done} onChange={() => toggleChecklist(i)} className="accent-purple-500" />
                      <span className={c.done ? 'line-through text-slate-500' : ''}>{c.text}</span>
                    </label>
                    <button type="button" onClick={() => removeChecklistItem(i)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity" data-testid={`task-checklist-remove-${i}`}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  className="input flex-1"
                  placeholder="Add a checklist item…"
                  value={checklistInput}
                  onChange={(e) => setChecklistInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addChecklistItem(); } }}
                  data-testid="task-checklist-input"
                />
                <button type="button" className="btn-secondary" onClick={addChecklistItem} data-testid="task-checklist-add">Add</button>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Attachments</div>
              <div className="space-y-1.5 mb-2">
                {(openTask.attachments || []).length === 0 && <p className="text-sm text-slate-500">No files attached.</p>}
                {(openTask.attachments || []).map((a, i) => (
                  <a key={i} href={fileUrl(a.url)} target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]" data-testid={`task-attachment-${i}`}>
                    <span className="flex items-center gap-2 truncate"><Paperclip size={12} className="text-slate-500 shrink-0" /> {a.name}</span>
                    <Download size={12} className="text-slate-500 shrink-0" />
                  </a>
                ))}
              </div>
              <input ref={fileInputRef} type="file" className="hidden" onChange={uploadFile} data-testid="task-file-input" />
              <button type="button" className="btn-secondary !text-xs" onClick={() => fileInputRef.current?.click()} disabled={uploading} data-testid="task-file-upload-btn">
                {uploading ? <div className="spinner" /> : <><Upload size={12} /> Attach file</>}
              </button>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-2">Comments</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(openTask.comments || []).length === 0 && <p className="text-sm text-slate-500">No comments yet.</p>}
                {(openTask.comments || []).map((c) => (
                  <div key={c._id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-xs text-slate-400 mb-1">{c.author?.name || 'Someone'} · {new Date(c.createdAt).toLocaleString()}</div>
                    <div className="text-sm">{c.text}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <input className="input flex-1" placeholder="Add a comment…" value={comment} onChange={(e) => setComment(e.target.value)} data-testid="task-comment-input" />
                <button className="btn-primary" onClick={submitComment} data-testid="task-comment-submit">Post</button>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <button type="button" className="btn-secondary !text-rose-300 !border-rose-500/20 hover:!bg-rose-500/10" onClick={deleteTask} data-testid="task-delete-btn">
                <Trash2 size={13} /> Delete task
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Kanban;
