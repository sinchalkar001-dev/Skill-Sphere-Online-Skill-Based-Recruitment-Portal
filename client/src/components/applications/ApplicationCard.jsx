import { Link } from 'react-router-dom';
import { MapPinIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import StatusBadge from './StatusBadge';
import Avatar from '../common/Avatar';
import ScoreMeter from '../common/ScoreMeter';
import { formatDate } from '../../utils/helpers';

// A list row; place inside a <ul className="divide-y ..."> within a card.
const ApplicationCard = ({ application, showJob = true }) => {
  const job = application.job;
  const recruiterName = job?.recruiter?.company?.name || job?.recruiter?.name || '';
  const score = application.assessment?.percentageScore;

  return (
    <div
      id={`application-card-${application._id}`}
      className="group relative flex gap-4 px-5 py-4 transition-colors hover:bg-muted/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-ring sm:px-6"
    >
      <Avatar name={recruiterName || job?.title} square className="hidden sm:inline-flex" />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary-text sm:text-base">
              <Link to={`/applications/${application._id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                {showJob ? job?.title || 'Job' : 'View application'}
              </Link>
            </h3>
            {recruiterName && <p className="mt-0.5 truncate text-sm text-muted-foreground">{recruiterName}</p>}
          </div>
          <StatusBadge status={application.status} className="flex-shrink-0" />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {job?.location && (
            <span className="flex items-center gap-1.5">
              <MapPinIcon aria-hidden="true" className="h-4 w-4 text-subtle-foreground" />
              {job.location}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <CalendarDaysIcon aria-hidden="true" className="h-4 w-4 text-subtle-foreground" />
            Applied {formatDate(application.createdAt)}
          </span>
        </div>

        {job?.techStack?.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tech stack">
            {job.techStack.slice(0, 4).map((tech) => (
              <li key={tech} className="chip">
                {tech}
              </li>
            ))}
          </ul>
        )}

        {score > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Score</span>
            <ScoreMeter value={score} max={100} size="sm" decorative className="max-w-[10rem]" />
            <span className="text-sm font-semibold tabular-nums text-foreground">{score}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;
