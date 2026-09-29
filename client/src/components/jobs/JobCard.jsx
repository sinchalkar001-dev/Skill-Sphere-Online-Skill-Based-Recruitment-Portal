import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import { formatSalary, formatTimeAgo, getLocationTypeLabel, getJobTypeLabel, getExperienceLabel } from '../../utils/helpers';

const JobCard = ({ job }) => {
  const recruiterName = job.recruiter?.company?.name || job.recruiter?.name || 'Company';

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="glass-card-hover p-6 block group"
      id={`job-card-${job._id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-surface-100 group-hover:text-primary-400 transition-colors truncate">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <BuildingOffice2Icon className="h-4 w-4 text-surface-400 flex-shrink-0" />
            <span className="text-sm text-surface-400 truncate">{recruiterName}</span>
          </div>
        </div>
        <span className="flex-shrink-0 px-3 py-1 bg-primary-500/10 text-primary-400 text-xs font-semibold rounded-full border border-primary-500/20">
          {getJobTypeLabel(job.jobType)}
        </span>
      </div>

      {/* Tech Stack */}
      {job.techStack && job.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.techStack.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-0.5 bg-surface-700/50 text-surface-300 text-xs rounded-lg border border-surface-600/30"
            >
              {tech}
            </span>
          ))}
          {job.techStack.length > 5 && (
            <span className="px-2.5 py-0.5 text-surface-500 text-xs">
              +{job.techStack.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-1.5 text-surface-400">
          <CurrencyRupeeIcon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{formatSalary(job.salary)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-surface-400">
          <MapPinIcon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{job.location || 'Not specified'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-surface-400">
          <span className="text-xs">{getLocationTypeLabel(job.locationType)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-surface-400">
          <ClockIcon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{formatTimeAgo(job.createdAt)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-surface-700/30 flex items-center justify-between">
        <span className="text-xs text-surface-500">
          {getExperienceLabel(job.experienceLevel)}
        </span>
        {job.assessment?.enabled && (
          <span className="text-[10px] text-accent-400 bg-accent-500/10 px-2 py-0.5 rounded-full border border-accent-500/20">
            ✓ Assessment
          </span>
        )}
        <span className="text-xs text-surface-500">
          {job.applicationsCount || 0} applied
        </span>
      </div>
    </Link>
  );
};

export default JobCard;
