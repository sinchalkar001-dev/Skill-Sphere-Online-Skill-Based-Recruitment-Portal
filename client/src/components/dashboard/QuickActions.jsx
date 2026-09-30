import { Link } from 'react-router-dom';
import {
  PlusCircleIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const QuickActions = ({ role }) => {
  const candidateActions = [
    { name: 'Browse jobs', icon: MagnifyingGlassIcon, path: '/jobs' },
    { name: 'My applications', icon: DocumentTextIcon, path: '/applications' },
    { name: 'Edit profile', icon: UserCircleIcon, path: '/profile' },
  ];

  const recruiterActions = [
    { name: 'Post a new job', icon: PlusCircleIcon, path: '/jobs/new' },
    { name: 'Browse the job board', icon: MagnifyingGlassIcon, path: '/jobs' },
    { name: 'Edit company profile', icon: UserCircleIcon, path: '/profile' },
  ];

  const actions = role === 'recruiter' ? recruiterActions : candidateActions;

  return (
    <section className="card p-5" aria-labelledby="quick-actions-title">
      <h2 id="quick-actions-title" className="section-title">
        Quick actions
      </h2>
      <ul className="-mx-2 mt-3">
        {actions.map((action) => (
          <li key={action.name}>
            <Link
              to={action.path}
              className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted"
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground"
              >
                <action.icon className="h-5 w-5" />
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">{action.name}</span>
              <ChevronRightIcon
                aria-hidden="true"
                className="h-4 w-4 text-subtle-foreground transition-transform duration-150 group-hover:translate-x-0.5"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default QuickActions;
