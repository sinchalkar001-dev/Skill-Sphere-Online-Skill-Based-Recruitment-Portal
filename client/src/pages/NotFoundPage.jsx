import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';
import PageLayout from '../components/layout/PageLayout';

const NotFoundPage = () => {
  return (
    <PageLayout>
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:py-32">
        <p className="text-sm font-semibold text-primary-text">Error 404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">We couldn&apos;t find that page</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          The link may be broken, or the page may have moved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/" className="btn-primary">
            <HomeIcon aria-hidden="true" className="h-5 w-5" />
            Go to the homepage
          </Link>
          <Link to="/jobs" className="btn-secondary">
            Browse jobs
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFoundPage;
