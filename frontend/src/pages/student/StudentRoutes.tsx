import { Routes, Route, Navigate } from 'react-router-dom';
import './student.css';

// Layout
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Dashboard
import StudentDashboard from './pages/dashboard/StudentDashboard';

// Profile
import PersonalInfo from './pages/profile/PersonalInfo';
import ParentInfo from './pages/profile/ParentInfo';
import ReferenceInfo from './pages/profile/ReferenceInfo';
import Photos from './pages/profile/Photos';

// Academics
import Attendance from './pages/academics/Attendance';
import Marks from './pages/academics/Marks';
import Timetable from './pages/academics/Timetable';
import Leave from './pages/academics/Leave';

// Portfolio (combines Records and Extra-curricular)
import StudentPortfolio from './pages/portfolio/StudentPortfolio';

// Knowledge
import Materials from './pages/knowledge/Materials';
import Discussions from './pages/knowledge/Discussions';

// Notifications
import Notifications from './pages/notifications/Notifications';

// Announcements
import Announcements from './pages/announcements/Announcements';

// Errors
import Unauthorized from './pages/errors/Unauthorized';
import NotFound from './pages/NotFound';

const StudentRoutes = () => {
  return (
    <div className="student-portal">
      <Routes>
        {/* Public Routes - kept if needed, but Login is global */}
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />

          {/* Profile */}
          <Route path="profile" element={<Navigate to="personal" replace />} />
          <Route path="profile/basic" element={<Navigate to="personal" replace />} />
          <Route path="profile/personal" element={<PersonalInfo />} />
          <Route path="profile/parent" element={<ParentInfo />} />
          <Route path="profile/reference" element={<ReferenceInfo />} />
          <Route path="profile/photos" element={<Photos />} />

          {/* Academics */}
          <Route path="academics/attendance" element={<Attendance />} />
          <Route path="academics/marks" element={<Marks />} />
          <Route path="academics/timetable" element={<Timetable />} />
          <Route path="academics/leave" element={<Leave />} />

          {/* Portfolio (combines Records and Extra-curricular) */}
          <Route path="portfolio" element={<Navigate to="sports" replace />} />
          <Route path="portfolio/sports" element={<StudentPortfolio />} />
          <Route path="portfolio/events" element={<StudentPortfolio />} />
          <Route path="portfolio/certifications" element={<StudentPortfolio />} />
          <Route path="portfolio/projects" element={<StudentPortfolio />} />

          {/* Knowledge */}
          <Route path="knowledge/materials" element={<Materials />} />
          <Route path="knowledge/discussions" element={<Discussions />} />

          {/* Notifications */}
          <Route path="notifications" element={<Notifications />} />

          {/* Announcements */}
          <Route path="announcements" element={<Announcements />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default StudentRoutes;
