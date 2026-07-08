import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, Smile, ChevronRight, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

const EMOJIS = ['😀', '😂', '👍', '👏', '🔥', '🚀', '💡', '❤️', '🎉', '✅', '⚠️', '🐛'];

const Chat = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [projectName, setProjectName] = useState('');
  const endRef = useRef(null);

  const scrollToEnd = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  const load = async () => {
    try {
      const { data } = await api.get(`/chat/${id}`);
      setMessages(data.messages);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
    api.get(`/projects/${id}`).then((r) => setProjectName(r.data.project?.name || ''));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Poll every 3s for near real-time updates
  useEffect(() => {
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => { scrollToEnd(); }, [messages.length]);

  // Simulated typing indicator
  useEffect(() => {
    if (text) {
      setOtherTyping(false);
    } else {
      const rand = Math.random();
      if (rand > 0.7) setOtherTyping(true);
      const t = setTimeout(() => setOtherTyping(false), 2500);
      return () => clearTimeout(t);
    }
  }, [text]);

  const send = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    const draft = text;
    setText('');
    try {
      const { data } = await api.post(`/chat/${id}`, { text: draft });
      setMessages((prev) => [...prev, data.message]);
    } catch {
      toast.error('Failed to send message');
      setText(draft);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] gap-4">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link to="/app/projects" className="hover:text-white">Projects</Link>
          <ChevronRight size={12} />
          <Link to={`/app/projects/${id}`} className="hover:text-white">{projectName || 'Loading'}</Link>
          <ChevronRight size={12} />
          <span>Chat</span>
        </div>
        <h2 className="text-2xl">Project chat</h2>
      </div>

      <div className="to-card flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="chat-messages-container">
          {loading && messages.length === 0 && (
            <div className="text-center text-sm text-slate-500 py-10">Loading chat…</div>
          )}
          {!loading && messages.length === 0 && (
            <div className="text-center text-slate-500 py-10">
              <p>No messages yet. Say hi to your team 👋</p>
            </div>
          )}
          {messages.map((m) => {
            const mine = m.author?._id === user?._id;
            return (
              <div key={m._id} className={`flex gap-3 ${mine ? 'flex-row-reverse' : ''}`} data-testid={`chat-message-${m._id}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-semibold uppercase shrink-0">
                  {m.author?.name?.charAt(0) || '?'}
                </div>
                <div className={`max-w-[70%] ${mine ? 'items-end' : ''} flex flex-col`}>
                  <div className={`text-[11px] text-slate-500 mb-1 ${mine ? 'text-right' : ''}`}>
                    {m.author?.name} · {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className={`p-3 rounded-2xl ${mine ? 'bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white' : 'bg-white/[0.04] border border-white/10 text-slate-200'}`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
                  </div>
                  {mine && m.readBy?.length > 1 && (
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1"><CheckCheck size={11} /> Read by {m.readBy.length - 1}</div>
                  )}
                </div>
              </div>
            );
          })}
          {otherTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
              </span>
              someone is typing…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="border-t border-white/5 p-4 flex items-center gap-2 relative">
          <button type="button" className="btn-ghost !p-2" onClick={() => setEmojiOpen(!emojiOpen)} data-testid="chat-emoji-toggle">
            <Smile size={18} />
          </button>
          {emojiOpen && (
            <div className="absolute bottom-14 left-4 to-glass rounded-xl p-3 grid grid-cols-6 gap-1 z-10">
              {EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => { setText(text + e); setEmojiOpen(false); }} className="text-xl hover:bg-white/10 rounded p-1">{e}</button>
              ))}
            </div>
          )}
          <input
            className="input flex-1"
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            data-testid="chat-input"
          />
          <button type="submit" className="btn-primary !py-2 !px-3" data-testid="chat-send">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
