import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';
import ApplicationCard from '../../components/applications/ApplicationCard';
import Pagination from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import applicationsApi from '../../api/applicationsApi';
import { APPLICATION_STATUSES } from '../../utils/helpers';

const statusFilters = [{ value: '', label: 'All' }, ...APPLICATION_STATUSES];

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
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <h1 className="page-title">My applications</h1>
        <p className="page-subtitle">Track every application from submission to decision.</p>

        <div
          role="group"
          aria-label="Filter by status"
          className="-mx-4 mt-6 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {statusFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setActiveFilter(f.value);
                setPage(1);
              }}
              aria-pressed={activeFilter === f.value}
              className={`btn btn-sm flex-shrink-0 ${
                activeFilter === f.value
                  ? 'bg-primary-soft text-primary-soft-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <PageLoader />
        ) : applications.length === 0 ? (
          <div className="card mt-4">
            <EmptyState
              icon={DocumentTextIcon}
              titleAs="h2"
              title={activeFilter ? 'No applications with this status' : 'No applications yet'}
              description={
                activeFilter
                  ? 'Choose another status above, or view all of your applications.'
                  : 'When you apply for a role, you can follow its progress here.'
              }
              action={
                <Link to="/jobs" className="btn-primary btn-sm">
                  Browse jobs
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <ul className="card mt-4 divide-y divide-border overflow-hidden">
              {applications.map((app) => (
                <li key={app._id}>
                  <ApplicationCard application={app} />
                </li>
              ))}
            </ul>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default MyApplicationsPage;
