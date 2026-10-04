import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Switch } from '@headlessui/react';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';
import FormSection from '../../components/common/FormSection';
import TechTagInput from '../../components/jobs/TechTagInput';
import { ButtonSpinner, PageLoader } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import jobsApi from '../../api/jobsApi';
import toast from 'react-hot-toast';

const Required = () => (
  <span className="text-danger-text" aria-hidden="true">
    {' '}*
  </span>
);

const EMPTY_FORM = {
  title: '',
  description: '',
  requirements: [''],
  responsibilities: [''],
  techStack: [],
  salary: { min: '', max: '', currency: 'INR', period: 'yearly' },
  location: '',
  locationType: 'onsite',
  jobType: 'full-time',
  experienceLevel: 'mid',
  applicationDeadline: '',
  maxApplications: '',
  assessment: {
    enabled: false,
    criteria: [],
  },
};

// Map a saved job onto the form's shape (lists always keep one empty row to type into)
const toFormState = (job) => ({
  title: job.title || '',
  description: job.description || '',
  requirements: job.requirements?.length ? job.requirements : [''],
  responsibilities: job.responsibilities?.length ? job.responsibilities : [''],
  techStack: job.techStack || [],
  salary: {
    min: job.salary?.min ?? '',
    max: job.salary?.max ?? '',
    currency: job.salary?.currency || 'INR',
    period: job.salary?.period || 'yearly',
  },
  location: job.location || '',
  locationType: job.locationType || 'onsite',
  jobType: job.jobType || 'full-time',
  experienceLevel: job.experienceLevel || 'mid',
  applicationDeadline: job.applicationDeadline ? job.applicationDeadline.slice(0, 10) : '',
  maxApplications: job.maxApplications ?? '',
  assessment: {
    enabled: Boolean(job.assessment?.enabled),
    criteria: (job.assessment?.criteria || []).map(({ name, maxScore, weight }) => ({ name, maxScore, weight })),
  },
});

