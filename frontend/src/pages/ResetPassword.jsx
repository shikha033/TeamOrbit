import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Orbit, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset. You can log in now.');
      navigate('/auth/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'This reset link is invalid or has expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-glow relative p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="to-glass w-full max-w-md rounded-2xl p-8"
      >
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Orbit size={20} className="text-white" />
          </div>
          <span className="font-semibold">TeamOrbit</span>
        </Link>
        <h3 className="mb-2">Choose a new password</h3>
        <p className="text-sm text-slate-400 mb-6">
          This link is valid for 15 minutes from when it was sent.
        </p>
        <form onSubmit={submit} className="space-y-4" data-testid="reset-form">
          <div>
            <label className="label">New password</label>
            <input type="password" required minLength={6} className="input" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="reset-password" />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input type="password" required minLength={6} className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} data-testid="reset-password-confirm" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center" data-testid="reset-submit">
            {loading ? <div className="spinner" /> : (<>Reset password <ArrowRight size={14} /></>)}
          </button>
        </form>
        <div className="text-sm text-slate-400 mt-6 text-center">
          <Link to="/auth/forgot" className="text-purple-300 hover:text-purple-200">Request a new link</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
