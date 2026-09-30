import { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatTimeAgo } from '../../utils/helpers';
import Logo from '../common/Logo';
import Avatar from '../common/Avatar';
import ThemeToggle from '../common/ThemeToggle';
import NotificationIcon from '../notifications/NotificationIcon';

const menuTransition = {
  as: Fragment,
  enter: 'transition ease-out duration-150',
  enterFrom: 'opacity-0 -translate-y-1',
  enterTo: 'opacity-100 translate-y-0',
  leave: 'transition ease-in duration-100',
  leaveFrom: 'opacity-100',
  leaveTo: 'opacity-0',
};

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

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
          ? [{ name: 'My applications', path: '/applications' }]
          : [{ name: 'Post a job', path: '/jobs/new' }]),
      ]
    : [
        { name: 'Jobs', path: '/jobs' },
        { name: 'How it works', path: '/#how-it-works' },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Skill Sphere home" className="flex-shrink-0 rounded-lg">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden h-full items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              aria-current={isActive(link.path) ? 'page' : undefined}
              className={`inline-flex h-full items-center border-b-2 px-3 text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Menu as="div" className="relative">
                <Menu.Button
                  className="btn-ghost btn-icon relative"
                  aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                >
                  <BellIcon className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute right-1 top-1 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold leading-none text-danger-foreground ring-2 ring-card"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Menu.Button>

                <Transition {...menuTransition}>
                  <Menu.Items className="menu-panel fixed inset-x-4 top-[4.25rem] z-50 overflow-hidden sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96">
                    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                      <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
                      {unreadCount > 0 && (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={markAllAsRead}
                              className={`rounded text-xs font-semibold text-primary-text ${active ? 'underline' : ''}`}
                            >
                              Mark all as read
                            </button>
                          )}
                        </Menu.Item>
                      )}
                    </div>
                    <div className="max-h-[22rem] overflow-y-auto py-1">
                      {notifications.length === 0 ? (
                        <div className="px-6 py-10 text-center">
                          <p className="text-sm font-medium text-foreground">You&apos;re all caught up</p>
                          <p className="mt-1 text-xs text-muted-foreground">New updates will show up here.</p>
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((notif) => (
                          <Menu.Item key={notif._id}>
                            {({ active }) => (
                              <button
                                type="button"
                                onClick={() => handleNotificationClick(notif)}
                                className={`flex w-full gap-3 px-4 py-3 text-left transition-colors ${active ? 'bg-muted' : ''}`}
                              >
                                <NotificationIcon type={notif.type} />
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-start gap-2">
                                    <span
                                      className={`min-w-0 flex-1 truncate text-sm text-foreground ${
                                        notif.isRead ? 'font-medium' : 'font-semibold'
                                      }`}
                                    >
                                      {notif.title}
                                    </span>
                                    {!notif.isRead && (
                                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary">
                                        <span className="sr-only">Unread</span>
                                      </span>
                                    )}
                                  </span>
                                  <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                                    {notif.message}
                                  </span>
                                  <span className="mt-1 block text-xs text-subtle-foreground">
                                    {formatTimeAgo(notif.createdAt)}
                                  </span>
                                </span>
                              </button>
                            )}
                          </Menu.Item>
                        ))
                      )}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Account */}
              <Menu as="div" className="relative">
                <Menu.Button
                  className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:pr-2"
                  aria-label={`Account menu for ${user?.name || 'your account'}`}
                >
                  <Avatar name={user?.name} size="sm" />
                  <span className="hidden max-w-[9rem] truncate text-sm font-medium text-foreground lg:block">
                    {user?.name}
                  </span>
                  <ChevronDownIcon aria-hidden="true" className="hidden h-4 w-4 text-muted-foreground lg:block" />
                </Menu.Button>

                <Transition {...menuTransition}>
                  <Menu.Items className="menu-panel absolute right-0 z-50 mt-2 w-64 py-1.5">
                    <div className="border-b border-border px-4 pb-3 pt-2">
                      <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                      <span className="badge-info mt-2 capitalize">{user?.role}</span>
                    </div>
                    <div className="py-1">
                      {[
                        { to: '/dashboard', label: 'Dashboard', Icon: Squares2X2Icon },
                        { to: '/profile', label: 'Profile', Icon: UserCircleIcon },
                      ].map(({ to, label, Icon }) => (
                        <Menu.Item key={to}>
                          {({ active }) => (
                            <Link
                              to={to}
                              className={`flex items-center gap-3 px-4 py-2 text-sm text-foreground ${active ? 'bg-muted' : ''}`}
                            >
                              <Icon aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                              {label}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                    <div className="border-t border-border pt-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={handleLogout}
                            className={`flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground ${active ? 'bg-muted' : ''}`}
                          >
                            <ArrowRightOnRectangleIcon aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
                            Log out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="btn-ghost btn-sm">
                Log in
              </Link>
              <Link to="/register" className="btn-primary btn-sm">
                Create account
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="btn-ghost btn-icon md:hidden"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-menu" className="border-t border-border bg-card md:hidden">
          <nav aria-label="Main" className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                aria-current={isActive(link.path) ? 'page' : undefined}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-primary-soft text-primary-soft-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
                <Link to="/login" className="btn-secondary">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary">
                  Create account
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
