import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const JobFilters = ({ filters, onChange, onReset }) => {
  const jobTypes = [
    { value: '', label: 'All Types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
  ];

  const experienceLevels = [
    { value: '', label: 'All Levels' },
    { value: 'entry', label: 'Entry' },
    { value: 'mid', label: 'Mid' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' },
  ];

  const locationTypes = [
    { value: '', label: 'All Locations' },
    { value: 'remote', label: 'Remote' },
    { value: 'onsite', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  const hasActiveFilters = filters.jobType || filters.experienceLevel || filters.locationType || filters.search;

  return (
    <div className="glass-card p-4 sm:p-6 mb-6">
      {/* Search */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search jobs by title, skills, or keywords..."
          className="input pl-12"
          id="job-search-input"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <FunnelIcon className="h-4 w-4 text-surface-400 hidden sm:block" />

        <select
          value={filters.jobType || ''}
          onChange={(e) => onChange({ ...filters, jobType: e.target.value })}
          className="input py-2 max-w-[160px] text-sm"
          id="filter-job-type"
        >
          {jobTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          value={filters.experienceLevel || ''}
          onChange={(e) => onChange({ ...filters, experienceLevel: e.target.value })}
          className="input py-2 max-w-[160px] text-sm"
          id="filter-experience"
        >
          {experienceLevels.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>

        <select
          value={filters.locationType || ''}
          onChange={(e) => onChange({ ...filters, locationType: e.target.value })}
          className="input py-2 max-w-[160px] text-sm"
          id="filter-location-type"
        >
          {locationTypes.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default JobFilters;
