import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPinIcon,
  CurrencyRupeeIcon,
  CalendarDaysIcon,
  BuildingOffice2Icon,
  ClockIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';
import Modal from '../../components/common/Modal';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import jobsApi from '../../api/jobsApi';
import applicationsApi from '../../api/applicationsApi';
import { formatDate, formatSalary, getLocationTypeLabel, getJobTypeLabel, getExperienceLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';

const JobDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [projectShowcase, setProjectShowcase] = useState([{ title: '', description: '', techStack: [], url: '' }]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await jobsApi.getJobById(id);
        setJob(data.data.job);
      } catch {
        toast.error('Job not found');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setApplying(true);
    try {
      const filtered = projectShowcase.filter((p) => p.title.trim());
      await applicationsApi.create({
        jobId: id,
        coverLetter,
        projectShowcase: filtered,
      });
      toast.success('Application submitted!');
      setApplyOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <PageLayout><PageLoader /></PageLayout>;
  if (!job) return null;

  const recruiter = job.recruiter;
  const isRecruiter = user?.role === 'recruiter';
  const isOwner = user?._id === recruiter?._id || user?.id === recruiter?._id;

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
        {/* Back */}
        <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 mb-6 transition-colors">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="glass-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-surface-100">{job.title}</h1>
                  <div className="flex items-center gap-2 mt-2 text-surface-400">
                    <BuildingOffice2Icon className="h-4 w-4" />
                    <span>{recruiter?.company?.name || recruiter?.name}</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-primary-500/10 text-primary-400 text-sm font-semibold rounded-full border border-primary-500/20">
                  {getJobTypeLabel(job.jobType)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <div className="flex items-center gap-2 text-sm text-surface-300">
                  <CurrencyRupeeIcon className="h-4 w-4 text-primary-400" />
                  {formatSalary(job.salary)}
                </div>
                <div className="flex items-center gap-2 text-sm text-surface-300">
                  <MapPinIcon className="h-4 w-4 text-primary-400" />
                  {job.location || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-sm text-surface-300">
                  <ClockIcon className="h-4 w-4 text-primary-400" />
                  {getExperienceLabel(job.experienceLevel)}
                </div>
                <div className="flex items-center gap-2 text-sm text-surface-300">
                  <UserGroupIcon className="h-4 w-4 text-primary-400" />
                  {job.applicationsCount || 0} applied
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            {job.techStack?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-bold text-surface-100 mb-3">Tech Stack</h2>
                <div className="flex flex-wrap gap-2">
                  {job.techStack.map((tech) => (
                    <span key={tech} className="px-3 py-1.5 bg-primary-500/10 text-primary-400 text-sm rounded-xl border border-primary-500/20 font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-surface-100 mb-3">Description</h2>
              <div className="text-surface-300 text-sm leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-bold text-surface-100 mb-3">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                      <CheckBadgeIcon className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-bold text-surface-100 mb-3">Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                      <span className="text-accent-400 mt-0.5">→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="glass-card p-6 sticky top-24">
              {isOwner ? (
                <div className="space-y-3">
                  <Link to={`/jobs/${job._id}/edit`} className="btn-primary w-full">
                    Edit Job
                  </Link>
                  <Link to={`/jobs/${job._id}/applications`} className="btn-secondary w-full">
                    View Applications ({job.applicationsCount || 0})
                  </Link>
                </div>
              ) : !isRecruiter ? (
                <>
                  <button
                    onClick={() => isAuthenticated ? setApplyOpen(true) : navigate('/login')}
                    className="btn-primary w-full py-3 text-base"
                    id="apply-button"
                  >
                    Apply Now
                  </button>
                  <p className="text-xs text-surface-500 text-center mt-3">
                    {job.applicationDeadline
                      ? `Deadline: ${formatDate(job.applicationDeadline)}`
                      : 'No deadline'}
                  </p>
                </>
              ) : null}

              {/* Job Meta */}
              <div className="mt-6 pt-6 border-t border-surface-700/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Location Type</span>
                  <span className="text-surface-200">{getLocationTypeLabel(job.locationType)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Posted</span>
                  <span className="text-surface-200">{formatDate(job.createdAt)}</span>
                </div>
                {job.assessment?.enabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Assessment</span>
                    <span className="text-accent-400">✓ Required</span>
                  </div>
                )}
              </div>
            </div>

            {/* Company Info */}
            {recruiter?.company && (
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-surface-100 mb-3">About the Company</h3>
                <p className="text-lg font-semibold text-surface-200 mb-1">
                  {recruiter.company.name}
                </p>
                {recruiter.company.description && (
                  <p className="text-sm text-surface-400 mb-3">{recruiter.company.description}</p>
                )}
                {recruiter.company.size && (
                  <span className="text-xs text-surface-400 bg-surface-800 px-2 py-1 rounded">
                    {recruiter.company.size} employees
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={applyOpen} onClose={() => setApplyOpen(false)} title="Apply for this Position" size="lg">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Cover Letter <span className="text-surface-500">(optional)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="input min-h-[120px] resize-y"
              placeholder="Tell the recruiter why you're a great fit..."
              maxLength={3000}
              id="apply-cover-letter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Project Showcase <span className="text-surface-500">(optional)</span>
            </label>
            {projectShowcase.map((project, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface-800/30 mb-3 space-y-3">
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => {
                    const updated = [...projectShowcase];
                    updated[i].title = e.target.value;
                    setProjectShowcase(updated);
                  }}
                  className="input"
                  placeholder="Project title"
                />
                <textarea
                  value={project.description}
                  onChange={(e) => {
                    const updated = [...projectShowcase];
                    updated[i].description = e.target.value;
                    setProjectShowcase(updated);
                  }}
                  className="input min-h-[60px] resize-y"
                  placeholder="Brief description"
                />
                <input
                  type="url"
                  value={project.url}
                  onChange={(e) => {
                    const updated = [...projectShowcase];
                    updated[i].url = e.target.value;
                    setProjectShowcase(updated);
                  }}
                  className="input"
                  placeholder="https://github.com/..."
                />
              </div>
            ))}
            {projectShowcase.length < 3 && (
              <button
                type="button"
                onClick={() => setProjectShowcase([...projectShowcase, { title: '', description: '', techStack: [], url: '' }])}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                + Add another project
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setApplyOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={handleApply} disabled={applying} className="btn-primary flex-1" id="submit-application">
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
};

export default JobDetailPage;
