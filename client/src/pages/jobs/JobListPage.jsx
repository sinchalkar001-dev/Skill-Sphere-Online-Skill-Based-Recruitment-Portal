import { useState, useEffect, useCallback } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import JobCard from '../../components/jobs/JobCard';
import JobFilters from '../../components/jobs/JobFilters';
import Pagination from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import jobsApi from '../../api/jobsApi';
import { useDebounce } from '../../hooks/useDebounce';

const JobListPage = () => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-100">
            Browse <span className="gradient-text">Opportunities</span>
          </h1>
          <p className="text-surface-400 mt-1">
            Find the perfect role that matches your skills
          </p>
        </div>

        <JobFilters filters={filters} onChange={setFilters} onReset={handleReset} />

        {loading ? (
          <PageLoader />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No jobs found"
            description="Try adjusting your filters or search terms"
            action={
              <button onClick={handleReset} className="btn-secondary text-sm">
                Clear Filters
              </button>
            }
          />
        ) : (
          <>
            <p className="text-sm text-surface-400 mb-4">
              {pagination?.total || jobs.length} jobs found
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default JobListPage;
