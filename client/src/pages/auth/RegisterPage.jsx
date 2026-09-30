import { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  BuildingOffice2Icon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import { ButtonSpinner } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'candidate', label: 'Find a job', description: 'Apply with your projects', icon: UserIcon },
  { value: 'recruiter', label: 'Hire', description: 'Post roles and score applicants', icon: BuildingOffice2Icon },
];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const confirmRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: searchParams.get('role') === 'recruiter' ? 'recruiter' : 'candidate',
    company: { name: '' },
  });

  const passwordsMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;
  const showMismatch = confirmTouched && passwordsMismatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setConfirmTouched(true);
      confirmRef.current?.focus();
      return;
    }
    if (form.role === 'recruiter' && !form.company.name.trim()) {
      setError('Company name is required for recruiters.');
      return;
    }

    setSubmitting(true);
    const result = await register(form);
    setSubmitting(false);
    if (result.success) {
      toast.success('Account created');
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        <>
          Already have one?{' '}
          <Link to="/login" className="link">
            Log in
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

          <fieldset>
            <legend className="label">I&apos;m joining to</legend>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(({ value, label, description, icon: Icon }) => {
                const selected = form.role === value;
                return (
                  <label
                    key={value}
                    className={`relative flex cursor-pointer flex-col gap-1.5 rounded-xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${
                      selected ? 'border-primary bg-primary-soft/60' : 'border-border-strong hover:border-input'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={selected}
                      onChange={() => setForm({ ...form, role: value })}
                      className="sr-only"
                    />
                    <Icon aria-hidden="true" className={`h-5 w-5 ${selected ? 'text-primary-text' : 'text-muted-foreground'}`} />
                    <span className="mt-1 text-sm font-semibold text-foreground">{label}</span>
                    <span className="text-xs leading-snug text-muted-foreground">{description}</span>
                    {selected && (
                      <CheckCircleIcon aria-hidden="true" className="absolute right-3 top-3 h-5 w-5 text-primary-text" />
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="register-name" className="label">
              Full name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              autoComplete="name"
              required
              id="register-name"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="label">
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
              id="register-email"
            />
          </div>

          {form.role === 'recruiter' && (
            <div>
              <label htmlFor="register-company" className="label">
                Company name
              </label>
              <input
                type="text"
                value={form.company.name}
                onChange={(e) => setForm({ ...form, company: { ...form.company, name: e.target.value } })}
                className="input"
                autoComplete="organization"
                required
                id="register-company"
              />
            </div>
          )}

          <div>
            <label htmlFor="register-password" className="label">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input pr-12"
                autoComplete="new-password"
                aria-describedby="register-password-hint"
                required
                minLength={6}
                id="register-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn-ghost btn-icon absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-controls="register-password"
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            <p id="register-password-hint" className="hint">
              At least 6 characters.
            </p>
          </div>

          <div>
            <label htmlFor="register-confirm-password" className="label">
              Confirm password
            </label>
            <input
              ref={confirmRef}
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              onBlur={() => setConfirmTouched(true)}
              className="input"
              autoComplete="new-password"
              aria-invalid={showMismatch || undefined}
              aria-describedby={showMismatch ? 'register-confirm-error' : undefined}
              required
              id="register-confirm-password"
            />
            {showMismatch && (
              <p id="register-confirm-error" role="alert" className="field-error">
                Passwords don&apos;t match.
              </p>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full" id="register-submit">
            {submitting && <ButtonSpinner />}
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
