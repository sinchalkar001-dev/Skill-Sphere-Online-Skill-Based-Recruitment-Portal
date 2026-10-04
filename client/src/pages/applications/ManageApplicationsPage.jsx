import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  EyeIcon,
  ClipboardDocumentCheckIcon,
  InboxIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';
import StatusBadge from '../../components/applications/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import Avatar from '../../components/common/Avatar';
import ScoreMeter from '../../components/common/ScoreMeter';
import { PageLoader, ButtonSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import applicationsApi from '../../api/applicationsApi';
import { formatDate, getStatusLabel, APPLICATION_STATUSES } from '../../utils/helpers';
import toast from 'react-hot-toast';

const statusFilters = [{ value: '', label: 'All' }, ...APPLICATION_STATUSES];

const ManageApplicationsPage = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statusCounts, setStatusCounts] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Assessment modal
  const [assessOpen, setAssessOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [scores, setScores] = useState([]);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reject confirmation; the target outlives `rejectOpen` so the text stays while the dialog closes
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const params = { page, limit: 20, sort };
        if (statusFilter) params.status = statusFilter;
        const { data } = await applicationsApi.getJobApplications(jobId, params);
        setApplications(data.data.applications);
        setJobTitle(data.data.job?.title || '');
        setPagination(data.pagination);
        setStatusCounts(data.data.statusCounts);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [jobId, statusFilter, sort, page, refreshKey]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await applicationsApi.updateStatus(appId, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      setRefreshKey((key) => key + 1); // refresh the per-status counts
      toast.success(`Status changed to ${getStatusLabel(newStatus)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const confirmReject = async () => {
    await handleStatusChange(rejectTarget._id, 'rejected');
    setRejectOpen(false);
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

  const updateScore = (index, field, value) => {
    setScores((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleAssessSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await applicationsApi.assess(selectedApp._id, {
        scores,
        overallFeedback,
      });
      setApplications((prev) =>
        prev.map((a) => (a._id === selectedApp._id ? { ...a, status: 'assessed', assessment: data.data.application.assessment } : a))
      );
      setRefreshKey((key) => key + 1);
      toast.success('Assessment submitted');
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
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="page-title">Applicants</h1>
            {jobTitle && <p className="page-subtitle truncate">{jobTitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="applicant-sort" className="text-sm text-muted-foreground">
              Sort by
            </label>
            <select
              id="applicant-sort"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="input w-auto py-2"
            >
              <option value="-createdAt">Newest first</option>
              <option value="createdAt">Oldest first</option>
              <option value="-score">Highest score</option>
            </select>
          </div>
        </div>

        <div
          role="group"
          aria-label="Filter by status"
          className="-mx-4 mt-6 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {statusFilters.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                setStatusFilter(s.value);
                setPage(1);
              }}
              aria-pressed={statusFilter === s.value}
              className={`btn btn-sm flex-shrink-0 ${
                statusFilter === s.value
                  ? 'bg-primary-soft text-primary-soft-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {s.label}
              {statusCounts && (
                <span className="tabular-nums opacity-80">{s.value ? statusCounts.byStatus[s.value] : statusCounts.total}</span>
              )}
            </button>
          ))}
        </div>

        {applications.length === 0 ? (
          <div className="card mt-4">
            <EmptyState
              icon={InboxIcon}
              titleAs="h2"
              title="No applicants here yet"
              description={
                statusFilter
                  ? 'No applications have this status. Try another filter.'
                  : 'Applications for this role will appear here as they arrive.'
              }
            />
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {applications.map((app) => {
              const score = app.assessment?.percentageScore;
              const isFinal = ['accepted', 'rejected'].includes(app.status);
              return (
                <li key={app._id} className="card p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <Avatar name={app.candidate?.name} size="lg" />
                      <div className="min-w-0">
                        <h2 className="text-base font-semibold text-foreground">
                          <Link to={`/applications/${app._id}`} className="hover:text-primary-text hover:underline">
                            {app.candidate?.name}
                          </Link>
                        </h2>
                        <p className="truncate text-sm text-muted-foreground">{app.candidate?.email}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {app.candidate?.experience != null && (
                            <span className="flex items-center gap-1.5">
                              <BriefcaseIcon aria-hidden="true" className="h-4 w-4 text-subtle-foreground" />
                              {app.candidate.experience} {app.candidate.experience === 1 ? 'year' : 'years'} experience
                            </span>
                          )}
                          {app.candidate?.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPinIcon aria-hidden="true" className="h-4 w-4 text-subtle-foreground" />
                              {app.candidate.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <CalendarDaysIcon aria-hidden="true" className="h-4 w-4 text-subtle-foreground" />
                            Applied {formatDate(app.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row-reverse items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <StatusBadge status={app.status} />
                      {score > 0 && (
                        <div className="flex w-40 items-center gap-2.5">
                          <ScoreMeter value={score} max={100} size="sm" decorative />
                          <span className="text-sm font-semibold tabular-nums text-foreground">
                            <span className="sr-only">Assessment score </span>
                            {score}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {app.candidate?.skills?.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Skills">
                      {app.candidate.skills.slice(0, 6).map((s) => (
                        <li key={s} className="chip">
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}

                  {app.coverLetter && (
                    <div className="mt-4 rounded-lg bg-muted/60 p-4">
                      <p className="text-xs font-semibold text-muted-foreground">Cover letter</p>
                      <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-foreground/90">{app.coverLetter}</p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    <Link to={`/applications/${app._id}`} className="btn-ghost btn-sm -ml-2">
                      View application
                    </Link>
                    <div className="ml-auto flex flex-wrap gap-2">
                      {app.status === 'applied' && (
                        <button type="button" onClick={() => handleStatusChange(app._id, 'reviewing')} className="btn-secondary btn-sm">
                          <EyeIcon aria-hidden="true" className="h-4 w-4" />
                          Start review
                        </button>
                      )}
                      {['applied', 'reviewing'].includes(app.status) && (
                        <button type="button" onClick={() => handleStatusChange(app._id, 'shortlisted')} className="btn-secondary btn-sm">
                          <StarIcon aria-hidden="true" className="h-4 w-4" />
                          Shortlist
                        </button>
                      )}
                      {['reviewing', 'shortlisted'].includes(app.status) && (
                        <button type="button" onClick={() => openAssessment(app)} className="btn-soft btn-sm">
                          <ClipboardDocumentCheckIcon aria-hidden="true" className="h-4 w-4" />
                          Assess
                        </button>
                      )}
                      {!isFinal && (
                        <>
                          <button type="button" onClick={() => handleStatusChange(app._id, 'accepted')} className="btn-soft-success btn-sm">
                            <CheckIcon aria-hidden="true" className="h-4 w-4" />
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectTarget(app);
                              setRejectOpen(true);
                            }}
                            className="btn-soft-danger btn-sm"
                          >
                            <XMarkIcon aria-hidden="true" className="h-4 w-4" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Assessment Modal */}
      <Modal
        isOpen={assessOpen}
        onClose={() => setAssessOpen(false)}
        title="Assess candidate"
        description={selectedApp?.candidate?.name ? `Scoring ${selectedApp.candidate.name}` : undefined}
        size="lg"
      >
        <form onSubmit={handleAssessSubmit} className="space-y-4">
          {scores.map((s, i) => (
            <fieldset key={s.criteria} className="rounded-xl border border-border bg-muted/40 p-4">
              <legend className="sr-only">{s.criteria}</legend>
              <div className="flex items-center justify-between gap-4">
                <label htmlFor={`score-${i}`} className="text-sm font-semibold text-foreground">
                  {s.criteria}
                </label>
                <span className="text-sm font-semibold tabular-nums text-foreground" aria-hidden="true">
                  {s.score}/{s.maxScore}
                </span>
              </div>
              <input
                id={`score-${i}`}
                type="range"
                min="0"
                max={s.maxScore}
                value={s.score}
                onChange={(e) => updateScore(i, 'score', parseInt(e.target.value))}
                aria-valuetext={`${s.score} out of ${s.maxScore}`}
                className="mt-3 w-full cursor-pointer accent-primary"
              />
              <ScoreMeter value={s.score} max={s.maxScore} size="sm" className="mt-2" decorative />
              <label htmlFor={`feedback-${i}`} className="sr-only">
                Feedback on {s.criteria}
              </label>
              <input
                id={`feedback-${i}`}
                type="text"
                value={s.feedback}
                onChange={(e) => updateScore(i, 'feedback', e.target.value)}
                className="input mt-3"
                placeholder="Feedback on this criterion (optional)"
              />
            </fieldset>
          ))}

          <div>
            <label htmlFor="overall-feedback" className="label">
              Overall feedback
            </label>
            <textarea
              id="overall-feedback"
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              className="input min-h-[5rem] resize-y"
              placeholder="Summary the candidate will see with their score"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setAssessOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting && <ButtonSpinner />}
              {submitting ? 'Submitting…' : 'Submit assessment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={confirmReject}
        title="Reject this application?"
        confirmLabel="Reject"
      >
        <p>
          <span className="font-semibold text-foreground">{rejectTarget?.candidate?.name}</span> will get an email and an
          in-app notification that their application was rejected.
        </p>
      </ConfirmDialog>
    </PageLayout>
  );
};

export default ManageApplicationsPage;
