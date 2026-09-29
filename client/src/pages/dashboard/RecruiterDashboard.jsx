import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlusCircleIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import QuickActions from '../../components/dashboard/QuickActions';
import { PageLoader } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import jobsApi from '../../api/jobsApi';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await jobsApi.getMyJobs({ limit: 50 });
        setJobs(data.data.jobs);
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

  const handleDelete = async (jobId) => {
    if (!confirm('Delete this job and all its applications?')) return;
    try {
      await jobsApi.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      toast.success('Job deleted');
    } catch {
      toast.error('Failed to delete job');
    }
  };

  const totalApplications = jobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0);
  const activeJobs = jobs.filter((j) => j.isActive).length;

  if (loading) return <PageLayout><PageLoader /></PageLayout>;

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-100">
              Recruiter Dashboard
            </h1>
            <p className="text-surface-400 mt-1">
              {user?.company?.name || 'Your company'} — Manage jobs and applications
            </p>
          </div>
          <Link to="/jobs/new" className="btn-primary hidden sm:flex">
            <PlusCircleIcon className="h-5 w-5" />
            Post Job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Jobs"
            value={jobs.length}
            icon={<BriefcaseIcon className="h-6 w-6 text-primary-400" />}
            color="primary"
          />
          <StatsCard
            title="Active Jobs"
            value={activeJobs}
            icon={<ChartBarIcon className="h-6 w-6 text-emerald-400" />}
            color="emerald"
          />
          <StatsCard
            title="Total Applicants"
            value={totalApplications}
            icon={<UserGroupIcon className="h-6 w-6 text-accent-400" />}
            color="accent"
          />
          <StatsCard
            title="Avg Applicants/Job"
            value={jobs.length > 0 ? Math.round(totalApplications / jobs.length) : 0}
            icon={<ChartBarIcon className="h-6 w-6 text-amber-400" />}
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jobs List */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-surface-100">Your Job Postings</h3>
                <Link to="/jobs/new" className="text-sm text-primary-400 hover:text-primary-300 sm:hidden">
                  + New Job
                </Link>
              </div>

              {jobs.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="No jobs posted yet"
                  description="Start hiring by posting your first job"
                  action={
                    <Link to="/jobs/new" className="btn-primary text-sm">
                      <PlusCircleIcon className="h-4 w-4" />
                      Post Your First Job
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      className="flex items-center justify-between p-4 rounded-xl bg-surface-800/30 hover:bg-surface-700/30 transition-all border border-surface-700/30"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-surface-100 truncate">
                            {job.title}
                          </h4>
                          <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                            job.isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-surface-600/20 text-surface-400 border border-surface-600/30'
                          }`}>
                            {job.isActive ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-surface-400">
                          <span>{job.applicationsCount || 0} applicants</span>
                          <span>Posted {formatDate(job.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/jobs/${job._id}/applications`}
                          className="p-2 rounded-lg hover:bg-surface-600/50 text-surface-400 hover:text-primary-400 transition-colors"
                          title="View Applications"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/jobs/${job._id}/edit`}
                          className="p-2 rounded-lg hover:bg-surface-600/50 text-surface-400 hover:text-amber-400 transition-colors"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleToggle(job._id)}
                          className={`p-2 rounded-lg hover:bg-surface-600/50 transition-colors ${
                            job.isActive ? 'text-surface-400 hover:text-amber-400' : 'text-surface-500 hover:text-emerald-400'
                          }`}
                          title={job.isActive ? 'Pause' : 'Activate'}
                        >
                          <span className="text-xs">{job.isActive ? '⏸' : '▶'}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-surface-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions role="recruiter" />
            <RecentActivity activities={notifications} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default RecruiterDashboard;
