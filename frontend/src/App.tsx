import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import HRDashboard from './pages/HRDashboard';
import ResumeUpload from './pages/ResumeUpload';
import JobsPage from './pages/JobsPage';
import PostJob from './pages/PostJob';
import ApplicantsPage from './pages/ApplicantsPage';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'student' | 'hr' }) => {
  const { user, token } = useAuthStore();
  
  if (!token) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/" />;
  
  return <>{children}</>;
};

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={
            user?.role === 'student' ? <Navigate to="/student" /> : 
            user?.role === 'hr' ? <Navigate to="/hr" /> : <Navigate to="/login" />
          } />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/upload" element={
            <ProtectedRoute role="student">
              <ResumeUpload />
            </ProtectedRoute>
          } />
          <Route path="/student/jobs" element={
            <ProtectedRoute role="student">
              <JobsPage />
            </ProtectedRoute>
          } />

          {/* HR Routes */}
          <Route path="/hr" element={
            <ProtectedRoute role="hr">
              <HRDashboard />
            </ProtectedRoute>
          } />
          <Route path="/hr/post-job" element={
            <ProtectedRoute role="hr">
              <PostJob />
            </ProtectedRoute>
          } />
          <Route path="/hr/jobs/:jobId/applicants" element={
            <ProtectedRoute role="hr">
              <ApplicantsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
