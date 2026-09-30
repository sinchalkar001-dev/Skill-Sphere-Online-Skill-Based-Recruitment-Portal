import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  BuildingOffice2Icon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import { ButtonSpinner } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { email: 'priya@techcorp.com', name: 'TechCorp', detail: 'Recruiter, full-stack and React roles', role: 'recruiter' },
  { email: 'rahul@startupx.com', name: 'StartupX', detail: 'Recruiter, fintech backend roles', role: 'recruiter' },
  { email: 'ananya@cloudnine.com', name: 'CloudNine', detail: 'Recruiter, DevOps roles', role: 'recruiter' },
  { email: 'arjun@email.com', name: 'Arjun', detail: 'Candidate, full-stack', role: 'candidate' },
  { email: 'sneha@email.com', name: 'Sneha', detail: 'Candidate, backend', role: 'candidate' },
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(form);
    setSubmitting(false);
    if (result.success) {
      toast.success('Welcome back');
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <AuthLayout
      title="Log in to Skill Sphere"
      subtitle={
        <>
          New here?{' '}
          <Link to="/register" className="link">
            Create an account
          </Link>
        </>
      }
    >
      <div className="card p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div role="alert" className="alert-danger">
              <ExclamationCircleIcon aria-hidden="true" className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="label">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
              required
              id="login-email"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="label">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input pr-12"
                autoComplete="current-password"
                required
                id="login-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn-ghost btn-icon absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-controls="login-password"
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full" id="login-submit">
            {submitting && <ButtonSpinner />}
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>

      <section aria-labelledby="demo-accounts-title" className="mt-8">
        <h2 id="demo-accounts-title" className="text-sm font-semibold text-foreground">
          Try a demo account
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Available after running the seed script. Choosing one fills in the form.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon = account.role === 'recruiter' ? BuildingOffice2Icon : UserIcon;
            return (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() => {
                    setForm({ email: account.email, password: 'password123' });
                    setError('');
                  }}
                  className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span aria-hidden="true" className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="h-[1.125rem] w-[1.125rem]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">{account.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{account.detail}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </AuthLayout>
  );
};

export default LoginPage;
