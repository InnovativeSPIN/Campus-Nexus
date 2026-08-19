import { Routes, Route, Navigate } from 'react-router-dom';
import ExecutiveProtectedRoute from './components/common/ProtectedRoute';

import ExecutiveAdminDashboard from './Dashboard';
import ExecutiveStudents from './Students';
import ExecutiveStudentProfile from './StudentProfile';
import ExecutiveFaculty from './Faculty';
import ExecutiveFacultyProfile from './FacultyProfile';
import ExecutiveLeaveRequests from './LeaveRequests';
import AcademicPerformance from './AcademicPerformance';
import ExecutiveReports from './Reports';
import ExecutiveAnnouncements from './Announcements';
import ExecutiveAnnouncementDetail from './AnnouncementDetail';
import ExecutiveTimeTable from './TimeTable';
import AuditAndReports from './AuditAndReports';
import BackupAndSecurity from './BackupAndSecurity';
import NotFound from '@/pages/auth/NotFound';

const ExecutiveAdminRoutes = () => (
  <ExecutiveProtectedRoute>
    <Routes>
      <Route index element={<ExecutiveAdminDashboard />} />
      <Route path="dashboard" element={<ExecutiveAdminDashboard />} />
      <Route path="academic-performance" element={<AcademicPerformance />} />
      <Route path="timetable" element={<ExecutiveTimeTable />} />
      <Route path="students" element={<ExecutiveStudents />} />
      <Route path="students/:id" element={<ExecutiveStudentProfile />} />
      <Route path="faculty" element={<ExecutiveFaculty />} />
      <Route path="faculty/:id" element={<ExecutiveFacultyProfile />} />
      <Route path="leave-requests" element={<ExecutiveLeaveRequests />} />
      <Route path="announcements" element={<ExecutiveAnnouncements />} />
      <Route path="announcements/:id" element={<ExecutiveAnnouncementDetail />} />
      <Route path="reports" element={<ExecutiveReports />} />
      <Route path="audit-and-reports" element={<AuditAndReports />} />
      <Route path="backup-security" element={<BackupAndSecurity />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </ExecutiveProtectedRoute>
);

export default ExecutiveAdminRoutes;
