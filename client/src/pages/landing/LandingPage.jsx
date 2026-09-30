import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  UserIcon,
  BuildingOffice2Icon,
  CodeBracketIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';
import HeroScorecard from '../../components/landing/HeroScorecard';
import ScoreMeter from '../../components/common/ScoreMeter';
import StatusBadge from '../../components/applications/StatusBadge';
import NotificationIcon from '../../components/notifications/NotificationIcon';
import { useAuth } from '../../context/AuthContext';

const candidateSteps = [
  { title: 'Build your profile', text: 'Add your skills and link the projects you are proud of.' },
  { title: 'Apply with your work', text: 'Attach up to three projects to each application, with links to the code or a live demo.' },
  { title: 'Get scored fairly', text: 'Recruiters rate every applicant for a role on the same criteria.' },
  { title: 'Follow every step', text: 'See each status change the moment it happens, from applied to decision.' },
];

const recruiterSteps = [
  { title: 'Post a role', text: 'List the stack, the requirements, and what the job involves day to day.' },
  { title: 'Define the rubric', text: 'Choose the criteria that matter and how much each one counts.' },
  { title: 'Review the work', text: 'Read cover letters and open project links side by side.' },
  { title: 'Score and decide', text: 'Shortlist, assess, and make offers from a single list of applicants.' },
];

const StepList = ({ title, icon: Icon, steps }) => (
  <div>
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    </div>
    <ol className="mt-8">
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
          {i < steps.length - 1 && (
            <span aria-hidden="true" className="absolute bottom-0 left-[15px] top-9 w-px bg-border-strong" />
          )}
          <span
            aria-hidden="true"
            className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border-strong bg-card text-sm font-semibold tabular-nums text-foreground"
          >
            {i + 1}
          </span>
          <div className="pt-1">
            <h4 className="font-semibold text-foreground">{step.title}</h4>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  </div>
);

