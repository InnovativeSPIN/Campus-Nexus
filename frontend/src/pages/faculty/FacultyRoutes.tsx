import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/pages/faculty/components/ui/toaster";
import { Toaster as Sonner } from "@/pages/faculty/components/ui/sonner";
import { TooltipProvider } from "@/pages/faculty/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider, MentorProvider } from "@/pages/faculty/context";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import TimetableAlteration from "./pages/TimetableAlteration";
import PlacementCoordinator from "./pages/PlacementCoordinator";
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

import './faculty.css';

const queryClient = new QueryClient();

const FacultyRoutes = () => (
  <MentorProvider>
    <NotificationProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="faculty-portal min-h-screen">
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="change-password" element={<ChangePassword />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="timetable/alterations" element={<TimetableAlteration />} />
              <Route path="placement" element={<PlacementCoordinator />} />
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

export default FacultyRoutes;


