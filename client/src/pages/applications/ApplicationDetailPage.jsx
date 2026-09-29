import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  PhoneIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';
import StatusBadge from '../../components/applications/StatusBadge';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import applicationsApi from '../../api/applicationsApi';
import { formatDate, getJobTypeLabel, getExperienceLabel, getLocationTypeLabel, formatSalary } from '../../utils/helpers';
import toast from 'react-hot-toast';

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

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
        {/* Back */}
        <Link
          to={isRecruiter ? `/jobs/${job?._id}/applications` : '/applications'}
          className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {isRecruiter ? 'Back to Applications' : 'My Applications'}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="glass-card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-surface-100">
                    {job?.title || 'Job Position'}
                  </h1>
                  <div className="flex items-center gap-2 mt-1 text-surface-400">
                    <BuildingOffice2Icon className="h-4 w-4" />
                    <span>{job?.recruiter?.company?.name || job?.recruiter?.name || 'Company'}</span>
                  </div>
                </div>
                <StatusBadge status={application.status} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {job?.location && (
                  <span className="flex items-center gap-1.5 text-surface-300">
                    <MapPinIcon className="h-4 w-4 text-primary-400" />
                    {job.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-surface-300">
                  <CalendarDaysIcon className="h-4 w-4 text-primary-400" />
                  Applied {formatDate(application.createdAt)}
                </span>
                {job?.jobType && (
                  <span className="text-surface-300">{getJobTypeLabel(job.jobType)}</span>
                )}
                {job?.locationType && (
                  <span className="text-surface-300">{getLocationTypeLabel(job.locationType)}</span>
                )}
              </div>
            </div>

            {/* Cover Letter */}
            {application.coverLetter && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-bold text-surface-100 mb-3">Cover Letter</h2>
                <p className="text-surface-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </div>
            )}

            {/* Project Showcase */}
            {application.projectShowcase?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-bold text-surface-100 mb-4">Project Showcase</h2>
                <div className="space-y-4">
                  {application.projectShowcase.map((project, i) => (
                    <div key={i} className="p-4 bg-surface-800/30 rounded-xl border border-surface-700/30">
                      <h3 className="font-semibold text-surface-200 mb-1">{project.title}</h3>
                      {project.description && (
                        <p className="text-sm text-surface-400 mb-2">{project.description}</p>
                      )}
                      {project.techStack?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {project.techStack.map((t) => (
                            <span key={t} className="px-2 py-0.5 bg-surface-700/50 text-surface-300 text-xs rounded-md">{t}</span>
                          ))}
                        </div>
                      )}
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300">
                          <LinkIcon className="h-3.5 w-3.5" />
                          View Project
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assessment Results */}
            {assessment && assessment.scores?.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-surface-100">Assessment Results</h2>
                  {assessment.percentageScore > 0 && (
                    <span className="text-2xl font-bold text-primary-400">
                      {assessment.percentageScore}%
                    </span>
                  )}
                </div>

                {/* Overall progress bar */}
                {assessment.percentageScore > 0 && (
                  <div className="mb-6">
                    <div className="w-full bg-surface-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                        style={{ width: `${assessment.percentageScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Individual scores */}
                <div className="space-y-3">
                  {assessment.scores.map((s, i) => (
                    <div key={i} className="p-3 bg-surface-800/30 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-surface-200">{s.criteria}</span>
                        <span className="text-sm font-bold text-primary-400">{s.score}/{s.maxScore}</span>
                      </div>
                      {s.feedback && (
                        <p className="text-xs text-surface-400 mt-1">{s.feedback}</p>
                      )}
                      <div className="mt-2 bg-surface-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary-500 transition-all"
                          style={{ width: `${(s.score / s.maxScore) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {assessment.overallFeedback && (
                  <div className="mt-4 pt-4 border-t border-surface-700/30">
                    <p className="text-xs font-medium text-surface-400 mb-1">Overall Feedback</p>
                    <p className="text-sm text-surface-300">{assessment.overallFeedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Candidate Info (visible to recruiters) */}
            {isRecruiter && candidate && (
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-surface-100 mb-3">Candidate Info</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                    {candidate.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-surface-200">{candidate.name}</p>
                    {candidate.experience != null && (
                      <p className="text-xs text-surface-400">{candidate.experience} years exp.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-surface-400">
                    <EnvelopeIcon className="h-4 w-4" />{candidate.email}
                  </p>
                  {candidate.phone && (
                    <p className="flex items-center gap-2 text-surface-400">
                      <PhoneIcon className="h-4 w-4" />{candidate.phone}
                    </p>
                  )}
                  {candidate.location && (
                    <p className="flex items-center gap-2 text-surface-400">
                      <MapPinIcon className="h-4 w-4" />{candidate.location}
                    </p>
                  )}
                </div>

                {candidate.skills?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-surface-400 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-primary-500/10 text-primary-400 text-xs rounded-md border border-primary-500/20">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {candidate.portfolio && (
                  <div className="mt-4 space-y-1">
                    {candidate.portfolio.github && (
                      <a href={candidate.portfolio.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300">
                        <CodeBracketIcon className="h-3.5 w-3.5" />GitHub
                      </a>
                    )}
                    {candidate.portfolio.linkedin && (
                      <a href={candidate.portfolio.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300">
                        <GlobeAltIcon className="h-3.5 w-3.5" />LinkedIn
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Job Details */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-surface-100 mb-3">Job Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-400">Salary</span>
                  <span className="text-surface-200">{formatSalary(job?.salary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Experience</span>
                  <span className="text-surface-200">{getExperienceLabel(job?.experienceLevel)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Type</span>
                  <span className="text-surface-200">{getJobTypeLabel(job?.jobType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Location</span>
                  <span className="text-surface-200">{getLocationTypeLabel(job?.locationType)}</span>
                </div>
              </div>

              {job?.techStack?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-surface-700/30">
                  <p className="text-xs font-medium text-surface-400 mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-1">
                    {job.techStack.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-surface-700/50 text-surface-300 text-xs rounded-md">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              <Link to={`/jobs/${job?._id}`} className="block mt-4 text-sm text-primary-400 hover:text-primary-300 text-center">
                View Full Job Posting →
              </Link>
            </div>

            {/* Status Timeline */}
            {application.statusHistory?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-surface-100 mb-3">Status Timeline</h3>
                <div className="space-y-3">
                  {application.statusHistory.map((entry, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        i === application.statusHistory.length - 1 ? 'bg-primary-400' : 'bg-surface-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-surface-200 capitalize">{entry.status}</p>
                        <p className="text-[10px] text-surface-500">{formatDate(entry.changedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ApplicationDetailPage;
