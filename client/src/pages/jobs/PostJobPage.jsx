import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import TechTagInput from '../../components/jobs/TechTagInput';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import jobsApi from '../../api/jobsApi';
import toast from 'react-hot-toast';

const PostJobPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    techStack: [],
    salary: { min: '', max: '', currency: 'INR', period: 'yearly' },
    location: '',
    locationType: 'onsite',
    jobType: 'full-time',
    experienceLevel: 'mid',
    applicationDeadline: '',
    maxApplications: '',
    assessment: {
      enabled: false,
      criteria: [],
    },
  });

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const updateListItem = (field, index, value) => {
    setForm((prev) => {
      const list = [...prev[field]];
      list[index] = value;
      return { ...prev, [field]: list };
    });
  };

  const addListItem = (field) => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeListItem = (field, index) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const addCriteria = () => {
    setForm((prev) => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        criteria: [...prev.assessment.criteria, { name: '', maxScore: 10, weight: 25 }],
      },
    }));
  };

  const updateCriteria = (index, field, value) => {
    setForm((prev) => {
      const criteria = [...prev.assessment.criteria];
      criteria[index] = { ...criteria[index], [field]: value };
      return { ...prev, assessment: { ...prev.assessment, criteria } };
    });
  };

  const removeCriteria = (index) => {
    setForm((prev) => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        criteria: prev.assessment.criteria.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        requirements: form.requirements.filter((r) => r.trim()),
        responsibilities: form.responsibilities.filter((r) => r.trim()),
        salary: {
          ...form.salary,
          min: form.salary.min ? parseInt(form.salary.min) : undefined,
          max: form.salary.max ? parseInt(form.salary.max) : undefined,
        },
        maxApplications: form.maxApplications ? parseInt(form.maxApplications) : undefined,
        applicationDeadline: form.applicationDeadline || undefined,
      };

      const { data } = await jobsApi.createJob(payload);
      toast.success('Job posted successfully!');
      navigate(`/jobs/${data.data.job._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
        <h1 className="text-2xl font-bold text-surface-100 mb-2">
          Post a New <span className="gradient-text">Job</span>
        </h1>
        <p className="text-surface-400 mb-8">Fill in the details to create a job posting</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-surface-100">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Job Title *</label>
              <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} className="input" placeholder="e.g. Senior React Developer" required id="job-title" />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Description *</label>
              <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} className="input min-h-[150px] resize-y" placeholder="Describe the role, team, and expectations..." required id="job-description" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Job Type</label>
                <select value={form.jobType} onChange={(e) => updateField('jobType', e.target.value)} className="input">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Experience Level</label>
                <select value={form.experienceLevel} onChange={(e) => updateField('experienceLevel', e.target.value)} className="input">
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location & Salary */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-surface-100">Location & Compensation</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Location</label>
                <input type="text" value={form.location} onChange={(e) => updateField('location', e.target.value)} className="input" placeholder="e.g. Bangalore, India" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Location Type</label>
                <select value={form.locationType} onChange={(e) => updateField('locationType', e.target.value)} className="input">
                  <option value="onsite">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Min Salary (₹)</label>
                <input type="number" value={form.salary.min} onChange={(e) => setForm((prev) => ({ ...prev, salary: { ...prev.salary, min: e.target.value } }))} className="input" placeholder="e.g. 1000000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Max Salary (₹)</label>
                <input type="number" value={form.salary.max} onChange={(e) => setForm((prev) => ({ ...prev, salary: { ...prev.salary, max: e.target.value } }))} className="input" placeholder="e.g. 2000000" />
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-surface-100 mb-3">Tech Stack</h2>
            <TechTagInput tags={form.techStack} onChange={(tags) => updateField('techStack', tags)} />
          </div>

          {/* Requirements */}
          <div className="glass-card p-6 space-y-3">
            <h2 className="text-lg font-bold text-surface-100">Requirements</h2>
            {form.requirements.map((req, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={req} onChange={(e) => updateListItem('requirements', i, e.target.value)} className="input flex-1" placeholder={`Requirement ${i + 1}`} />
                {form.requirements.length > 1 && (
                  <button type="button" onClick={() => removeListItem('requirements', i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addListItem('requirements')} className="text-sm text-primary-400 hover:text-primary-300">+ Add requirement</button>
          </div>

          {/* Responsibilities */}
          <div className="glass-card p-6 space-y-3">
            <h2 className="text-lg font-bold text-surface-100">Responsibilities</h2>
            {form.responsibilities.map((r, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={r} onChange={(e) => updateListItem('responsibilities', i, e.target.value)} className="input flex-1" placeholder={`Responsibility ${i + 1}`} />
                {form.responsibilities.length > 1 && (
                  <button type="button" onClick={() => removeListItem('responsibilities', i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addListItem('responsibilities')} className="text-sm text-primary-400 hover:text-primary-300">+ Add responsibility</button>
          </div>

          {/* Assessment */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-surface-100">Assessment Criteria</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.assessment.enabled} onChange={(e) => setForm((prev) => ({ ...prev, assessment: { ...prev.assessment, enabled: e.target.checked } }))} className="w-4 h-4 rounded border-surface-600 text-primary-500 focus:ring-primary-500 bg-surface-800" />
                <span className="text-sm text-surface-300">Enable assessment</span>
              </label>
            </div>

            {form.assessment.enabled && (
              <div className="space-y-3 animate-slide-down">
                {form.assessment.criteria.map((c, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 bg-surface-800/30 rounded-xl">
                    <input type="text" value={c.name} onChange={(e) => updateCriteria(i, 'name', e.target.value)} className="input flex-1" placeholder="e.g. Technical Skills" />
                    <input type="number" value={c.maxScore} onChange={(e) => updateCriteria(i, 'maxScore', parseInt(e.target.value) || 10)} className="input w-20" placeholder="Max" min={1} />
                    <input type="number" value={c.weight} onChange={(e) => updateCriteria(i, 'weight', parseInt(e.target.value) || 25)} className="input w-20" placeholder="%" min={1} max={100} />
                    <button type="button" onClick={() => removeCriteria(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg mt-1"><TrashIcon className="h-4 w-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={addCriteria} className="text-sm text-primary-400 hover:text-primary-300">+ Add criteria</button>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1" id="post-job-submit">
              {submitting ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default PostJobPage;
