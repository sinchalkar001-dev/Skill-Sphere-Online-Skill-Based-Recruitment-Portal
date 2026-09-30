import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  ClockIcon,
  BriefcaseIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import Avatar from '../common/Avatar';
import { getWorkStyleIcon } from './jobMeta';
import {
  formatSalary,
  formatTimeAgo,
  getLocationTypeLabel,
  getJobTypeLabel,
  getExperienceLabel,
} from '../../utils/helpers';

const MetaItem = ({ icon: Icon, children }) => (
  <li className="flex items-center gap-1.5">
    <Icon aria-hidden="true" className="h-4 w-4 flex-shrink-0 text-subtle-foreground" />
    {children}
  </li>
);

const JobCard = ({ job }) => {
  const recruiterName = job.recruiter?.company?.name || job.recruiter?.name || 'Company';
  const techStack = job.techStack || [];
  const applicants = job.applicationsCount || 0;

  return (
    <article
      id={`job-card-${job._id}`}
      className="group card relative flex gap-4 p-5 transition-colors hover:border-primary/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring sm:p-6"
    >
      <Avatar name={recruiterName} square size="lg" className="hidden sm:inline-flex" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary-text sm:text-lg">
              <Link to={`/jobs/${job._id}`} className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none">
                {job.title}
              </Link>
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{recruiterName}</p>
          </div>
          <p className="text-sm font-semibold text-foreground sm:whitespace-nowrap sm:pt-1 sm:text-right">
            {formatSalary(job.salary)}
          </p>
        </div>

        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <MetaItem icon={MapPinIcon}>{job.location || 'Location not listed'}</MetaItem>
          <MetaItem icon={getWorkStyleIcon(job.locationType)}>{getLocationTypeLabel(job.locationType)}</MetaItem>
          <MetaItem icon={BriefcaseIcon}>{getJobTypeLabel(job.jobType)}</MetaItem>
          <MetaItem icon={ChartBarIcon}>{getExperienceLabel(job.experienceLevel)}</MetaItem>
        </ul>

        {techStack.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tech stack">
            {techStack.slice(0, 6).map((tech) => (
              <li key={tech} className="chip">
                {tech}
              </li>
            ))}
            {techStack.length > 6 && (
              <li className="px-1 py-0.5 text-xs font-medium text-muted-foreground">+{techStack.length - 6} more</li>
            )}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ClockIcon aria-hidden="true" className="h-4 w-4 text-subtle-foreground" />
            Posted {formatTimeAgo(job.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <UserGroupIcon aria-hidden="true" className="h-4 w-4 text-subtle-foreground" />
            {applicants} {applicants === 1 ? 'applicant' : 'applicants'}
          </span>
          {job.assessment?.enabled && (
            <span className="badge-iris sm:ml-auto">
              <ClipboardDocumentCheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Rubric assessment
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default JobCard;
