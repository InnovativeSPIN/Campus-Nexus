import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/pages/admin/department-admin/components/ui/sonner";
import { TooltipProvider } from "@/pages/admin/department-admin/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider, MentorProvider } from "@/pages/admin/department-admin/context";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import CoordinatorManagement from "./pages/CoordinatorManagement";
import ClassInchargeManagement from "./pages/ClassInchargeManagement";
import Attendance from "./pages/Attendance";
import Academics from "./pages/Academics";
import Leave from "./pages/Leave";
import Assessments from "./pages/Assessments";
import Communication from "./pages/Communication";
import Counseling from "./pages/Counseling";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import Announcements from "./pages/Announcements";
import { MentorDashboard } from "./pages/MentorDashboard";
import { MenteesList } from "./pages/MenteesList";
import { StudentProfileView } from "./pages/StudentProfileView";
import TimetableEditor from "./pages/TimetableEditor";
import CreateTimetable from "./pages/CreateTimetable";
import { Substitutions } from "./pages/Substitutions";import BreakTimingManager from './pages/BreakTimingManager';
import SubjectAllocation from './pages/SubjectAllocation';
import TimetableAlteration from './pages/TimetableAlteration';
import './department-admin.css';

const queryClient = new QueryClient();

const DepartmentAdminRoutes = () => (
  <MentorProvider>
    <NotificationProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <div className="department-admin-portal min-h-screen">
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="announcements/:id" element={<AnnouncementDetail />} />
              <Route path="profile" element={<Profile />} />
              <Route path="change-password" element={<ChangePassword />} />
              <Route path="coordinators" element={<CoordinatorManagement />} />
              <Route path="class-incharges" element={<ClassInchargeManagement />} />
              <Route path="timetable" element={<TimetableEditor />} />
              <Route path="create-timetable" element={<CreateTimetable />} />
              <Route path="timetable/alterations" element={<TimetableAlteration />} />
              <Route path="break-timings" element={<BreakTimingManager />} />
              <Route path="subject-allocation" element={<SubjectAllocation />} />
              <Route path="substitutions" element={<Substitutions />} />
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


