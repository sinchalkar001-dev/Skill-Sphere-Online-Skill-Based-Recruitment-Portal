import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const jobTypes = [
  { value: '', label: 'Any job type' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

const experienceLevels = [
  { value: '', label: 'Any experience' },
  { value: 'entry', label: 'Entry level' },
  { value: 'mid', label: 'Mid level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
];

const locationTypes = [
  { value: '', label: 'Any work style' },
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];

export const hasActiveJobFilters = (filters) =>
  Boolean(filters.jobType || filters.experienceLevel || filters.locationType || filters.search);

const FilterSelect = ({ id, label, value, options, onChange }) => (
  <div>
    <label htmlFor={id} className="sr-only">
      {label}
    </label>
    <select id={id} value={value || ''} onChange={(e) => onChange(e.target.value)} className="input lg:w-44">
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

const JobFilters = ({ filters, onChange, onReset }) => {
  const hasActiveFilters = hasActiveJobFilters(filters);

  return (
    <div role="search" className="card p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <label htmlFor="job-search-input" className="sr-only">
            Search jobs
          </label>
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle-foreground"
          />
          <input
            type="search"
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search by title, skill, or keyword"
            className="input pl-11"
            id="job-search-input"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex">
          <FilterSelect
            id="filter-job-type"
            label="Job type"
            value={filters.jobType}
            options={jobTypes}
            onChange={(jobType) => onChange({ ...filters, jobType })}
          />
          <FilterSelect
            id="filter-experience"
            label="Experience level"
            value={filters.experienceLevel}
            options={experienceLevels}
            onChange={(experienceLevel) => onChange({ ...filters, experienceLevel })}
          />
          <FilterSelect
            id="filter-location-type"
            label="Work style"
            value={filters.locationType}
            options={locationTypes}
            onChange={(locationType) => onChange({ ...filters, locationType })}
          />
        </div>

        {hasActiveFilters && (
          <button type="button" onClick={onReset} className="btn-ghost btn-sm self-start lg:self-auto">
            <XMarkIcon aria-hidden="true" className="h-4 w-4" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default JobFilters;
