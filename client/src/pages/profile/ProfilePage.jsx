import { useState } from 'react';
import {
  PencilSquareIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';
import FormSection from '../../components/common/FormSection';
import Avatar from '../../components/common/Avatar';
import { ButtonSpinner } from '../../components/common/LoadingSpinner';
import TechTagInput from '../../components/jobs/TechTagInput';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import toast from 'react-hot-toast';

const ExternalLink = ({ href, icon: Icon, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 text-sm font-semibold text-primary-text underline-offset-4 hover:underline"
  >
    <Icon aria-hidden="true" className="h-4 w-4" />
    {children}
    <span className="sr-only">(opens in a new tab)</span>
  </a>
);

const Field = ({ id, label, children, className = '' }) => (
  <div className={className}>
    <label htmlFor={id} className="label">
      {label}
    </label>
    {children}
  </div>
);

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || '',
    skills: user?.skills || [],
    experience: user?.experience || 0,
    portfolio: user?.portfolio || { github: '', linkedin: '', website: '' },
    company: user?.company || { name: '', website: '', description: '', size: '' },
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authApi.updateProfile(form);
      updateUser(data.data.user);
      toast.success('Profile saved');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const isCandidate = user.role === 'candidate';
  const hasPortfolio = user.portfolio?.github || user.portfolio?.linkedin || user.portfolio?.website;

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <section className="card p-6 sm:p-8" aria-labelledby="profile-name">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar name={user.name} size="2xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h1 id="profile-name" className="text-2xl font-bold tracking-tight text-foreground">
                    {user.name}
                  </h1>
                  <span className="badge-info mt-2 capitalize">{user.role}</span>
                </div>
                {!editing && (
                  <button type="button" onClick={() => setEditing(true)} className="btn-secondary btn-sm self-start">
                    <PencilSquareIcon aria-hidden="true" className="h-4 w-4" />
                    Edit profile
                  </button>
                )}
              </div>

              {user.bio && <p className="mt-4 max-w-prose text-sm leading-relaxed text-foreground/90">{user.bio}</p>}

              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <EnvelopeIcon aria-hidden="true" className="h-4 w-4 text-subtle-foreground" />
                  {user.email}
                </li>
                {user.phone && (
                  <li className="flex items-center gap-1.5">
                    <PhoneIcon aria-hidden="true" className="h-4 w-4 text-subtle-foreground" />
                    {user.phone}
                  </li>
                )}
                {user.location && (
                  <li className="flex items-center gap-1.5">
                    <MapPinIcon aria-hidden="true" className="h-4 w-4 text-subtle-foreground" />
                    {user.location}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>

        {editing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-6">
            <FormSection id="personal" title="Personal details">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="profile-name-input" label="Name">
                  <input
                    id="profile-name-input"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                    autoComplete="name"
                  />
                </Field>
                <Field id="profile-phone" label="Phone">
                  <input
                    id="profile-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input"
                    autoComplete="tel"
                  />
                </Field>
                <Field id="profile-location" label="Location">
                  <input
                    id="profile-location"
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="input"
                    placeholder="e.g. Pune, India"
                  />
                </Field>
                {isCandidate && (
                  <Field id="profile-experience" label="Experience (years)">
                    <input
                      id="profile-experience"
                      type="number"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: parseInt(e.target.value) || 0 })}
                      className="input"
                      min="0"
                    />
                  </Field>
                )}
              </div>
              <Field id="profile-bio" label="Bio">
                <textarea
                  id="profile-bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="input min-h-[6.5rem] resize-y"
                  maxLength={500}
                  placeholder="A few lines about you and the work you enjoy"
                  aria-describedby="profile-bio-count"
                />
                <p id="profile-bio-count" className="hint">
                  {form.bio.length} of 500 characters
                </p>
              </Field>
            </FormSection>

            {isCandidate && (
              <>
                <FormSection id="skills" title="Skills" description="Recruiters see these on every application you send.">
                  <label htmlFor="profile-skills" className="sr-only">
                    Add a skill
                  </label>
                  <TechTagInput
                    id="profile-skills"
                    tags={form.skills}
                    onChange={(skills) => setForm({ ...form, skills })}
                    placeholder="Add a skill"
                  />
                </FormSection>

                <FormSection id="portfolio" title="Portfolio links">
                  {[
                    { key: 'github', label: 'GitHub', placeholder: 'https://github.com/…' },
                    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/…' },
                    { key: 'website', label: 'Website', placeholder: 'https://your-site.com' },
                  ].map(({ key, label, placeholder }) => (
                    <Field key={key} id={`portfolio-${key}`} label={label}>
                      <input
                        id={`portfolio-${key}`}
                        type="url"
                        value={form.portfolio[key]}
                        onChange={(e) => setForm({ ...form, portfolio: { ...form.portfolio, [key]: e.target.value } })}
                        className="input"
                        placeholder={placeholder}
                      />
                    </Field>
                  ))}
                </FormSection>
              </>
            )}

            {user.role === 'recruiter' && (
              <FormSection id="company" title="Company details" description="Shown to candidates on each of your job postings.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field id="company-name" label="Company name">
                    <input
                      id="company-name"
                      type="text"
                      value={form.company.name}
                      onChange={(e) => setForm({ ...form, company: { ...form.company, name: e.target.value } })}
                      className="input"
                      autoComplete="organization"
                    />
                  </Field>
                  <Field id="company-website" label="Website">
                    <input
                      id="company-website"
                      type="url"
                      value={form.company.website}
                      onChange={(e) => setForm({ ...form, company: { ...form.company, website: e.target.value } })}
                      className="input"
                      placeholder="https://"
                    />
                  </Field>
                  <Field id="company-size" label="Company size">
                    <select
                      id="company-size"
                      value={form.company.size}
                      onChange={(e) => setForm({ ...form, company: { ...form.company, size: e.target.value } })}
                      className="input"
                    >
                      <option value="">Select a size</option>
                      <option value="1-50">1–50 employees</option>
                      <option value="51-200">51–200 employees</option>
                      <option value="201-500">201–500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </Field>
                </div>
                <Field id="company-description" label="Description">
                  <textarea
                    id="company-description"
                    value={form.company.description}
                    onChange={(e) => setForm({ ...form, company: { ...form.company, description: e.target.value } })}
                    className="input min-h-[5.5rem] resize-y"
                    placeholder="What your company does and who you hire"
                  />
                </Field>
              </FormSection>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving && <ButtonSpinner />}
                {saving ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 space-y-6">
            {isCandidate && (
              <>
                <section className="card p-6" aria-labelledby="skills-title">
                  <h2 id="skills-title" className="section-title">
                    Skills
                  </h2>
                  {user.skills?.length > 0 ? (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {user.skills.map((skill) => (
                        <li key={skill} className="chip px-2.5 py-1 text-sm">
                          {skill}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Add your skills so recruiters can see what you work with.{' '}
                      <button type="button" onClick={() => setEditing(true)} className="link">
                        Add skills
                      </button>
                    </p>
                  )}
                </section>

                <section className="card p-6" aria-labelledby="portfolio-title">
                  <h2 id="portfolio-title" className="section-title">
                    Portfolio
                  </h2>
                  {hasPortfolio ? (
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                      {user.portfolio.github && (
                        <ExternalLink href={user.portfolio.github} icon={CodeBracketIcon}>
                          GitHub
                        </ExternalLink>
                      )}
                      {user.portfolio.linkedin && (
                        <ExternalLink href={user.portfolio.linkedin} icon={GlobeAltIcon}>
                          LinkedIn
                        </ExternalLink>
                      )}
                      {user.portfolio.website && (
                        <ExternalLink href={user.portfolio.website} icon={LinkIcon}>
                          Website
                        </ExternalLink>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Link your GitHub, LinkedIn, or personal site.{' '}
                      <button type="button" onClick={() => setEditing(true)} className="link">
                        Add links
                      </button>
                    </p>
                  )}
                </section>

                {user.projects?.length > 0 && (
                  <section className="card p-6" aria-labelledby="projects-title">
                    <h2 id="projects-title" className="section-title">
                      Projects
                    </h2>
                    <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {user.projects.map((project, i) => (
                        <li key={i} className="flex flex-col rounded-xl border border-border p-4">
                          <h3 className="font-semibold text-foreground">{project.title}</h3>
                          {project.description && (
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
                          )}
                          {project.techStack?.length > 0 && (
                            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tech stack">
                              {project.techStack.map((t) => (
                                <li key={t} className="chip">
                                  {t}
                                </li>
                              ))}
                            </ul>
                          )}
                          {(project.liveUrl || project.repoUrl) && (
                            <div className="mt-auto flex gap-5 pt-3">
                              {project.liveUrl && (
                                <ExternalLink href={project.liveUrl} icon={ArrowTopRightOnSquareIcon}>
                                  Live demo
                                </ExternalLink>
                              )}
                              {project.repoUrl && (
                                <ExternalLink href={project.repoUrl} icon={CodeBracketIcon}>
                                  Code
                                </ExternalLink>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}

            {user.role === 'recruiter' && user.company && (
              <section className="card p-6" aria-labelledby="company-title">
                <h2 id="company-title" className="section-title">
                  Company
                </h2>
                <p className="mt-3 text-lg font-semibold text-foreground">{user.company.name}</p>
                {user.company.description && (
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{user.company.description}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                  {user.company.website && (
                    <ExternalLink href={user.company.website} icon={GlobeAltIcon}>
                      {user.company.website.replace(/^https?:\/\//, '')}
                    </ExternalLink>
                  )}
                  {user.company.size && (
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <UserGroupIcon aria-hidden="true" className="h-4 w-4" />
                      {user.company.size} employees
                    </span>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ProfilePage;
