import { Link } from 'react-router-dom';
import { BriefcaseIcon } from '@heroicons/react/24/outline';

const Footer = () => {
  return (
    <footer className="bg-surface-900/50 border-t border-surface-700/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <BriefcaseIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">Skill Sphere</span>
            </Link>
            <p className="text-sm text-surface-400 leading-relaxed">
              Project-based, assessment-driven recruitment connecting skilled candidates with top employers.
            </p>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="text-sm font-semibold text-surface-200 uppercase tracking-wider mb-4">
              For Candidates
            </h4>
            <ul className="space-y-2">
              <li><Link to="/jobs" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Browse Jobs</Link></li>
              <li><Link to="/register" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Create Profile</Link></li>
              <li><Link to="/applications" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Track Applications</Link></li>
            </ul>
          </div>

          {/* For Recruiters */}
          <div>
            <h4 className="text-sm font-semibold text-surface-200 uppercase tracking-wider mb-4">
              For Recruiters
            </h4>
            <ul className="space-y-2">
              <li><Link to="/jobs/new" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Post a Job</Link></li>
              <li><Link to="/dashboard" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Dashboard</Link></li>
              <li><Link to="/register" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Get Started</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-surface-200 uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-surface-400">Skill-Based Matching</span></li>
              <li><span className="text-sm text-surface-400">Project Showcases</span></li>
              <li><span className="text-sm text-surface-400">Assessment Rubrics</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500">
            © {new Date().getFullYear()} Skill Sphere. Built for modern hiring.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-surface-500">Made with 💜 for skill-based recruitment</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
