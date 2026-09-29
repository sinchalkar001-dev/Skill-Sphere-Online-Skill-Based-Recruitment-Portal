import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate, formatSalary, getJobTypeLabel } from '../../utils/helpers';
import { BuildingOffice2Icon, MapPinIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const ApplicationCard = ({ application, showJob = true }) => {
  const job = application.job;
  const recruiterName = job?.recruiter?.company?.name || job?.recruiter?.name || '';

  return (
    <Link
      to={`/applications/${application._id}`}
      className="glass-card-hover p-5 block"
      id={`application-card-${application._id}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {showJob && (
            <h3 className="text-base font-bold text-surface-100 truncate">
              {job?.title || 'Job'}
            </h3>
          )}
          {recruiterName && (
            <div className="flex items-center gap-1.5 mt-1">
              <BuildingOffice2Icon className="h-3.5 w-3.5 text-surface-500" />
              <span className="text-sm text-surface-400">{recruiterName}</span>
            </div>
          )}
        </div>
        <StatusBadge status={application.status} />
      </div>

      {job?.techStack && job.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.techStack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 bg-surface-700/50 text-surface-300 text-xs rounded-md"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-surface-500">
        {job?.location && (
          <span className="flex items-center gap-1">
            <MapPinIcon className="h-3.5 w-3.5" />
            {job.location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <CalendarDaysIcon className="h-3.5 w-3.5" />
          Applied {formatDate(application.createdAt)}
        </span>
      </div>

      {application.assessment?.percentageScore > 0 && (
        <div className="mt-3 pt-3 border-t border-surface-700/30">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-surface-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                style={{ width: `${application.assessment.percentageScore}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-primary-400">
              {application.assessment.percentageScore}%
            </span>
          </div>
        </div>
      )}
    </Link>
  );
};

export default ApplicationCard;
