import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Orbit, ArrowRight, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const joinCode = params.get('join');
  const [form, setForm] = React.useState({
    name: '', email: '', password: '', role: 'owner', college: '',
  });
  const [skills, setSkills] = React.useState([]);
  const [skillInput, setSkillInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput('');
  };
  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signup({ ...form, skills });
      toast.success('Account created!');
      navigate(joinCode ? `/join/${joinCode}` : '/app');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-glow relative p-6 py-10">
      <div className="dotted-grid absolute inset-0 opacity-30 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="to-glass w-full max-w-lg rounded-2xl p-8 relative"
      >
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Orbit size={20} className="text-white" />
          </div>
          <span className="font-semibold">TeamOrbit</span>
        </Link>
        <h3 className="mb-2">Create your account</h3>
        <p className="text-sm text-slate-400 mb-6">
          {joinCode ? <>You've been invited to join team <span className="font-mono text-purple-300">{joinCode}</span>. Create an account to accept.</> : 'Get your team collaborating in under a minute.'}
        </p>
        <form onSubmit={submit} className="space-y-4" data-testid="signup-form">
          <div>
            <label className="label">Full name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ada Lovelace" data-testid="signup-name" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@college.edu" data-testid="signup-email" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required minLength={6} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" data-testid="signup-password" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} data-testid="signup-role">
                <option value="owner">Project Owner</option>
                <option value="member">Team Member</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
            <div>
              <label className="label">College</label>
              <input className="input" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="MIT" data-testid="signup-college" />
            </div>
          </div>
          <div>
            <label className="label">Skills</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Add a skill (e.g. React, Node.js)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                data-testid="signup-skill-input"
              />
              <button type="button" className="btn-secondary" onClick={addSkill} data-testid="signup-skill-add">Add</button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((s) => (
                  <span key={s} className="badge">
                    {s}
                    <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} className="text-purple-300 hover:text-white">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center" data-testid="signup-submit">
            {loading ? <div className="spinner" /> : (<>Create account <ArrowRight size={14} /></>)}
          </button>
        </form>
        <div className="text-sm text-slate-400 mt-6 text-center">
          Already have an account?{' '}
          <Link to={joinCode ? `/auth/login?join=${joinCode}` : '/auth/login'} className="text-purple-300 hover:text-purple-200" data-testid="signup-login-link">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
