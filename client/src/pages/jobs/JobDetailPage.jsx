import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPinIcon,
  BriefcaseIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import { PageLoader, ButtonSpinner } from '../../components/common/LoadingSpinner';
import { getWorkStyleIcon } from '../../components/jobs/jobMeta';
import { useAuth } from '../../context/AuthContext';
import jobsApi from '../../api/jobsApi';
import applicationsApi from '../../api/applicationsApi';
import { formatDate, formatSalary, getLocationTypeLabel, getJobTypeLabel, getExperienceLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';

const emptyProject = () => ({ title: '', description: '', techStack: [], url: '' });

const JobDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [projectShowcase, setProjectShowcase] = useState([emptyProject()]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await jobsApi.getJobById(id);
        setJob(data.data.job);
      } catch {
        toast.error('Job not found');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const updateProject = (index, field, value) => {
    setProjectShowcase((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setApplying(true);
    try {
      const filtered = projectShowcase.filter((p) => p.title.trim());
      await applicationsApi.create({
        jobId: id,
        coverLetter,
        projectShowcase: filtered,
      });
      toast.success('Application submitted');
      setApplyOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <PageLayout><PageLoader /></PageLayout>;
  if (!job) return null;

  const recruiter = job.recruiter;
  const companyName = recruiter?.company?.name || recruiter?.name || 'Company';
  const isRecruiter = user?.role === 'recruiter';
  const isOwner = user?._id === recruiter?._id || user?.id === recruiter?._id;
  const applicants = job.applicationsCount || 0;
  const WorkStyleIcon = getWorkStyleIcon(job.locationType);

  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
          All jobs
        </Link>

        <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar name={companyName} square size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{job.title}</h1>
            <p className="mt-1 text-base text-muted-foreground">{companyName}</p>
            <ul className="mt-4 flex flex-wrap gap-2 text-sm">
              {[
                { icon: MapPinIcon, label: job.location || 'Location not listed' },
                { icon: WorkStyleIcon, label: getLocationTypeLabel(job.locationType) },
                { icon: BriefcaseIcon, label: getJobTypeLabel(job.jobType) },
                { icon: ChartBarIcon, label: getExperienceLabel(job.experienceLevel) },
              ].map(({ icon: Icon, label }, i) => (
                <li
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-foreground"
                >
                  <Icon aria-hidden="true" className="h-4 w-4 text-subtle-foreground" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Apply panel: first on mobile, right column on desktop */}
          <aside className="order-first space-y-6 lg:order-last">
            <div className="card p-6 lg:sticky lg:top-24">
              <p className="text-sm text-muted-foreground">Salary</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-foreground">{formatSalary(job.salary)}</p>

              {isOwner ? (
                <div className="mt-5 space-y-2.5">
                  <Link to={`/jobs/${job._id}/applications`} className="btn-primary w-full">
                    <UserGroupIcon aria-hidden="true" className="h-5 w-5" />
                    Review applicants ({applicants})
                  </Link>
                  <Link to={`/jobs/${job._id}/edit`} className="btn-secondary w-full">
                    <PencilSquareIcon aria-hidden="true" className="h-5 w-5" />
                    Edit job
                  </Link>
                </div>
              ) : !isRecruiter ? (
                <>
                  <button
                    type="button"
                    onClick={() => (isAuthenticated ? setApplyOpen(true) : navigate('/login'))}
                    className="btn-primary btn-lg mt-5 w-full"
                    id="apply-button"
                  >
                    {isAuthenticated ? 'Apply now' : 'Log in to apply'}
                  </button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    {job.applicationDeadline
                      ? `Apply by ${formatDate(job.applicationDeadline)}`
                      : 'No application deadline'}
                  </p>
                </>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Recruiter accounts can&apos;t apply to jobs.</p>
              )}

              <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Applicants</dt>
                  <dd className="font-medium text-foreground">{applicants}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Posted</dt>
                  <dd className="font-medium text-foreground">{formatDate(job.createdAt)}</dd>
                </div>
                {job.assessment?.enabled && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Assessment</dt>
                    <dd className="flex items-center gap-1.5 font-medium text-foreground">
                      <ClipboardDocumentCheckIcon aria-hidden="true" className="h-4 w-4 text-iris" />
                      Rubric scored
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {recruiter?.company && (
              <section className="card p-6" aria-labelledby="company-title">
                <h2 id="company-title" className="section-title">
                  About {recruiter.company.name}
                </h2>
                {recruiter.company.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{recruiter.company.description}</p>
                )}
                {recruiter.company.size && (
                  <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <UserGroupIcon aria-hidden="true" className="h-4 w-4" />
                    {recruiter.company.size} employees
                  </p>
                )}
                {recruiter.company.website && (
                  <a
                    href={recruiter.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link mt-3 inline-flex items-center gap-1 text-sm"
                  >
                    Visit website
                    <ArrowTopRightOnSquareIcon aria-hidden="true" className="h-4 w-4" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </section>
            )}
          </aside>

          <article className="card lg:col-span-2">
            <section className="p-6 sm:p-8" aria-labelledby="about-role-title">
              <h2 id="about-role-title" className="section-title">
                About the role
              </h2>
              <div className="mt-3 max-w-prose whitespace-pre-wrap text-[0.9375rem] leading-7 text-foreground/90">
                {job.description}
              </div>
            </section>

            {job.techStack?.length > 0 && (
              <section className="border-t border-border p-6 sm:p-8" aria-labelledby="tech-stack-title">
                <h2 id="tech-stack-title" className="section-title">
                  Tech stack
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {job.techStack.map((tech) => (
                    <li key={tech} className="chip px-2.5 py-1 text-sm">
                      {tech}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {job.requirements?.length > 0 && (
              <section className="border-t border-border p-6 sm:p-8" aria-labelledby="requirements-title">
                <h2 id="requirements-title" className="section-title">
                  Requirements
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex gap-3 text-[0.9375rem] leading-6 text-foreground/90">
                      <CheckCircleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-text" />
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {job.responsibilities?.length > 0 && (
              <section className="border-t border-border p-6 sm:p-8" aria-labelledby="responsibilities-title">
                <h2 id="responsibilities-title" className="section-title">
                  Responsibilities
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex gap-3 text-[0.9375rem] leading-6 text-foreground/90">
                      <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={applyOpen}
        onClose={() => setApplyOpen(false)}
        title="Apply for this role"
        description={`${job.title} at ${companyName}`}
        size="lg"
      >
        <form onSubmit={handleApply} className="space-y-6">
          <div>
            <label htmlFor="apply-cover-letter" className="label">
              Cover letter <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="input min-h-[8rem] resize-y"
              placeholder="What makes you a good fit for this role?"
              maxLength={3000}
              aria-describedby="apply-cover-letter-count"
              id="apply-cover-letter"
            />
            <p id="apply-cover-letter-count" className="hint">
              {coverLetter.length} of 3,000 characters
            </p>
          </div>

          <fieldset>
            <legend className="label">
              Projects <span className="font-normal text-muted-foreground">(optional)</span>
            </legend>
            <p className="hint -mt-0.5 mb-3">Add up to three projects that show relevant work.</p>
            <div className="space-y-4">
              {projectShowcase.map((project, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/40 p-4">
                  <p className="text-xs font-semibold text-muted-foreground">Project {i + 1}</p>
                  <div className="mt-3 space-y-3">
                    <div>
                      <label htmlFor={`project-${i}-title`} className="label">
                        Title
                      </label>
                      <input
                        id={`project-${i}-title`}
                        type="text"
                        value={project.title}
                        onChange={(e) => updateProject(i, 'title', e.target.value)}
                        className="input"
                        placeholder="e.g. Realtime expense splitter"
                      />
                    </div>
                    <div>
                      <label htmlFor={`project-${i}-description`} className="label">
                        Description
                      </label>
                      <textarea
                        id={`project-${i}-description`}
                        value={project.description}
                        onChange={(e) => updateProject(i, 'description', e.target.value)}
                        className="input min-h-[4.5rem] resize-y"
                        placeholder="What it does and what you built"
                      />
                    </div>
                    <div>
                      <label htmlFor={`project-${i}-url`} className="label">
                        Link
                      </label>
                      <input
                        id={`project-${i}-url`}
                        type="url"
                        value={project.url}
                        onChange={(e) => updateProject(i, 'url', e.target.value)}
                        className="input"
                        placeholder="https://github.com/…"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {projectShowcase.length < 3 && (
              <button
                type="button"
                onClick={() => setProjectShowcase((prev) => [...prev, emptyProject()])}
                className="btn-soft btn-sm mt-3"
              >
                <PlusIcon aria-hidden="true" className="h-4 w-4" />
                Add another project
              </button>
            )}
          </fieldset>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setApplyOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={applying} className="btn-primary" id="submit-application">
              {applying && <ButtonSpinner />}
              {applying ? 'Submitting…' : 'Submit application'}
            </button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
};

export default JobDetailPage;
