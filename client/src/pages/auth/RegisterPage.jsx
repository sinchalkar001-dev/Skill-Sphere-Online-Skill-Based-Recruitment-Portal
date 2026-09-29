import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, BriefcaseIcon, UserIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate',
    company: { name: '' },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.role === 'recruiter' && !form.company.name.trim()) {
      toast.error('Company name is required for recruiters');
      return;
    }

    const result = await register(form);
    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-950 via-primary-950/30 to-surface-950" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-500/15 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md mx-auto flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
            <BriefcaseIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">Skill Sphere</span>
        </Link>

        <div className="w-full glass-card p-8 animate-scale-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-surface-100">Create Account</h1>
            <p className="text-sm text-surface-400 mt-2">Join Skill Sphere today</p>
          </div>

          {/* Role Selector */}
          <div className="flex gap-3 mb-6">
            {[
              { value: 'candidate', label: 'Candidate', icon: UserIcon },
              { value: 'recruiter', label: 'Recruiter', icon: BuildingOffice2Icon },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, role: value })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                  form.role === value
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                    : 'border-surface-600/50 text-surface-400 hover:border-surface-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="John Doe"
                required
                id="register-name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="you@example.com"
                required
                id="register-email"
              />
            </div>

            {form.role === 'recruiter' && (
              <div className="animate-slide-down">
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={form.company.name}
                  onChange={(e) => setForm({ ...form, company: { ...form.company, name: e.target.value } })}
                  className="input"
                  placeholder="Acme Corp"
                  required
                  id="register-company"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input pr-12"
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  id="register-password"
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

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="input"
                placeholder="••••••••"
                required
                id="register-confirm-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3"
              id="register-submit"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-sm text-surface-400 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
