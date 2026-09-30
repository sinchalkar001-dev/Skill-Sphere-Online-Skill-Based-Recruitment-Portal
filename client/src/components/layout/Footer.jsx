import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

const columns = [
  {
    title: 'For candidates',
    links: [
      { label: 'Browse jobs', to: '/jobs' },
      { label: 'Create a profile', to: '/register?role=candidate' },
      { label: 'Track applications', to: '/applications' },
    ],
  },
  {
    title: 'For recruiters',
    links: [
      { label: 'Post a job', to: '/jobs/new' },
      { label: 'Recruiter dashboard', to: '/dashboard' },
      { label: 'Create a recruiter account', to: '/register?role=recruiter' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'How it works', to: '/#how-it-works' },
      { label: 'Features', to: '/#features' },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" aria-label="Skill Sphere home" className="inline-block rounded-lg">
              <Logo />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Project-based, assessment-driven hiring. Candidates show real work, and recruiters score it on a shared
              rubric.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="text-sm font-semibold text-foreground">{column.title}</h2>
                <ul className="mt-3 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs text-subtle-foreground">© {new Date().getFullYear()} Skill Sphere</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
