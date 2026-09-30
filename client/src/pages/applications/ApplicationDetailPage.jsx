import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  MapPinIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  PhoneIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  ArrowTopRightOnSquareIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';
import StatusBadge from '../../components/applications/StatusBadge';
import StatusPipeline from '../../components/applications/StatusPipeline';
import Avatar from '../../components/common/Avatar';
import ScoreMeter from '../../components/common/ScoreMeter';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import applicationsApi from '../../api/applicationsApi';
import {
  formatDate,
  getJobTypeLabel,
  getExperienceLabel,
  getLocationTypeLabel,
  formatSalary,
  getStatusLabel,
} from '../../utils/helpers';
import toast from 'react-hot-toast';

const ExternalLink = ({ href, icon: Icon, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-text underline-offset-4 hover:underline"
  >
    <Icon aria-hidden="true" className="h-4 w-4" />
    {children}
    <span className="sr-only">(opens in a new tab)</span>
  </a>
);

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const { data } = await applicationsApi.getById(id);
        setApplication(data.data.application);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Application not found');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id, navigate]);

  if (loading) return <PageLayout><PageLoader /></PageLayout>;
  if (!application) return null;

  const job = application.job;
  const candidate = application.candidate;
  const assessment = application.assessment;
  const isRecruiter = user?.role === 'recruiter';
  const companyName = job?.recruiter?.company?.name || job?.recruiter?.name || 'Company';

  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Link
          to={isRecruiter ? `/jobs/${job?._id}/applications` : '/applications'}
          className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
          {isRecruiter ? 'All applicants' : 'My applications'}
        </Link>

        <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar name={companyName} square size="xl" className="hidden sm:inline-flex" />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{job?.title || 'Job position'}</h1>
              <p className="mt-1 text-base text-muted-foreground">{companyName}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
            </div>
          </div>
          <StatusBadge status={application.status} className="self-start" />
        </header>

        <section className="card mt-8 p-5 sm:p-6" aria-labelledby="progress-title">
          <h2 id="progress-title" className="sr-only">
            Progress
          </h2>
          <StatusPipeline status={application.status} history={application.statusHistory} />
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-6 lg:col-span-2">
            {assessment && assessment.scores?.length > 0 && (
              <section className="card p-6 sm:p-8" aria-labelledby="assessment-title">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id="assessment-title" className="section-title">
                      Assessment
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">Scored against the rubric for this role.</p>
                  </div>
                  {assessment.percentageScore > 0 && (
                    <div className="text-right">
                      <p className="text-4xl font-bold tracking-tight text-foreground">{assessment.percentageScore}%</p>
                      <p className="text-xs text-muted-foreground">Overall score</p>
                    </div>
                  )}
                </div>

                <ul className="mt-6 space-y-5">
                  {assessment.scores.map((s, i) => (
                    <li key={i}>
                      <div className="mb-2 flex items-baseline justify-between gap-4">
                        <span className="text-sm font-medium text-foreground">{s.criteria}</span>
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          {s.score}/{s.maxScore}
                        </span>
                      </div>
                      <ScoreMeter value={s.score} max={s.maxScore} decorative />
                      {s.feedback && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.feedback}</p>}
                    </li>
                  ))}
                </ul>

                {assessment.overallFeedback && (
                  <div className="mt-6 rounded-lg bg-muted/60 p-4">
                    <p className="text-xs font-semibold text-muted-foreground">Overall feedback</p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground">{assessment.overallFeedback}</p>
                  </div>
                )}
              </section>
            )}

            {application.coverLetter && (
              <section className="card p-6 sm:p-8" aria-labelledby="cover-letter-title">
                <h2 id="cover-letter-title" className="section-title">
                  Cover letter
                </h2>
                <p className="mt-3 max-w-prose whitespace-pre-wrap text-[0.9375rem] leading-7 text-foreground/90">
                  {application.coverLetter}
                </p>
              </section>
            )}

            {application.projectShowcase?.length > 0 && (
              <section className="card p-6 sm:p-8" aria-labelledby="projects-title">
                <h2 id="projects-title" className="section-title">
                  Projects
                </h2>
                <ul className="mt-4 space-y-3">
                  {application.projectShowcase.map((project, i) => (
                    <li key={i} className="rounded-xl border border-border p-4">
                      <h3 className="font-semibold text-foreground">{project.title}</h3>
                      {project.description && (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
                      )}
                      {project.techStack?.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tech stack">
                          {project.techStack.map((t) => (
                            <li key={t} className="chip">
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}
                      {project.url && (
                        <div className="mt-3">
                          <ExternalLink href={project.url} icon={ArrowTopRightOnSquareIcon}>
                            View project
                          </ExternalLink>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!application.coverLetter && !application.projectShowcase?.length && !(assessment?.scores?.length > 0) && (
              <div className="card p-6 text-sm text-muted-foreground sm:p-8">
                This application was submitted without a cover letter or projects.
              </div>
            )}
          </div>

          <aside className="space-y-6">
            {isRecruiter && candidate && (
              <section className="card p-6" aria-labelledby="candidate-title">
                <h2 id="candidate-title" className="section-title">
                  Candidate
                </h2>
                <div className="mt-4 flex items-center gap-3">
                  <Avatar name={candidate.name} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{candidate.name}</p>
                    {candidate.experience != null && (
                      <p className="text-sm text-muted-foreground">
                        {candidate.experience} {candidate.experience === 1 ? 'year' : 'years'} of experience
                      </p>
                    )}
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2 break-all">
                    <EnvelopeIcon aria-hidden="true" className="h-4 w-4 flex-shrink-0 text-subtle-foreground" />
                    <a href={`mailto:${candidate.email}`} className="hover:text-foreground hover:underline">
                      {candidate.email}
                    </a>
                  </li>
                  {candidate.phone && (
                    <li className="flex items-center gap-2">
                      <PhoneIcon aria-hidden="true" className="h-4 w-4 flex-shrink-0 text-subtle-foreground" />
                      {candidate.phone}
                    </li>
                  )}
                  {candidate.location && (
                    <li className="flex items-center gap-2">
                      <MapPinIcon aria-hidden="true" className="h-4 w-4 flex-shrink-0 text-subtle-foreground" />
                      {candidate.location}
                    </li>
                  )}
                </ul>

                {candidate.skills?.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-muted-foreground">Skills</p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {candidate.skills.map((s) => (
                        <li key={s} className="chip">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(candidate.portfolio?.github || candidate.portfolio?.linkedin) && (
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                    {candidate.portfolio.github && (
                      <ExternalLink href={candidate.portfolio.github} icon={CodeBracketIcon}>
                        GitHub
                      </ExternalLink>
                    )}
                    {candidate.portfolio.linkedin && (
                      <ExternalLink href={candidate.portfolio.linkedin} icon={GlobeAltIcon}>
                        LinkedIn
                      </ExternalLink>
                    )}
                  </div>
                )}
              </section>
            )}

            <section className="card p-6" aria-labelledby="job-details-title">
              <h2 id="job-details-title" className="section-title">
                Job details
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ['Salary', formatSalary(job?.salary)],
                  ['Experience', getExperienceLabel(job?.experienceLevel)],
                  ['Job type', getJobTypeLabel(job?.jobType)],
                  ['Work style', getLocationTypeLabel(job?.locationType)],
                ].map(([term, value]) => (
                  <div key={term} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{term}</dt>
                    <dd className="text-right font-medium text-foreground">{value || 'Not listed'}</dd>
                  </div>
                ))}
              </dl>

              {job?.techStack?.length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-xs font-semibold text-muted-foreground">Tech stack</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {job.techStack.map((t) => (
                      <li key={t} className="chip">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link to={`/jobs/${job?._id}`} className="btn-secondary btn-sm mt-5 w-full">
                <BriefcaseIcon aria-hidden="true" className="h-4 w-4" />
                View job posting
              </Link>
            </section>

            {application.statusHistory?.length > 0 && (
              <section className="card p-6" aria-labelledby="history-title">
                <h2 id="history-title" className="section-title">
                  History
                </h2>
                <ol className="mt-4">
                  {application.statusHistory.map((entry, i) => {
                    const isLatest = i === application.statusHistory.length - 1;
                    return (
                      <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                        {!isLatest && (
                          <span aria-hidden="true" className="absolute bottom-0 left-[5px] top-4 w-px bg-border-strong" />
                        )}
                        <span
                          aria-hidden="true"
                          className={`relative mt-1.5 h-[11px] w-[11px] flex-shrink-0 rounded-full border-2 ${
                            isLatest ? 'border-primary bg-primary' : 'border-border-strong bg-card'
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">{getStatusLabel(entry.status)}</p>
                          <p className="text-xs text-muted-foreground">
                            <time dateTime={entry.changedAt}>{formatDate(entry.changedAt)}</time>
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}
          </aside>
        </div>
      </div>
    </PageLayout>
  );
};

export default ApplicationDetailPage;
