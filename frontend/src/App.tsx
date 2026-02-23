
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';

// Admin Pages
import SuperAdminDashboard from './pages/admin/superadmin/Dashboard';
import SuperAdminStudents from './pages/admin/superadmin/Students';
import SuperAdminFaculty from './pages/admin/superadmin/Faculty';
import SuperAdminDepartments from './pages/admin/superadmin/Departments';
import SuperAdminReports from './pages/admin/superadmin/Reports';
import SuperAdminBackup from './pages/admin/superadmin/Backup';
import SuperAdminAdmins from './pages/admin/superadmin/Admins';
import SuperAdminTimeTable from './pages/admin/superadmin/TimeTable';
import SuperAdminFacultyProfile from './pages/admin/superadmin/FacultyProfile';
import SuperAdminStudentProfile from './pages/admin/superadmin/StudentProfile';
import SuperAdminAnnouncements from './pages/admin/superadmin/Announcements';
//executive admin pages
import ExecutiveAdminDashboard from '@/pages/admin/executive/Dashboard';
import ExecutiveStudents from '@/pages/admin/executive/Students';
import ExecutiveFaculty from '@/pages/admin/executive/Faculty';
import ExecutiveReports from '@/pages/admin/executive/Reports';
import ExecutiveLeaveRequests from '@/pages/admin/executive/LeaveRequests';
import AcademicPerformance from '@/pages/admin/executive/AcademicPerformance';
import ExecutiveStudentProfile from '@/pages/admin/executive/StudentProfile';
import ExecutiveFacultyProfile from '@/pages/admin/executive/FacultyProfile';

// academic admin pages
import AcademicAdminDashboard from './pages/admin/academic/Dashboard';
import AcademicStudents from './pages/admin/academic/Students';
import AcademicFaculty from './pages/admin/academic/Faculty';
import AcademicDepartments from './pages/admin/academic/Departments';
import AcademicReports from './pages/admin/academic/Reports';
 // authentications   
import Login from './pages/auth/Login';
import AdminLogin from './pages/auth/AdminLogin';
import ChangePassword from './pages/auth/ChangePassword';
import NotFound from './pages/auth/NotFound';

// Faculty Routes
import FacultyRoutes from './pages/faculty/FacultyRoutes';

// Department Admin Routes
import DepartmentAdminRoutes from './pages/admin/department-admin/DepartmentAdminRoutes';

// Student Routes
import StudentRoutes from './pages/student/StudentRoutes';


import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster as Sonner } from '@/components/ui/sonner';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Universal Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/change-password" element={<ChangePassword />} />

              {/* Super Admin Routes */}
              <Route path="/admin/superadmin" element={<SuperAdminDashboard />} />
              <Route path="/admin/superadmin/admins" element={<SuperAdminAdmins />} />
              <Route path="/admin/superadmin/timetable" element={<SuperAdminTimeTable />} />
              <Route path="/admin/superadmin/students" element={<SuperAdminStudents />} />
              <Route path="/admin/superadmin/students/:id" element={<SuperAdminStudentProfile />} />
              <Route path="/admin/superadmin/faculty" element={<SuperAdminFaculty />} />
              <Route path="/admin/superadmin/faculty/:id" element={<SuperAdminFacultyProfile />} />
              <Route path="/admin/superadmin/departments" element={<SuperAdminDepartments />} />
              <Route path="/admin/superadmin/reports" element={<SuperAdminReports />} />
              <Route path="/admin/superadmin/backup" element={<SuperAdminBackup />} />
              <Route path="/admin/superadmin/announcements" element={<SuperAdminAnnouncements />} />

              {/* Executive Admin Routes */}
              <Route path="/admin/executive" element={<ExecutiveAdminDashboard />} />
              <Route path="/admin/executive/students" element={<ExecutiveStudents />} />
              <Route path="/admin/executive/students/:id" element={<ExecutiveStudentProfile />} />
              <Route path="/admin/executive/faculty" element={<ExecutiveFaculty />} />
              <Route path="/admin/executive/faculty/:id" element={<ExecutiveFacultyProfile />} />
              <Route path="/admin/executive/leave-requests" element={<ExecutiveLeaveRequests />} />
              <Route path="/admin/executive/academic-performance" element={<AcademicPerformance />} />
              <Route path="/admin/executive/reports" element={<ExecutiveReports />} />
              <Route path="/admin/executive/announcements" element={<SuperAdminAnnouncements />} />

              {/* Academic Admin Routes */}
              <Route path="/admin/academic" element={<AcademicAdminDashboard />} />
              <Route path="/admin/academic/students" element={<AcademicStudents />} />
              <Route path="/admin/academic/faculty" element={<AcademicFaculty />} />
              <Route path="/admin/academic/departments" element={<AcademicDepartments />} />
              <Route path="/admin/academic/reports" element={<AcademicReports />} />
              <Route path="/admin/academic/announcements" element={<SuperAdminAnnouncements />} />

              {/* Department Admin Routes */}
              <Route path="/admin/department-admin/*" element={<DepartmentAdminRoutes />} />

              {/* Student Routes */}
              <Route path="/student/*" element={<StudentRoutes />} />

              {/* Faculty Routes */}
              <Route path="/faculty/*" element={<FacultyRoutes />} />

              {/* Redirects */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              {/* NotFound for all unmatched routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
