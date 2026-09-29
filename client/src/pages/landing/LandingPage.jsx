import { Link } from 'react-router-dom';
import {
  RocketLaunchIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CodeBracketIcon,
  BriefcaseIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '../../components/layout/PageLayout';

const features = [
  {
    icon: CodeBracketIcon,
    title: 'Project-Based Hiring',
    description: 'Showcase real projects and code — not just resumes. Let your work speak for itself.',
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: ChartBarIcon,
    title: 'Assessment Scoring',
    description: 'Structured scoring rubrics help recruiters evaluate candidates consistently and fairly.',
    color: 'from-accent-500 to-accent-600',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Skill Verification',
    description: 'Tag your tech stack and match with jobs that need your exact skillset.',
    color: 'from-amber-500 to-amber-600',
  },
  {
    icon: RocketLaunchIcon,
    title: 'Real-Time Updates',
    description: 'Instant notifications when your application status changes. No more guessing.',
    color: 'from-rose-500 to-rose-600',
  },
];

const stats = [
  { value: '500+', label: 'Active Jobs' },
  { value: '2,000+', label: 'Candidates' },
  { value: '150+', label: 'Companies' },
  { value: '95%', label: 'Match Rate' },
];

const LandingPage = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-surface-950 to-surface-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-primary-500/20 via-accent-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-sm text-primary-400 mb-8 animate-fade-in">
              <SparklesIcon className="h-4 w-4" />
              <span>Project-based, assessment-driven recruitment</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight animate-slide-up">
              Hire by{' '}
              <span className="gradient-text">Skills</span>
              <br />
              Not Just Resumes
            </h1>

            <p className="text-lg sm:text-xl text-surface-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Skill Sphere connects talented developers with top companies through
              project showcases, skill matching, and structured assessments.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/register" className="btn-primary text-base px-8 py-3.5 shadow-glow-lg">
                Get Started Free
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link to="/jobs" className="btn-secondary text-base px-8 py-3.5">
                <BriefcaseIcon className="h-5 w-5" />
                Browse Jobs
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-4 glass-card">
                <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-xs sm:text-sm text-surface-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950 via-surface-900/50 to-surface-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-100 mb-4">
              Why <span className="gradient-text">Skill Sphere</span>?
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto">
              We reimagine hiring by focusing on what truly matters — demonstrated skills and real project work.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card-hover p-6 text-center group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:shadow-glow transition-all group-hover:scale-110`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-surface-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-100 mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* For Candidates */}
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <UserGroupIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-surface-100">For Candidates</h3>
              </div>
              <ol className="space-y-4">
                {[
                  'Create your profile with skills & projects',
                  'Browse and apply to matching jobs',
                  'Showcase your work with project links',
                  'Get assessed and receive offers',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-surface-300">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* For Recruiters */}
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                  <BriefcaseIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-surface-100">For Recruiters</h3>
              </div>
              <ol className="space-y-4">
                {[
                  'Post jobs with tech stack requirements',
                  'Define assessment criteria & rubrics',
                  'Review applications and score candidates',
                  'Shortlist, assess, and hire the best fit',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-500/20 text-accent-400 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-surface-300">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/50 via-surface-950 to-accent-900/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-100 mb-4">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-surface-300 mb-8 max-w-xl mx-auto">
            Join hundreds of companies and thousands of developers already using Skill Sphere.
          </p>
          <Link to="/register" className="btn-primary text-lg px-10 py-4 shadow-glow-lg">
            Start Free Today
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </PageLayout>
  );
};

export default LandingPage;
