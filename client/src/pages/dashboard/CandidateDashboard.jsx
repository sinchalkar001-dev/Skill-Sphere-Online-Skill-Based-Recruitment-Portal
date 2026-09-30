import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckBadgeIcon,
  DocumentTextIcon,
  StarIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import QuickActions from '../../components/dashboard/QuickActions';
import ApplicationCard from '../../components/applications/ApplicationCard';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import applicationsApi from '../../api/applicationsApi';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, reviewing: 0, shortlisted: 0, accepted: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await applicationsApi.getMyApplications({ limit: 5 });
        const apps = data.data.applications;
        setApplications(apps);

        // Calculate stats from all applications
        const allRes = await applicationsApi.getMyApplications({ limit: 100 });
        const allApps = allRes.data.data.applications;
        setStats({
          total: allApps.length,
          reviewing: allApps.filter((a) => a.status === 'reviewing').length,
          shortlisted: allApps.filter((a) => ['shortlisted', 'assessed'].includes(a.status)).length,
          accepted: allApps.filter((a) => a.status === 'accepted').length,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <PageLayout><PageLoader /></PageLayout>;

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}</h1>
            <p className="page-subtitle">Here&apos;s where your applications stand.</p>
          </div>
          <Link to="/jobs" className="btn-primary self-start sm:self-auto">
            <MagnifyingGlassIcon aria-hidden="true" className="h-5 w-5" />
            Browse jobs
          </Link>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatsCard title="Applications" value={stats.total} icon={DocumentTextIcon} tone="neutral" />
          <StatsCard title="In review" value={stats.reviewing} icon={ClockIcon} tone="warning" />
          <StatsCard title="Shortlisted" value={stats.shortlisted} icon={StarIcon} tone="info" />
          <StatsCard title="Accepted" value={stats.accepted} icon={CheckBadgeIcon} tone="success" />
        </dl>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="card overflow-hidden lg:col-span-2 lg:self-start" aria-labelledby="recent-applications-title">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <h2 id="recent-applications-title" className="section-title">
                Recent applications
              </h2>
              {applications.length > 0 && (
                <Link to="/applications" className="link text-sm">
                  View all
                </Link>
              )}
            </div>
            {applications.length === 0 ? (
              <EmptyState
                icon={DocumentTextIcon}
                title="No applications yet"
                description="Find a role that fits your skills and apply with your projects."
                action={
                  <Link to="/jobs" className="btn-primary btn-sm">
                    Browse jobs
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {applications.map((app) => (
                  <li key={app._id}>
                    <ApplicationCard application={app} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="space-y-6">
            <QuickActions role="candidate" />
            <RecentActivity activities={notifications} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CandidateDashboard;