// Serves both /jobs/new and /jobs/:id/edit
const PostJobPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loadingJob, setLoadingJob] = useState(isEdit);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isEdit) return undefined;
    let cancelled = false;
    setLoadingJob(true);

    const loadJob = async () => {
      try {
        const { data } = await jobsApi.getJobById(id);
        if (cancelled) return;
        const job = data.data.job;
        const ownerId = job.recruiter?._id || job.recruiter;
        if (ownerId !== userId) {
          toast.error('You can only edit your own job postings');
          navigate(`/jobs/${id}`, { replace: true });
          return;
        }
        setForm(toFormState(job));
        setLoadingJob(false);
      } catch {
        if (cancelled) return;
        toast.error('Job not found');
        navigate('/dashboard', { replace: true });
      }
    };
    loadJob();

    return () => {
      cancelled = true;
    };
  }, [id, isEdit, userId, navigate]);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const updateListItem = (field, index, value) => {
    setForm((prev) => {
      const list = [...prev[field]];
      list[index] = value;
      return { ...prev, [field]: list };
    });
  };

  const addListItem = (field) => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeListItem = (field, index) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const addCriteria = () => {
    setForm((prev) => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        criteria: [...prev.assessment.criteria, { name: '', maxScore: 10, weight: 25 }],
      },
    }));
  };

  const updateCriteria = (index, field, value) => {
    setForm((prev) => {
      const criteria = [...prev.assessment.criteria];
      criteria[index] = { ...criteria[index], [field]: value };
      return { ...prev, assessment: { ...prev.assessment, criteria } };
    });
  };

  const removeCriteria = (index) => {
    setForm((prev) => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        criteria: prev.assessment.criteria.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        requirements: form.requirements.filter((r) => r.trim()),
        responsibilities: form.responsibilities.filter((r) => r.trim()),
        salary: {
          ...form.salary,
          min: form.salary.min ? parseInt(form.salary.min) : undefined,
          max: form.salary.max ? parseInt(form.salary.max) : undefined,
        },
        maxApplications: form.maxApplications ? parseInt(form.maxApplications) : undefined,
        applicationDeadline: form.applicationDeadline || undefined,
      };

      const { data } = isEdit ? await jobsApi.updateJob(id, payload) : await jobsApi.createJob(payload);
      toast.success(isEdit ? 'Changes saved' : 'Job posted');
      navigate(`/jobs/${data.data.job._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || (isEdit ? 'Failed to save changes' : 'Failed to post job'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderList = (field, singular, placeholder) => (
    <>
      {form[field].map((value, i) => (
        <div key={i} className="flex gap-2">
          <label htmlFor={`${field}-${i}`} className="sr-only">
            {singular} {i + 1}
          </label>
          <input
            id={`${field}-${i}`}
            type="text"
            value={value}
            onChange={(e) => updateListItem(field, i, e.target.value)}
            className="input flex-1"
            placeholder={i === 0 ? placeholder : `${singular} ${i + 1}`}
          />
          {form[field].length > 1 && (
            <button
              type="button"
              onClick={() => removeListItem(field, i)}
              className="btn-ghost btn-icon h-11 w-11 flex-shrink-0 hover:bg-danger-soft hover:text-danger-soft-foreground"
              aria-label={`Remove ${singular.toLowerCase()} ${i + 1}`}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => addListItem(field)} className="btn-soft btn-sm">
        <PlusIcon aria-hidden="true" className="h-4 w-4" />
        Add {singular.toLowerCase()}
      </button>
    </>
  );

  if (loadingJob) return <PageLayout><PageLoader /></PageLayout>;

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
        <Link
          to={isEdit ? `/jobs/${id}` : '/dashboard'}
          className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
          {isEdit ? 'Back to posting' : 'Dashboard'}
        </Link>
        <h1 className="page-title mt-6">{isEdit ? 'Edit job' : 'Post a job'}</h1>
        <p className="page-subtitle">
          {isEdit
            ? 'Changes appear on the posting as soon as you save. Fields marked * are required.'
            : 'Candidates see everything below, so be specific. Fields marked * are required.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <FormSection id="basics" title="Role basics" description="The title and description are what candidates read first.">
            <div>
              <label htmlFor="job-title" className="label">
                Job title
                <Required />
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="input"
                placeholder="e.g. Senior React developer"
                required
                id="job-title"
              />
            </div>

            <div>
              <label htmlFor="job-description" className="label">
                Description
                <Required />
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="input min-h-[10rem] resize-y"
                placeholder="Describe the role, the team, and what success looks like."
                required
                id="job-description"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="job-type" className="label">
                  Job type
                </label>
                <select id="job-type" value={form.jobType} onChange={(e) => updateField('jobType', e.target.value)} className="input">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label htmlFor="job-experience" className="label">
                  Experience level
                </label>
                <select
                  id="job-experience"
                  value={form.experienceLevel}
                  onChange={(e) => updateField('experienceLevel', e.target.value)}
                  className="input"
                >
                  <option value="entry">Entry level</option>
                  <option value="mid">Mid level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
            </div>
          </FormSection>

          <FormSection id="location-pay" title="Location and pay">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="job-location" className="label">
                  Location
                </label>
                <input
                  id="job-location"
                  type="text"
                  value={form.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="input"
                  placeholder="e.g. Bengaluru, India"
                />
              </div>
              <div>
                <label htmlFor="job-work-style" className="label">
                  Work style
                </label>
                <select
                  id="job-work-style"
                  value={form.locationType}
                  onChange={(e) => updateField('locationType', e.target.value)}
                  className="input"
                >
                  <option value="onsite">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'min', label: 'Minimum salary per year', placeholder: '1000000' },
                  { key: 'max', label: 'Maximum salary per year', placeholder: '2000000' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label htmlFor={`salary-${key}`} className="label">
                      {label}
                    </label>
                    <div className="relative">
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                      >
                        ₹
                      </span>
                      <input
                        id={`salary-${key}`}
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={form.salary[key]}
                        onChange={(e) => setForm((prev) => ({ ...prev, salary: { ...prev.salary, [key]: e.target.value } }))}
                        className="input pl-8"
                        placeholder={placeholder}
                        aria-describedby="salary-hint"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p id="salary-hint" className="hint">
                Leave both blank to show the salary as &ldquo;Not disclosed&rdquo;.
              </p>
            </div>
          </FormSection>

          <FormSection
            id="tech-stack"
            title="Tech stack"
            description="Candidates search by these, so list the tools the role uses day to day."
          >
            <label htmlFor="job-tech-stack" className="sr-only">
              Add a technology
            </label>
            <TechTagInput id="job-tech-stack" tags={form.techStack} onChange={(tags) => updateField('techStack', tags)} />
          </FormSection>

          <FormSection id="requirements" title="Requirements" description="Skills and experience a candidate needs.">
            {renderList('requirements', 'Requirement', 'e.g. 3+ years building React applications')}
          </FormSection>

          <FormSection id="responsibilities" title="Responsibilities" description="What the person will do in this role.">
            {renderList('responsibilities', 'Responsibility', 'e.g. Own the checkout flow end to end')}
          </FormSection>

          <FormSection
            id="assessment"
            title="Assessment rubric"
            description="Score every applicant on the same criteria. Weights are relative to each other."
            action={
              <Switch
                checked={form.assessment.enabled}
                onChange={(enabled) => setForm((prev) => ({ ...prev, assessment: { ...prev.assessment, enabled } }))}
                className={`relative mt-0.5 inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                  form.assessment.enabled ? 'bg-primary' : 'bg-input'
                }`}
              >
                <span className="sr-only">Use an assessment rubric</span>
                <span
                  aria-hidden="true"
                  className={`inline-block h-4 w-4 transform rounded-full bg-card shadow transition-transform duration-150 ${
                    form.assessment.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </Switch>
            }
          >
            {form.assessment.enabled && (
              <>
                {form.assessment.criteria.length > 0 && (
                  <div
                    aria-hidden="true"
                    className="hidden grid-cols-[1fr_6.5rem_6.5rem_2.75rem] gap-3 text-xs font-medium text-muted-foreground sm:grid"
                  >
                    <span>Criterion</span>
                    <span>Max score</span>
                    <span>Weight</span>
                    <span />
                  </div>
                )}
                {form.assessment.criteria.map((c, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/40 p-3 sm:grid-cols-[1fr_6.5rem_6.5rem_2.75rem] sm:items-center sm:border-0 sm:bg-transparent sm:p-0"
                  >
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor={`criterion-${i}-name`} className="label sm:sr-only">
                        Criterion
                      </label>
                      <input
                        id={`criterion-${i}-name`}
                        type="text"
                        value={c.name}
                        onChange={(e) => updateCriteria(i, 'name', e.target.value)}
                        className="input"
                        placeholder="e.g. Technical skills"
                      />
                    </div>
                    <div>
                      <label htmlFor={`criterion-${i}-max`} className="label sm:sr-only">
                        Max score
                      </label>
                      <input
                        id={`criterion-${i}-max`}
                        type="number"
                        value={c.maxScore}
                        onChange={(e) => updateCriteria(i, 'maxScore', parseInt(e.target.value) || 10)}
                        className="input"
                        min={1}
                      />
                    </div>
                    <div>
                      <label htmlFor={`criterion-${i}-weight`} className="label sm:sr-only">
                        Weight
                      </label>
                      <input
                        id={`criterion-${i}-weight`}
                        type="number"
                        value={c.weight}
                        onChange={(e) => updateCriteria(i, 'weight', parseInt(e.target.value) || 25)}
                        className="input"
                        min={1}
                        max={100}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCriteria(i)}
                      className="btn-ghost btn-icon col-span-2 h-11 w-11 justify-self-end hover:bg-danger-soft hover:text-danger-soft-foreground sm:col-span-1"
                      aria-label={`Remove ${c.name || `criterion ${i + 1}`}`}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                {form.assessment.criteria.length === 0 && (
                  <p className="text-sm text-muted-foreground">No criteria yet. Add the first one to start the rubric.</p>
                )}
                <button type="button" onClick={addCriteria} className="btn-soft btn-sm">
                  <PlusIcon aria-hidden="true" className="h-4 w-4" />
                  Add criterion
                </button>
              </>
            )}
          </FormSection>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary" id="post-job-submit">
              {submitting && <ButtonSpinner />}
              {isEdit ? (submitting ? 'Saving…' : 'Save changes') : submitting ? 'Posting…' : 'Post job'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default PostJobPage;
