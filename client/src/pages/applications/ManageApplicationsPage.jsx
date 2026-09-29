import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';
import StatusBadge from '../../components/applications/StatusBadge';
import Modal from '../../components/common/Modal';
import { PageLoader } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import applicationsApi from '../../api/applicationsApi';
import { formatDate, getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ManageApplicationsPage = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Assessment modal
  const [assessOpen, setAssessOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [scores, setScores] = useState([]);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const params = { limit: 50 };
        if (statusFilter) params.status = statusFilter;
        const { data } = await applicationsApi.getJobApplications(jobId, params);
        setApplications(data.data.applications);
        setJobTitle(data.data.job?.title || '');
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [jobId, statusFilter]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await applicationsApi.updateStatus(appId, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const openAssessment = (app) => {
    setSelectedApp(app);
    setScores([
      { criteria: 'Technical Skills', score: 0, maxScore: 10, feedback: '' },
      { criteria: 'Problem Solving', score: 0, maxScore: 10, feedback: '' },
      { criteria: 'Communication', score: 0, maxScore: 10, feedback: '' },
      { criteria: 'Project Quality', score: 0, maxScore: 10, feedback: '' },
    ]);
    setOverallFeedback('');
    setAssessOpen(true);
  };

  const handleAssessSubmit = async () => {
    setSubmitting(true);
    try {
      const { data } = await applicationsApi.assess(selectedApp._id, {
        scores,
        overallFeedback,
      });
      setApplications((prev) =>
        prev.map((a) => (a._id === selectedApp._id ? { ...a, status: 'assessed', assessment: data.data.application.assessment } : a))
      );
      toast.success('Assessment submitted!');
      setAssessOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assessment failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLayout><PageLoader /></PageLayout>;

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-surface-400 hover:text-surface-200 mb-4">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-100">Applications</h1>
            <p className="text-surface-400 mt-1">for "{jobTitle}"</p>
          </div>
          <span className="text-sm text-surface-400">{applications.length} total</span>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['', 'applied', 'reviewing', 'shortlisted', 'assessed', 'accepted', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-surface-400 hover:bg-surface-800'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        {applications.length === 0 ? (
          <EmptyState icon="📭" title="No applications" description="No applications received for this job yet" />
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-4">
                  {/* Candidate Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {getInitials(app.candidate?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-surface-100">{app.candidate?.name}</h3>
                      <p className="text-sm text-surface-400">{app.candidate?.email}</p>

                      {app.candidate?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {app.candidate.skills.slice(0, 5).map((s) => (
                            <span key={s} className="px-2 py-0.5 bg-surface-700/50 text-surface-300 text-xs rounded-md">{s}</span>
                          ))}
                        </div>
                      )}

                      {app.candidate?.experience != null && (
                        <p className="text-xs text-surface-500 mt-2">{app.candidate.experience} years experience • {app.candidate.location || 'Location N/A'}</p>
                      )}

                      <p className="text-xs text-surface-500 mt-1">Applied {formatDate(app.createdAt)}</p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <StatusBadge status={app.status} />

                    {app.assessment?.percentageScore > 0 && (
                      <span className="text-sm font-bold text-primary-400">
                        {app.assessment.percentageScore}%
                      </span>
                    )}

                    <div className="flex gap-1 mt-2">
                      {app.status === 'applied' && (
                        <button onClick={() => handleStatusChange(app._id, 'reviewing')} className="px-3 py-1.5 text-xs rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors">
                          Review
                        </button>
                      )}
                      {['applied', 'reviewing'].includes(app.status) && (
                        <button onClick={() => handleStatusChange(app._id, 'shortlisted')} className="px-3 py-1.5 text-xs rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors">
                          <StarIcon className="h-3.5 w-3.5 inline mr-1" />Shortlist
                        </button>
                      )}
                      {['reviewing', 'shortlisted'].includes(app.status) && (
                        <button onClick={() => openAssessment(app)} className="px-3 py-1.5 text-xs rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                          Assess
                        </button>
                      )}
                      {!['accepted', 'rejected'].includes(app.status) && (
                        <>
                          <button onClick={() => handleStatusChange(app._id, 'accepted')} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Accept">
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleStatusChange(app._id, 'rejected')} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Reject">
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                {app.coverLetter && (
                  <div className="mt-4 pt-4 border-t border-surface-700/30">
                    <p className="text-xs font-medium text-surface-400 mb-1">Cover Letter</p>
                    <p className="text-sm text-surface-300 line-clamp-3">{app.coverLetter}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assessment Modal */}
      <Modal isOpen={assessOpen} onClose={() => setAssessOpen(false)} title="Assess Candidate" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-surface-400 mb-4">
            Scoring <span className="text-surface-200 font-medium">{selectedApp?.candidate?.name}</span>
          </p>

          {scores.map((s, i) => (
            <div key={i} className="p-4 bg-surface-800/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-surface-200">{s.criteria}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max={s.maxScore}
                    value={s.score}
                    onChange={(e) => {
                      const updated = [...scores];
                      updated[i].score = parseInt(e.target.value);
                      setScores(updated);
                    }}
                    className="w-24 accent-primary-500"
                  />
                  <span className="text-sm font-bold text-primary-400 w-12 text-right">
                    {s.score}/{s.maxScore}
                  </span>
                </div>
              </div>
              <input
                type="text"
                value={s.feedback}
                onChange={(e) => {
                  const updated = [...scores];
                  updated[i].feedback = e.target.value;
                  setScores(updated);
                }}
                className="input text-sm"
                placeholder="Feedback for this criteria..."
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Overall Feedback</label>
            <textarea
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              className="input min-h-[80px] resize-y"
              placeholder="Overall assessment notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setAssessOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleAssessSubmit} disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
};

export default ManageApplicationsPage;
