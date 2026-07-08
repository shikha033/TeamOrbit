import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Sparkles, FileText, Presentation, Brain, AlertTriangle, Copy, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

const AIStudio = () => {
  const { id } = useParams();
  const [meetingNotes, setMeetingNotes] = React.useState('');
  const [meetingResult, setMeetingResult] = React.useState(null);
  const [meetingLoading, setMeetingLoading] = React.useState(false);
  const [doc, setDoc] = React.useState(null);
  const [docType, setDocType] = React.useState('readme');
  const [docLoading, setDocLoading] = React.useState(false);
  const [deck, setDeck] = React.useState(null);
  const [deckLoading, setDeckLoading] = React.useState(false);
  const [prediction, setPrediction] = React.useState(null);
  const [predLoading, setPredLoading] = React.useState(false);

  const { data: projectData } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => (await api.get(`/projects/${id}`)).data,
  });

  const generateMeetingTasks = async () => {
    if (!meetingNotes.trim()) return toast.error('Paste some meeting notes first');
    setMeetingLoading(true);
    try {
      const { data } = await api.post('/ai/meeting-notes', { projectId: id, notes: meetingNotes });
      setMeetingResult(data);
      toast.success(`Created ${data.tasks?.length || 0} tasks`);
    } catch { toast.error('AI failed'); } finally { setMeetingLoading(false); }
  };

  const generateDoc = async () => {
    setDocLoading(true);
    try {
      const { data } = await api.post('/ai/documentation', { projectId: id, docType });
      setDoc(data.document);
    } catch { toast.error('Generation failed'); } finally { setDocLoading(false); }
  };
  const generateDeck = async () => {
    setDeckLoading(true);
    try {
      const { data } = await api.post('/ai/presentation', { projectId: id });
      setDeck(data.deck);
    } catch { toast.error('Generation failed'); } finally { setDeckLoading(false); }
  };
  const predict = async () => {
    setPredLoading(true);
    try {
      const { data } = await api.post('/ai/deadline-prediction', { projectId: id });
      setPrediction(data);
    } catch { toast.error('Prediction failed'); } finally { setPredLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Link to="/app/projects" className="hover:text-white">Projects</Link>
          <ChevronRight size={12} />
          <Link to={`/app/projects/${id}`} className="hover:text-white">{projectData?.project?.name || 'Loading'}</Link>
          <ChevronRight size={12} />
          <span>AI Studio</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-pulse-glow">
            <Sparkles size={18} className="text-white" />
          </div>
          <h2>AI Studio</h2>
        </div>
        <p className="text-slate-400 mt-3">Powered by Google Gemini — four superpowers built for student teams.</p>
      </div>

      {/* Meeting Notes → Tasks */}
      <div className="to-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center"><Brain size={18} /></div>
          <div className="flex-1">
            <h3 className="text-base mb-1">Meeting Notes → Tasks</h3>
            <p className="text-sm text-slate-400 mb-4">Paste the notes from your last stand-up. TeamOrbit extracts action items and creates tasks.</p>
            <textarea className="textarea" rows={5} placeholder="Paste meeting notes here…" value={meetingNotes} onChange={(e) => setMeetingNotes(e.target.value)} data-testid="ai-meeting-notes" />
            <div className="flex justify-end mt-3">
              <button className="btn-primary" onClick={generateMeetingTasks} disabled={meetingLoading} data-testid="ai-meeting-run">
                {meetingLoading ? <div className="spinner" /> : <><Sparkles size={14} /> Extract tasks</>}
              </button>
            </div>
            {meetingResult && (
              <div className="mt-5 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Summary</div>
                <p className="text-sm text-slate-300 mb-4">{meetingResult.summary}</p>
                <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Created tasks ({meetingResult.tasks?.length || 0})</div>
                <div className="space-y-2">
                  {(meetingResult.tasks || []).map((t) => (
                    <div key={t._id} className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                      <div className="font-medium text-sm">{t.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{t.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="to-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center justify-center"><FileText size={18} /></div>
          <div className="flex-1">
            <h3 className="text-base mb-1">Documentation Generator</h3>
            <p className="text-sm text-slate-400 mb-4">One-click generation of README, report, features list, API docs or future scope.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {['readme', 'report', 'features', 'api', 'future'].map((t) => (
                <button key={t} onClick={() => setDocType(t)} className={`px-3 py-1.5 rounded-full text-xs capitalize border transition-colors ${docType === t ? 'border-purple-400 bg-purple-500/15 text-white' : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'}`} data-testid={`ai-doc-type-${t}`}>
                  {t}
                </button>
              ))}
            </div>
            <button className="btn-primary" onClick={generateDoc} disabled={docLoading} data-testid="ai-doc-run">
              {docLoading ? <div className="spinner" /> : <><Sparkles size={14} /> Generate</>}
            </button>
            {doc && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs uppercase tracking-wider text-slate-500">Result ({docType})</div>
                  <button className="btn-ghost !py-1 !px-2 !text-xs" onClick={() => { navigator.clipboard.writeText(doc); toast.success('Copied'); }}><Copy size={11} /> Copy</button>
                </div>
                <pre className="whitespace-pre-wrap markdown-body max-h-[400px] overflow-y-auto p-4 rounded-xl bg-white/[0.02] border border-white/5" data-testid="ai-doc-output">{doc}</pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Presentation */}
      <div className="to-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center"><Presentation size={18} /></div>
          <div className="flex-1">
            <h3 className="text-base mb-1">Presentation Generator</h3>
            <p className="text-sm text-slate-400 mb-4">An 8-slide deck for demo day — problem, solution, architecture and more.</p>
            <button className="btn-primary" onClick={generateDeck} disabled={deckLoading} data-testid="ai-deck-run">
              {deckLoading ? <div className="spinner" /> : <><Sparkles size={14} /> Generate slides</>}
            </button>
            {deck?.slides && (
              <div className="mt-5 grid md:grid-cols-2 gap-3" data-testid="ai-deck-output">
                {deck.slides.map((s, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Slide {i + 1}</div>
                    <div className="font-medium mb-2">{s.title}</div>
                    <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                      {(s.bullets || []).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deadline Prediction */}
      <div className="to-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-center"><AlertTriangle size={18} /></div>
          <div className="flex-1">
            <h3 className="text-base mb-1">Deadline Risk Prediction</h3>
            <p className="text-sm text-slate-400 mb-4">Is your team on track? Get an honest assessment and a suggested action.</p>
            <button className="btn-primary" onClick={predict} disabled={predLoading} data-testid="ai-predict-run">
              {predLoading ? <div className="spinner" /> : <><Sparkles size={14} /> Analyse</>}
            </button>
            {prediction && (
              <div className="mt-5 p-5 rounded-xl bg-white/[0.03] border border-white/5" data-testid="ai-predict-output">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`badge ${prediction.prediction.risk === 'high' ? 'badge-red' : prediction.prediction.risk === 'medium' ? 'badge-yellow' : 'badge-green'}`}>
                    {prediction.prediction.risk} risk
                  </span>
                  <span className="text-xs text-slate-500">confidence {prediction.prediction.confidence}%</span>
                </div>
                <p className="text-sm text-slate-300 mb-3">{prediction.prediction.reason}</p>
                <p className="text-sm">
                  <span className="text-slate-500">Recommendation:</span> {prediction.prediction.recommendation}
                </p>
                <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                  <div><div className="text-xl font-medium">{prediction.stats.percentDone}%</div><div className="text-xs text-slate-500">done</div></div>
                  <div><div className="text-xl font-medium">{prediction.stats.overdue}</div><div className="text-xs text-slate-500">overdue</div></div>
                  <div><div className="text-xl font-medium">{prediction.stats.daysLeft ?? '—'}</div><div className="text-xs text-slate-500">days left</div></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStudio;
