import { useState, useEffect } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import ApplicationCard from '../../components/applications/ApplicationCard';
import Pagination from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import applicationsApi from '../../api/applicationsApi';
import { Link } from 'react-router-dom';

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'applied', label: 'Applied' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'assessed', label: 'Assessed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 10 };
        if (activeFilter) params.status = activeFilter;
        const { data } = await applicationsApi.getMyApplications(params);
        setApplications(data.data.applications);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [page, activeFilter]);

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
        <h1 className="text-2xl font-bold text-surface-100 mb-2">
          My <span className="gradient-text">Applications</span>
        </h1>
        <p className="text-surface-400 mb-6">Track the status of all your job applications</p>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => { setActiveFilter(f.value); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilter === f.value
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                  : 'text-surface-400 hover:bg-surface-800 border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <PageLoader />
        ) : applications.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No applications found"
            description={activeFilter ? 'No applications with this status' : 'Start applying to jobs to see your applications here'}
            action={
              <Link to="/jobs" className="btn-primary text-sm">Browse Jobs</Link>
            }
          />
        ) : (
          <>
            <div className="space-y-4">
              {applications.map((app) => (
                <ApplicationCard key={app._id} application={app} />
              ))}
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default MyApplicationsPage;
