import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/pages/admin/department-admin/components/ui/toaster";
import { Toaster as Sonner } from "@/pages/admin/department-admin/components/ui/sonner";
import { TooltipProvider } from "@/pages/admin/department-admin/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider, MentorProvider } from "@/pages/admin/department-admin/context";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CoordinatorManagement from "./pages/CoordinatorManagement";
import FacultyAllocation from "./pages/FacultyAllocation";
import Timetable from "./pages/Timetable";
import Attendance from "./pages/Attendance";
import Academics from "./pages/Academics";
import Leave from "./pages/Leave";
import Assessments from "./pages/Assessments";
import Communication from "./pages/Communication";
import Counseling from "./pages/Counseling";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import { MentorDashboard } from "./pages/MentorDashboard";
import { MenteesList } from "./pages/MenteesList";
import { StudentProfileView } from "./pages/StudentProfileView";
import TimetableEditor from "./pages/TimetableEditor";

import './department-admin.css';

const queryClient = new QueryClient();

const DepartmentAdminRoutes = () => (
  <MentorProvider>
    <NotificationProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="department-admin-portal min-h-screen">
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="coordinators" element={<CoordinatorManagement />} />
              <Route path="faculty-allocations" element={<FacultyAllocation />} />
              <Route path="timetable" element={<TimetableEditor />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="academics" element={<Academics />} />
              <Route path="leave" element={<Leave />} />
              <Route path="assessments" element={<Assessments />} />
              <Route path="communication" element={<Communication />} />
              <Route path="counseling" element={<Counseling />} />
              <Route path="reports" element={<Reports />} />
              <Route path="mentor" element={<MentorDashboard />} />
              <Route path="mentor/:year" element={<MenteesList />} />
              <Route path="mentor/student/:studentId" element={<StudentProfileView />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </NotificationProvider>
  </MentorProvider>
);

export default DepartmentAdminRoutes;


