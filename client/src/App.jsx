import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { PageLoader } from './components/common/LoadingSpinner';

// Pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CandidateDashboard from './pages/dashboard/CandidateDashboard';
import RecruiterDashboard from './pages/dashboard/RecruiterDashboard';
import JobListPage from './pages/jobs/JobListPage';
import JobDetailPage from './pages/jobs/JobDetailPage';
import PostJobPage from './pages/jobs/PostJobPage';
import MyApplicationsPage from './pages/applications/MyApplicationsPage';
import ManageApplicationsPage from './pages/applications/ManageApplicationsPage';
import ApplicationDetailPage from './pages/applications/ApplicationDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Start each new page at the top; in-page anchors (/#section) handle their own scrolling
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

// Protected Route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// Guest Route wrapper (redirect if already logged in)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

// Dashboard router based on role
const DashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'recruiter') return <RecruiterDashboard />;
  return <CandidateDashboard />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/jobs" element={<JobListPage />} />
      <Route path="/jobs/:id" element={<JobDetailPage />} />

      {/* Guest only */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* Protected — any authenticated user */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Candidate only */}
      <Route path="/applications" element={<ProtectedRoute roles={['candidate']}><MyApplicationsPage /></ProtectedRoute>} />
      <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetailPage /></ProtectedRoute>} />

      {/* Recruiter only */}
      {/* Same form for both; the keys stop React reusing one route's form state in the other */}
      <Route path="/jobs/new" element={<ProtectedRoute roles={['recruiter']}><PostJobPage key="new" /></ProtectedRoute>} />
      <Route path="/jobs/:id/edit" element={<ProtectedRoute roles={['recruiter']}><PostJobPage key="edit" /></ProtectedRoute>} />
      <Route path="/jobs/:jobId/applications" element={<ProtectedRoute roles={['recruiter']}><ManageApplicationsPage /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgb(var(--card))',
                  color: 'rgb(var(--foreground))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: '10px',
                  boxShadow: '0 16px 40px -12px rgb(var(--shadow-color) / 0.28)',
                  fontSize: '14px',
                  fontWeight: 500,
                },
                success: { iconTheme: { primary: 'rgb(var(--success))', secondary: 'rgb(var(--card))' } },
                error: { iconTheme: { primary: 'rgb(var(--danger))', secondary: 'rgb(var(--card))' } },
              }}
            />
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
