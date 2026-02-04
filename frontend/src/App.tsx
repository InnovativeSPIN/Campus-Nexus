
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

import ExecutiveAdminDashboard from './pages/admin/executive/Dashboard';
import ExecutiveStudents from './pages/admin/executive/Students';
import ExecutiveFaculty from './pages/admin/executive/Faculty';
import ExecutiveReports from './pages/admin/executive/Reports';

import AcademicAdminDashboard from './pages/admin/academic/Dashboard';
import AcademicStudents from './pages/admin/academic/Students';
import AcademicFaculty from './pages/admin/academic/Faculty';
import AcademicDepartments from './pages/admin/academic/Departments';
import AcademicReports from './pages/admin/academic/Reports';

import Login from './pages/auth/Login';
import NotFound from './pages/auth/NotFound';

// Faculty Routes
import FacultyRoutes from './pages/faculty/FacultyRoutes';

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
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Universal Auth */}
              <Route path="/login" element={<Login />} />

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

              {/* Executive Admin Routes */}
              <Route path="/admin/executive" element={<ExecutiveAdminDashboard />} />
              <Route path="/admin/executive/students" element={<ExecutiveStudents />} />
              <Route path="/admin/executive/faculty" element={<ExecutiveFaculty />} />
              <Route path="/admin/executive/reports" element={<ExecutiveReports />} />

              {/* Academic Admin Routes */}
              <Route path="/admin/academic" element={<AcademicAdminDashboard />} />
              <Route path="/admin/academic/students" element={<AcademicStudents />} />
              <Route path="/admin/academic/faculty" element={<AcademicFaculty />} />
              <Route path="/admin/academic/departments" element={<AcademicDepartments />} />
              <Route path="/admin/academic/reports" element={<AcademicReports />} />

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
