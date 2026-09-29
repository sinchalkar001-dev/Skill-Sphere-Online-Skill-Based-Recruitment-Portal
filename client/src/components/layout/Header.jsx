import { useState, Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  BriefcaseIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { formatTimeAgo } from '../../utils/helpers';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif._id);
    // Navigate to the relevant page based on notification data
    if (notif.relatedApplication) {
      navigate(`/applications/${notif.relatedApplication}`);
    } else if (notif.relatedJob) {
      if (user?.role === 'recruiter') {
        navigate(`/jobs/${notif.relatedJob}/applications`);
      } else {
        navigate(`/jobs/${notif.relatedJob}`);
      }
    } else {
      navigate('/dashboard');
    }
  };

  const navLinks = isAuthenticated
    ? [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Jobs', path: '/jobs' },
        ...(user?.role === 'candidate'
          ? [{ name: 'My Applications', path: '/applications' }]
          : [{ name: 'Post Job', path: '/jobs/new' }]),
      ]
    : [
        { name: 'Jobs', path: '/jobs' },
        { name: 'About', path: '/#features' },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
              <BriefcaseIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              Skill Sphere
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-surface-300 hover:text-surface-100 hover:bg-surface-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-surface-800 transition-colors text-surface-400 hover:text-surface-200"
              aria-label="Toggle theme"
            >
              {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Menu as="div" className="relative">
                  <Menu.Button className="relative p-2 rounded-xl hover:bg-surface-800 transition-colors text-surface-400 hover:text-surface-200">
                    <BellIcon className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-80 glass-card overflow-hidden focus:outline-none">
                      <div className="px-4 py-3 border-b border-surface-700/50 flex items-center justify-between">
                        <h3 className="font-semibold text-surface-100">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-primary-400 hover:text-primary-300"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-surface-400 text-sm">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((notif) => (
                            <Menu.Item key={notif._id}>
                              {({ active }) => (
                                <button
                                  onClick={() => handleNotificationClick(notif)}
                                  className={`w-full text-left px-4 py-3 transition-colors ${
                                    active ? 'bg-surface-700/50' : ''
                                  } ${!notif.isRead ? 'bg-primary-500/5 border-l-2 border-primary-500' : ''}`}
                                >
                                  <p className="text-sm font-medium text-surface-200 truncate">
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-surface-400 mt-0.5 truncate">
                                    {notif.message}
                                  </p>
                                  <p className="text-[10px] text-surface-500 mt-1">
                                    {formatTimeAgo(notif.createdAt)}
                                  </p>
                                </button>
                              )}
                            </Menu.Item>
                          ))
                        )}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>

                {/* Profile Menu */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-surface-800 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-surface-200 max-w-[120px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDownIcon className="hidden lg:block h-4 w-4 text-surface-400" />
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-56 glass-card py-2 focus:outline-none">
                      <div className="px-4 py-2 border-b border-surface-700/50 mb-1">
                        <p className="text-sm font-medium text-surface-200">{user?.name}</p>
                        <p className="text-xs text-surface-400">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary-500/20 text-primary-400 text-[10px] font-semibold rounded-full uppercase">
                          {user?.role}
                        </span>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`flex items-center gap-3 px-4 py-2 text-sm ${
                              active ? 'bg-surface-700/50 text-surface-100' : 'text-surface-300'
                            }`}
                          >
                            <UserCircleIcon className="h-4 w-4" />
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`flex items-center gap-3 w-full px-4 py-2 text-sm ${
                              active ? 'bg-red-500/10 text-red-400' : 'text-surface-300'
                            }`}
                          >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-surface-800 transition-colors text-surface-400"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-surface-700/50 animate-slide-down">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'text-surface-300 hover:bg-surface-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-surface-300 hover:bg-surface-800"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary text-sm mx-4 mt-2"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
