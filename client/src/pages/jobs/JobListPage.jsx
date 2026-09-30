import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';
import JobCard from '../../components/jobs/JobCard';
import JobFilters, { hasActiveJobFilters } from '../../components/jobs/JobFilters';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import jobsApi from '../../api/jobsApi';
import { useDebounce } from '../../hooks/useDebounce';

const JobListSkeleton = () => (
  <ul aria-hidden="true" className="mt-6 space-y-3">
    {[0, 1, 2].map((i) => (
      <li key={i} className="card flex gap-4 p-5 sm:p-6">
        <div className="skeleton hidden h-12 w-12 rounded-lg sm:block" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-5 w-1/2" />
          <div className="skeleton h-4 w-1/4" />
          <div className="skeleton h-4 w-3/4" />
          <div className="flex gap-2">
            <div className="skeleton h-5 w-16" />
            <div className="skeleton h-5 w-20" />
            <div className="skeleton h-5 w-14" />
          </div>
        </div>
      </li>
    ))}
  </ul>
);

const JobListPage = () => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    jobType: '',
    experienceLevel: '',
    locationType: '',
  });
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.jobType) params.jobType = filters.jobType;
      if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
      if (filters.locationType) params.locationType = filters.locationType;

      const { data } = await jobsApi.getJobs(params);
      setJobs(data.data.jobs);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, [page, debouncedSearch, filters.jobType, filters.experienceLevel, filters.locationType]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.jobType, filters.experienceLevel, filters.locationType]);

  const handleReset = () => {
    setFilters({ search: '', jobType: '', experienceLevel: '', locationType: '' });
    setPage(1);
  };

  const total = pagination?.total ?? jobs.length;

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <h1 className="page-title">Browse jobs</h1>
        <p className="page-subtitle">Search by skill or keyword, then narrow down by job type, experience, and work style.</p>

        <div className="mt-6">
          <JobFilters filters={filters} onChange={setFilters} onReset={handleReset} />
        </div>

        {!hasLoaded || (loading && jobs.length === 0) ? (
          <JobListSkeleton />
        ) : jobs.length === 0 ? (
          <div className="card mt-6">
            <EmptyState
              icon={MagnifyingGlassIcon}
              titleAs="h2"
              title="No jobs match your search"
              description="Try a different keyword, or clear some filters to see more roles."
              action={
                hasActiveJobFilters(filters) && (
                  <button type="button" onClick={handleReset} className="btn-secondary btn-sm">
                    Clear filters
                  </button>
                )
              }
            />
          </div>
        ) : (
          <>
            <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
              {total} {total === 1 ? 'job' : 'jobs'} found
            </p>
            <ul
              aria-busy={loading}
              className={`mt-3 space-y-3 transition-opacity duration-150 ${loading ? 'opacity-60' : ''}`}
            >
              {jobs.map((job) => (
                <li key={job._id}>
                  <JobCard job={job} />
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

export default JobListPage;
