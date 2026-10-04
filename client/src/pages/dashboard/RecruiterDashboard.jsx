import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import QuickActions from '../../components/dashboard/QuickActions';
import { PageLoader } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import jobsApi from '../../api/jobsApi';
import applicationsApi from '../../api/applicationsApi';
import StatusBadge from '../../components/applications/StatusBadge';
import { formatDate, APPLICATION_STATUSES } from '../../utils/helpers';
import toast from 'react-hot-toast';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pipeline, setPipeline] = useState(null);
  // The target outlives `confirmOpen` so the dialog keeps its text while it animates out.
  const [jobToDelete, setJobToDelete] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const [{ data }, statsRes] = await Promise.all([
          jobsApi.getMyJobs({ limit: 50 }),
          applicationsApi.getStats(),
        ]);
        setJobs(data.data.jobs);
        setPipeline(statsRes.data.data.stats);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleToggle = async (jobId) => {
    try {
      const { data } = await jobsApi.toggleJobStatus(jobId);
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, isActive: data.data.job.isActive } : j))
      );
      toast.success(data.message);
    } catch {
      toast.error('Failed to toggle job status');
    }
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;
    setDeleting(true);
    try {
      await jobsApi.deleteJob(jobToDelete._id);
      setJobs((prev) => prev.filter((j) => j._id !== jobToDelete._id));
      toast.success('Job deleted');
      setConfirmOpen(false);
    } catch {
      toast.error('Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  const totalApplications = jobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0);
  const activeJobs = jobs.filter((j) => j.isActive).length;

  if (loading) return <PageLayout><PageLoader /></PageLayout>;

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Hiring dashboard</h1>
            <p className="page-subtitle">Manage roles and applicants for {user?.company?.name || 'your company'}.</p>
          </div>
          <Link to="/jobs/new" className="btn-primary self-start sm:self-auto">
            <PlusIcon aria-hidden="true" className="h-5 w-5" />
            Post a job
          </Link>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatsCard title="Open roles" value={activeJobs} icon={BriefcaseIcon} tone="success" />
          <StatsCard title="All postings" value={jobs.length} icon={DocumentTextIcon} tone="neutral" />
          <StatsCard title="Applicants" value={totalApplications} icon={UserGroupIcon} tone="info" />
          <StatsCard
            title="Applicants per role"
            value={jobs.length > 0 ? Math.round(totalApplications / jobs.length) : 0}
            icon={ChartBarIcon}
            tone="neutral"
          />
        </dl>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="card overflow-hidden lg:col-span-2 lg:self-start" aria-labelledby="job-postings-title">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <h2 id="job-postings-title" className="section-title">
                Your job postings
              </h2>
              {jobs.length > 0 && <span className="text-sm text-muted-foreground">{jobs.length} total</span>}
            </div>

            {jobs.length === 0 ? (
              <EmptyState
                icon={BriefcaseIcon}
                title="No jobs posted yet"
                description="Post your first role to start receiving applications."
                action={
                  <Link to="/jobs/new" className="btn-primary btn-sm">
                    <PlusIcon aria-hidden="true" className="h-4 w-4" />
                    Post a job
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {jobs.map((job) => {
                  const applicants = job.applicationsCount || 0;
                  return (
                    <li
                      key={job._id}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/jobs/${job._id}`}
                            className="truncate text-sm font-semibold text-foreground hover:text-primary-text sm:text-base"
                          >
                            {job.title}
                          </Link>
                          <span className={job.isActive ? 'badge-success' : 'badge-neutral'}>
                            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                            {job.isActive ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            {applicants} {applicants === 1 ? 'applicant' : 'applicants'}
                          </span>
                          <span>Posted {formatDate(job.createdAt)}</span>
                        </p>
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-1">
                        <Link to={`/jobs/${job._id}/applications`} className="btn-secondary btn-sm mr-1">
                          <UserGroupIcon aria-hidden="true" className="h-4 w-4" />
                          Review applicants
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleToggle(job._id)}
                          className="btn-ghost btn-icon"
                          aria-label={job.isActive ? `Pause ${job.title}` : `Reopen ${job.title}`}
                          title={job.isActive ? 'Pause' : 'Reopen'}
                        >
                          {job.isActive ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                        </button>
                        <Link
                          to={`/jobs/${job._id}/edit`}
                          className="btn-ghost btn-icon"
                          aria-label={`Edit ${job.title}`}
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setJobToDelete(job);
                            setConfirmOpen(true);
                          }}
                          className="btn-ghost btn-icon hover:bg-danger-soft hover:text-danger-soft-foreground"
                          aria-label={`Delete ${job.title}`}
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div className="space-y-6">
            {pipeline && pipeline.total > 0 && (
              <section className="card p-5" aria-labelledby="pipeline-title">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 id="pipeline-title" className="section-title">
                    Pipeline
                  </h2>
                  <span className="text-sm text-muted-foreground">{pipeline.total} applications</span>
                </div>
                <dl className="mt-4 space-y-2.5">
                  {APPLICATION_STATUSES.map(({ value }) => (
                    <div key={value} className="flex items-center justify-between gap-4">
                      <dt>
                        <StatusBadge status={value} />
                      </dt>
                      <dd className="text-sm font-semibold tabular-nums text-foreground">{pipeline.byStatus[value]}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
            <QuickActions role="recruiter" />
            <RecentActivity activities={notifications} />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete this job?"
        confirmLabel="Delete job"
        busy={deleting}
      >
        <p>
          <span className="font-semibold text-foreground">{jobToDelete?.title}</span> and all of its applications will be
          permanently deleted. This can&apos;t be undone.
        </p>
      </ConfirmDialog>
    </PageLayout>
  );
};

export default RecruiterDashboard;
