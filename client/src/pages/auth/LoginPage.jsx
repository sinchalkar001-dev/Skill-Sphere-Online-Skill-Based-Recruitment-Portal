import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-surface-950 to-surface-950" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md mx-auto flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
            <BriefcaseIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">Skill Sphere</span>
        </Link>

        {/* Form Card */}
        <div className="w-full glass-card p-8 animate-scale-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-surface-100">Welcome Back</h1>
            <p className="text-sm text-surface-400 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="you@example.com"
                required
                id="login-email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input pr-12"
                  placeholder="••••••••"
                  required
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3"
              id="login-submit"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-surface-700/50">
            <p className="text-xs text-surface-500 text-center mb-3">Demo accounts (after seeding)</p>
            <div className="space-y-2">
              <p className="text-[10px] text-surface-500 uppercase tracking-wider">Recruiters</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setForm({ email: 'priya@techcorp.com', password: 'password123' })}
                  className="text-xs p-2 rounded-lg bg-surface-800/50 text-surface-400 hover:bg-surface-700 transition-colors text-center"
                >
                  🏢 TechCorp
                  <span className="block text-[9px] text-surface-500 mt-0.5">Full-Stack, React</span>
                </button>
                <button
                  onClick={() => setForm({ email: 'rahul@startupx.com', password: 'password123' })}
                  className="text-xs p-2 rounded-lg bg-surface-800/50 text-surface-400 hover:bg-surface-700 transition-colors text-center"
                >
                  🏢 StartupX
                  <span className="block text-[9px] text-surface-500 mt-0.5">Backend Fintech</span>
                </button>
                <button
                  onClick={() => setForm({ email: 'ananya@cloudnine.com', password: 'password123' })}
                  className="text-xs p-2 rounded-lg bg-surface-800/50 text-surface-400 hover:bg-surface-700 transition-colors text-center"
                >
                  🏢 CloudNine
                  <span className="block text-[9px] text-surface-500 mt-0.5">DevOps</span>
                </button>
              </div>
              <p className="text-[10px] text-surface-500 uppercase tracking-wider mt-2">Candidates</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setForm({ email: 'arjun@email.com', password: 'password123' })}
                  className="text-xs p-2 rounded-lg bg-surface-800/50 text-surface-400 hover:bg-surface-700 transition-colors"
                >
                  👤 Arjun (Full-Stack)
                </button>
                <button
                  onClick={() => setForm({ email: 'sneha@email.com', password: 'password123' })}
                  className="text-xs p-2 rounded-lg bg-surface-800/50 text-surface-400 hover:bg-surface-700 transition-colors"
                >
                  👤 Sneha (Backend)
                </button>
              </div>
            </div>
          </div>

          <p className="text-sm text-surface-400 text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
