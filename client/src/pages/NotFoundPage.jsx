import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface-950">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative text-center px-4">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[150px] sm:text-[200px] font-black text-surface-800/50 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl animate-float">🚀</span>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-surface-100 mb-4">
          Lost in <span className="gradient-text">Space</span>
        </h2>
        <p className="text-surface-400 max-w-md mx-auto mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved to another dimension.
        </p>

        <Link to="/" className="btn-primary text-base px-8 py-3">
          <HomeIcon className="h-5 w-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
