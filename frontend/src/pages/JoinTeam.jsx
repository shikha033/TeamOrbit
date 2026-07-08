import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Orbit, ArrowRight, Users } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

const JoinTeam = () => {
  const { code } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState('idle'); // idle | joining | done | error
  const [team, setTeam] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      // Preserve the code and bounce to signup
      navigate(`/auth/signup?join=${encodeURIComponent(code)}`, { replace: true });
      return;
    }
    (async () => {
      setState('joining');
      try {
        const { data } = await api.post('/teams/join', { inviteCode: code });
        setTeam(data.team);
        setState('done');
        toast.success(`Joined ${data.team.name}`);
        setTimeout(() => navigate(`/app/teams/${data.team._id}`), 1200);
      } catch (err) {
        const msg = err.response?.data?.error || 'Could not join team';
        setError(msg);
        setState('error');
      }
    })();
  }, [user, loading, code, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center hero-glow relative p-6">
      <div className="dotted-grid absolute inset-0 opacity-30 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="to-glass w-full max-w-md rounded-2xl p-8 text-center"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Orbit size={20} className="text-white" />
          </div>
          <span className="font-semibold">TeamOrbit</span>
        </Link>

        {state === 'idle' || state === 'joining' ? (
          <>
            <div className="w-16 h-16 rounded-2xl mx-auto bg-gradient-to-br from-purple-500/20 to-blue-500/10 border border-white/10 flex items-center justify-center mb-5 animate-pulse-glow">
              <Users size={26} className="text-purple-300" />
            </div>
            <h3 className="mb-2">Joining the team…</h3>
            <p className="text-sm text-slate-400">Invite code <span className="font-mono text-purple-300">{code}</span></p>
            <div className="spinner mx-auto mt-6" />
          </>
        ) : state === 'done' && team ? (
          <>
            <div className="w-16 h-16 rounded-2xl mx-auto bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
              <Users size={26} className="text-emerald-300" />
            </div>
            <h3 className="mb-2">You're in!</h3>
            <p className="text-sm text-slate-400">Redirecting you to <span className="text-slate-200 font-medium">{team.name}</span>…</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl mx-auto bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
              <Users size={26} className="text-rose-300" />
            </div>
            <h3 className="mb-2">Couldn't join</h3>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <Link to="/app/teams" className="btn-primary inline-flex" data-testid="join-goto-teams">
              Go to Teams <ArrowRight size={14} />
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default JoinTeam;
