import { useState, useEffect } from 'react';
import { BriefcaseIcon, DocumentCheckIcon, StarIcon, ClockIcon } from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import QuickActions from '../../components/dashboard/QuickActions';
import ApplicationCard from '../../components/applications/ApplicationCard';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-100">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-surface-400 mt-1">Here&apos;s what&apos;s happening with your applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Applications"
            value={stats.total}
            icon={<DocumentCheckIcon className="h-6 w-6 text-primary-400" />}
            color="primary"
          />
          <StatsCard
            title="Under Review"
            value={stats.reviewing}
            icon={<ClockIcon className="h-6 w-6 text-amber-400" />}
            color="amber"
          />
          <StatsCard
            title="Shortlisted"
            value={stats.shortlisted}
            icon={<StarIcon className="h-6 w-6 text-accent-400" />}
            color="accent"
          />
          <StatsCard
            title="Accepted"
            value={stats.accepted}
            icon={<BriefcaseIcon className="h-6 w-6 text-emerald-400" />}
            color="emerald"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-surface-100 mb-4">Recent Applications</h3>
              {applications.length === 0 ? (
                <div className="text-center py-8 text-surface-400">
                  <p className="mb-2">No applications yet</p>
                  <a href="/jobs" className="text-primary-400 hover:text-primary-300 text-sm">Browse jobs →</a>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <ApplicationCard key={app._id} application={app} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
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
