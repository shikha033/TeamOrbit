import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Orbit, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const joinCode = params.get('join');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(joinCode ? `/join/${joinCode}` : '/app');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex hero-glow relative">
      <div className="dotted-grid absolute inset-0 opacity-30 pointer-events-none" />
      <div className="hidden md:flex flex-1 items-center justify-center p-10 relative">
        <div className="max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Orbit size={20} className="text-white" />
            </div>
            <span className="font-semibold text-lg">TeamOrbit</span>
          </Link>
          <h2 className="mb-4">Where <span className="serif-highlight text-gradient">student teams</span> ship real projects.</h2>
          <p className="text-slate-400 leading-relaxed">
            Fair contribution scores. AI task allocation. Auto-generated docs and slides. Log in
            and get back to what matters — building.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="to-glass w-full max-w-md rounded-2xl p-8"
        >
          <div className="mb-6 md:hidden">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <Orbit size={22} className="text-purple-300" />
              <span className="font-semibold">TeamOrbit</span>
            </Link>
          </div>
          <h3 className="mb-2">Welcome back</h3>
          <p className="text-sm text-slate-400 mb-8">
            {joinCode ? <>Sign in to join team <span className="font-mono text-purple-300">{joinCode}</span></> : 'Sign in to continue to your projects.'}
          </p>
          <form onSubmit={submit} className="space-y-4" data-testid="login-form">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                data-testid="login-email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0">Password</label>
                <Link to="/auth/forgot" className="text-xs text-purple-300 hover:text-purple-200" data-testid="login-forgot-link">Forgot?</Link>
              </div>
              <input
                type="password"
                required
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                data-testid="login-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
              data-testid="login-submit"
            >
              {loading ? <div className="spinner" /> : (<>Sign in <ArrowRight size={14} /></>)}
            </button>
          </form>
          <div className="text-sm text-slate-400 mt-6 text-center">
            Don't have an account?{' '}
            <Link to={joinCode ? `/auth/signup?join=${joinCode}` : '/auth/signup'} className="text-purple-300 hover:text-purple-200" data-testid="login-signup-link">Create one</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
