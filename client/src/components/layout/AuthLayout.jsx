import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';

// Minimal frame for the log-in and sign-up screens.
const AuthLayout = ({ title, subtitle, children }) => (
  <div className="flex min-h-screen flex-col bg-background">
    <a href="#main-content" className="skip-link">
      Skip to content
    </a>
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <Link to="/" aria-label="Skill Sphere home" className="rounded-lg">
        <Logo />
      </Link>
      <ThemeToggle />
    </header>
    <main id="main-content" tabIndex={-1} className="flex flex-1 justify-center px-4 pb-16 pt-6 focus:outline-none sm:pt-10">
      <div className="w-full max-w-md">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </main>
  </div>
);

export default AuthLayout;
