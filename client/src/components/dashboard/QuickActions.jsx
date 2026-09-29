import { Link } from 'react-router-dom';
import {
  PlusCircleIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const QuickActions = ({ role }) => {
  const candidateActions = [
    { name: 'Browse Jobs', icon: MagnifyingGlassIcon, path: '/jobs', color: 'from-primary-500 to-primary-600' },
    { name: 'My Applications', icon: DocumentTextIcon, path: '/applications', color: 'from-accent-500 to-accent-600' },
    { name: 'Edit Profile', icon: UserGroupIcon, path: '/profile', color: 'from-amber-500 to-amber-600' },
  ];

  const recruiterActions = [
    { name: 'Post New Job', icon: PlusCircleIcon, path: '/jobs/new', color: 'from-primary-500 to-primary-600' },
    { name: 'My Jobs', icon: DocumentTextIcon, path: '/dashboard', color: 'from-accent-500 to-accent-600' },
    { name: 'Edit Profile', icon: UserGroupIcon, path: '/profile', color: 'from-amber-500 to-amber-600' },
  ];

  const actions = role === 'recruiter' ? recruiterActions : candidateActions;

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold text-surface-100 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            to={action.path}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/30 hover:bg-surface-700/50 transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-surface-200 group-hover:text-surface-100">
              {action.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
