import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PencilSquareIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';
import TechTagInput from '../../components/jobs/TechTagInput';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import { getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || '',
    skills: user?.skills || [],
    experience: user?.experience || 0,
    portfolio: user?.portfolio || { github: '', linkedin: '', website: '' },
    company: user?.company || { name: '', website: '', description: '', size: '' },
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await authApi.updateProfile(form);
      updateUser(data.data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
        {/* Header Card */}
        <div className="glass-card p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-glow flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-surface-100">{user.name}</h1>
                  <span className="inline-block mt-1 px-3 py-0.5 bg-primary-500/20 text-primary-400 text-xs font-semibold rounded-full uppercase">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => setEditing(!editing)}
                  className="btn-secondary text-sm"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {user.bio && <p className="text-surface-300 mt-3 text-sm">{user.bio}</p>}

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-surface-400">
                <span className="flex items-center gap-1">
                  <EnvelopeIcon className="h-4 w-4" />{user.email}
                </span>
                {user.phone && <span className="flex items-center gap-1"><PhoneIcon className="h-4 w-4" />{user.phone}</span>}
                {user.location && <span className="flex items-center gap-1"><MapPinIcon className="h-4 w-4" />{user.location}</span>}
              </div>
            </div>
          </div>
        </div>

        {editing ? (
          /* Edit Form */
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-bold text-surface-100">Personal Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" />
                </div>
                {user.role === 'candidate' && (
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">Experience (years)</label>
                    <input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: parseInt(e.target.value) || 0 })} className="input" min="0" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input min-h-[100px] resize-y" maxLength={500} placeholder="Tell us about yourself..." />
              </div>
            </div>

            {user.role === 'candidate' && (
              <>
                <div className="glass-card p-6">
                  <h2 className="text-lg font-bold text-surface-100 mb-3">Skills</h2>
                  <TechTagInput tags={form.skills} onChange={(skills) => setForm({ ...form, skills })} placeholder="Add a skill..." />
                </div>

                <div className="glass-card p-6 space-y-4">
                  <h2 className="text-lg font-bold text-surface-100">Portfolio Links</h2>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">GitHub</label>
                    <input type="url" value={form.portfolio.github} onChange={(e) => setForm({ ...form, portfolio: { ...form.portfolio, github: e.target.value } })} className="input" placeholder="https://github.com/..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">LinkedIn</label>
                    <input type="url" value={form.portfolio.linkedin} onChange={(e) => setForm({ ...form, portfolio: { ...form.portfolio, linkedin: e.target.value } })} className="input" placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">Website</label>
                    <input type="url" value={form.portfolio.website} onChange={(e) => setForm({ ...form, portfolio: { ...form.portfolio, website: e.target.value } })} className="input" placeholder="https://your-website.com" />
                  </div>
                </div>
              </>
            )}

            {user.role === 'recruiter' && (
              <div className="glass-card p-6 space-y-4">
                <h2 className="text-lg font-bold text-surface-100">Company Info</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">Company Name</label>
                    <input type="text" value={form.company.name} onChange={(e) => setForm({ ...form, company: { ...form.company, name: e.target.value } })} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">Website</label>
                    <input type="url" value={form.company.website} onChange={(e) => setForm({ ...form, company: { ...form.company, website: e.target.value } })} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">Company Size</label>
                    <select value={form.company.size} onChange={(e) => setForm({ ...form, company: { ...form.company, size: e.target.value } })} className="input">
                      <option value="">Select</option>
                      <option value="1-50">1-50</option>
                      <option value="51-200">51-200</option>
                      <option value="201-500">201-500</option>
                      <option value="500+">500+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
                  <textarea value={form.company.description} onChange={(e) => setForm({ ...form, company: { ...form.company, description: e.target.value } })} className="input min-h-[80px] resize-y" />
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            {user.role === 'candidate' && (
              <>
                {user.skills?.length > 0 && (
                  <div className="glass-card p-6">
                    <h2 className="text-lg font-bold text-surface-100 mb-3">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1.5 bg-primary-500/10 text-primary-400 text-sm rounded-xl border border-primary-500/20 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(user.portfolio?.github || user.portfolio?.linkedin || user.portfolio?.website) && (
                  <div className="glass-card p-6">
                    <h2 className="text-lg font-bold text-surface-100 mb-3">Portfolio</h2>
                    <div className="space-y-2">
                      {user.portfolio.github && (
                        <a href={user.portfolio.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300">
                          <CodeBracketIcon className="h-4 w-4" />GitHub
                        </a>
                      )}
                      {user.portfolio.linkedin && (
                        <a href={user.portfolio.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300">
                          <GlobeAltIcon className="h-4 w-4" />LinkedIn
                        </a>
                      )}
                      {user.portfolio.website && (
                        <a href={user.portfolio.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300">
                          <GlobeAltIcon className="h-4 w-4" />Website
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {user.projects?.length > 0 && (
                  <div className="glass-card p-6">
                    <h2 className="text-lg font-bold text-surface-100 mb-4">Projects</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.projects.map((project, i) => (
                        <div key={i} className="p-4 bg-surface-800/30 rounded-xl border border-surface-700/30">
                          <h3 className="font-semibold text-surface-200 mb-1">{project.title}</h3>
                          {project.description && <p className="text-xs text-surface-400 mb-2">{project.description}</p>}
                          {project.techStack?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {project.techStack.map((t) => (
                                <span key={t} className="px-1.5 py-0.5 bg-surface-700/50 text-surface-300 text-[10px] rounded">{t}</span>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-3 text-xs">
                            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">Live ↗</a>}
                            {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">Code ↗</a>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {user.role === 'recruiter' && user.company && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-bold text-surface-100 mb-3">Company</h2>
                <p className="text-lg font-semibold text-surface-200">{user.company.name}</p>
                {user.company.description && <p className="text-sm text-surface-400 mt-2">{user.company.description}</p>}
                {user.company.website && (
                  <a href={user.company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-400 hover:text-primary-300 mt-2 inline-block">
                    {user.company.website} ↗
                  </a>
                )}
                {user.company.size && (
                  <p className="text-xs text-surface-500 mt-2">{user.company.size} employees</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ProfilePage;
