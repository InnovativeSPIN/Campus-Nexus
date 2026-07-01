import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import ExamCellDashboard from './ExamCellDashboard';
import SubmissionsList from './SubmissionsList';
import ReviewMarks from './ReviewMarks';
import PublishedResults from './PublishedResults';
import ExamCellNotifications from './Notifications';

export default function ExamCellRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<ExamCellDashboard />} />
        <Route path="/submissions" element={<SubmissionsList />} />
        <Route path="/submissions/:id" element={<ReviewMarks />} />
        <Route path="/results" element={<PublishedResults />} />
        <Route path="/notifications" element={<ExamCellNotifications />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminLayout>
  );
}
