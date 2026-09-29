import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
      <Route path="/jobs/new" element={<ProtectedRoute roles={['recruiter']}><PostJobPage /></ProtectedRoute>} />
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
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                },
                success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