// Small, static slices of the real UI that illustrate each feature.
const ProjectPreview = () => (
  <div className="space-y-3">
    {[
      { title: 'Relay: support chat for small teams', repo: 'github.com/sneha/relay', stack: ['Node.js', 'Redis', 'Socket.io'] },
      { title: 'Ledger: personal finance API', repo: 'github.com/sneha/ledger', stack: ['Express', 'MongoDB'] },
    ].map((project) => (
      <div key={project.title} className="rounded-lg border border-border bg-background p-3.5">
        <p className="text-sm font-semibold text-foreground">{project.title}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CodeBracketIcon className="h-4 w-4" />
          {project.repo}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <span key={tech} className="chip">
              {tech}
            </span>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const RubricPreview = () => (
  <div className="space-y-4">
    {[
      { name: 'Technical skills', score: 8 },
      { name: 'Communication', score: 6 },
      { name: 'Project quality', score: 9 },
    ].map((row) => (
      <div key={row.name}>
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="font-medium text-muted-foreground">{row.name}</span>
          <span className="font-semibold tabular-nums text-foreground">{row.score}/10</span>
        </div>
        <ScoreMeter value={row.score} max={10} />
      </div>
    ))}
  </div>
);

const SearchPreview = () => (
  <div>
    <div className="flex items-center gap-2.5 rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground">
      <MagnifyingGlassIcon className="h-5 w-5 text-subtle-foreground" />
      react typescript
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      {['Remote', 'Mid level', 'Full-time'].map((filter) => (
        <span key={filter} className="badge-info">
          {filter}
        </span>
      ))}
    </div>
    <div className="mt-4 space-y-2">
      {['Frontend engineer, design systems', 'Full-stack developer, payments'].map((title) => (
        <div key={title} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3.5 py-2.5">
          <span className="truncate text-sm font-medium text-foreground">{title}</span>
          <span className="chip flex-shrink-0">React</span>
        </div>
      ))}
    </div>
  </div>
);

const StatusPreview = () => (
  <div className="space-y-3">
    {[
      { type: 'shortlisted', title: 'You were shortlisted', company: 'TechCorp', when: '2 minutes ago', status: 'shortlisted' },
      { type: 'application_status_change', title: 'Your application is in review', company: 'StartupX', when: 'Yesterday', status: 'reviewing' },
    ].map((item) => (
      <div key={item.title} className="flex items-start gap-3 rounded-lg border border-border bg-background p-3.5">
        <NotificationIcon type={item.type} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{item.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {item.company}, {item.when}
          </p>
        </div>
        <StatusBadge status={item.status} className="hidden sm:inline-flex" />
      </div>
    ))}
  </div>
);

const features = [
  {
    title: 'Apply with projects, not just a résumé',
    text: 'Attach up to three projects to any application, each with a short description and a link to the code or a live demo.',
    Preview: ProjectPreview,
  },
  {
    title: 'Every applicant, scored the same way',
    text: 'Recruiters rate each application on shared criteria, so decisions rest on comparable scores rather than gut feel.',
    Preview: RubricPreview,
  },
  {
    title: 'Find roles by the stack you use',
    text: 'Search by skill or keyword, then filter by job type, experience level, and whether the work is remote, on-site, or hybrid.',
    Preview: SearchPreview,
  },
  {
    title: 'Know where every application stands',
    text: 'Status changes arrive as live notifications, and every application keeps a dated history from applied to decision.',
    Preview: StatusPreview,
  },
];

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // React Router doesn't scroll to #anchors on navigation, so do it here.
  useEffect(() => {
    if (!location.hash) return;
    document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }, [location.hash]);

  return (
    <PageLayout>
      {/* Hero */}
      <section className="border-b border-border" aria-labelledby="hero-title">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-24">
          <div className="lg:col-span-6 xl:col-span-5">
            <h1
              id="hero-title"
              className="text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]"
            >
              Hire for skills you can see.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Candidates apply with the projects they have built. Recruiters score every application against the same
              rubric, and both sides can see where it stands.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn-primary btn-lg">
                    Go to your dashboard
                  </Link>
                  <Link to={user?.role === 'recruiter' ? '/jobs/new' : '/jobs'} className="btn-secondary btn-lg">
                    {user?.role === 'recruiter' ? 'Post a job' : 'Browse jobs'}
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register?role=candidate" className="btn-primary btn-lg">
                    Create your profile
                  </Link>
                  <Link to="/jobs" className="btn-secondary btn-lg">
                    Browse jobs
                  </Link>
                </>
              )}
            </div>
            {!isAuthenticated && (
              <p className="mt-6 text-sm text-muted-foreground">
                Hiring?{' '}
                <Link to="/register?role=recruiter" className="link">
                  Create a recruiter account
                </Link>
              </p>
            )}
          </div>
          <div className="lg:col-span-6 xl:col-span-7 xl:pl-8">
            <HeroScorecard />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-16 border-b border-border py-20 sm:py-24" aria-labelledby="how-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 id="how-title" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Each application moves through the same stages, and both sides can see which one it has reached.
            </p>
          </div>
          <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-16">
            <StepList title="If you're looking for work" icon={UserIcon} steps={candidateSteps} />
            <StepList title="If you're hiring" icon={BuildingOffice2Icon} steps={recruiterSteps} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-16 py-20 sm:py-24" aria-labelledby="features-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 id="features-title" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built around the work, not the résumé
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Every part of Skill Sphere puts real projects and consistent scores in front of the people making the
              decision.
            </p>
          </div>
          <div className="mt-14 grid gap-x-10 gap-y-14 md:grid-cols-2">
            {features.map(({ title, text, Preview }) => (
              <div key={title}>
                <div aria-hidden="true" className="card p-5 sm:p-6">
                  <Preview />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8" aria-labelledby="cta-title">
        <div className="mx-auto max-w-7xl rounded-3xl bg-band px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-xl">
            <h2 id="cta-title" className="text-3xl font-bold tracking-tight text-band-foreground sm:text-4xl">
              {isAuthenticated ? 'Pick up where you left off.' : 'Start with the work.'}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-band-muted sm:text-lg">
              {isAuthenticated
                ? 'Your applications, postings, and notifications are waiting on your dashboard.'
                : 'Create an account to apply with your projects, or post a role and review applicants against your own rubric.'}
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-shrink-0">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-on-band btn-lg">
                Go to your dashboard
              </Link>
            ) : (
              <>
                <Link to="/register?role=candidate" className="btn-on-band btn-lg">
                  Join as a candidate
                </Link>
                <Link to="/register?role=recruiter" className="btn-outline-on-band btn-lg">
                  Join as a recruiter
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default LandingPage;
