import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Orbit, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email, newPassword });
      toast.success('Password reset. You can log in now.');
      navigate('/auth/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed');
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
        <h3 className="mb-2">Reset your password</h3>
        <p className="text-sm text-slate-400 mb-6">
          Enter your email and a new password. In this MVP the reset is instant — no email flow yet.
        </p>
        <form onSubmit={submit} className="space-y-4" data-testid="forgot-form">
          <div>
            <label className="label">Email</label>
            <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="forgot-email" />
          </div>
          <div>
            <label className="label">New password</label>
            <input type="password" required minLength={6} className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} data-testid="forgot-new-password" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center" data-testid="forgot-submit">
            {loading ? <div className="spinner" /> : (<>Reset password <ArrowRight size={14} /></>)}
          </button>
        </form>
        <div className="text-sm text-slate-400 mt-6 text-center">
          <Link to="/auth/login" className="text-purple-300 hover:text-purple-200">Back to login</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
