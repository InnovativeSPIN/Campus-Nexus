import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/pages/faculty/components/layout/MainLayout';
import { motion } from 'framer-motion';
import {
  Users,
  GraduationCap,
  Search,
  BookOpen,
  AlertCircle,
  Phone,
  Mail,
  Hash,
  Check,
  X,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/pages/faculty/lib/utils';

interface ClassInfo {
  id: number;
  name: string;
  section: string;
  semester: number;
  batch: string;
  capacity: number;
  department?: { short_name: string; full_name: string };
}

interface Student {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  semester: number;
}

interface StudentLeave {
  id: number;
  studentId: number;
  leaveType: string;
  leaveSubType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  attachment: string | null;
  student: Student;
}

interface ClassInchargeData {
  incharge: { id: number; academic_year: string; class: ClassInfo };
  students: Student[];
  totalStudents: number;
}

export default function ClassInchargeView() {
  const { user, refreshUserData } = useAuth();
  const refreshedRef = useRef(false);
  const [data, setData] = useState<ClassInchargeData | null>(null);
  const [leaves, setLeaves] = useState<StudentLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'students' | 'leaves'>('students');

  useEffect(() => {
    if (!refreshedRef.current) {
      refreshedRef.current = true;
      refreshUserData();
    }
  }, [refreshUserData]);

  useEffect(() => {
    fetchClassIncharge();
    fetchLeaveRequests();
  }, []);

  const fetchClassIncharge = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/v1/faculty/me/class-incharge', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch class incharge data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveRequests = async () => {
    setLeavesLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/v1/student-leaves/class-incharge', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setLeaves(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
    } finally {
      setLeavesLoading(false);
    }
  };

  const handleLeaveApproval = async (id: number, status: 'approved' | 'rejected') => {
    const remarks = prompt(`Enter ${status} remarks (optional):`);
    if (remarks === null) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/v1/student-leaves/${id}/approval`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, approvalRemarks: remarks }),
      });

      if (res.ok) {
        fetchLeaveRequests();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || err.message || 'Failed to update leave status'}`);
      }

    } catch (err) {
      console.error('Error updating leave status:', err);
    }
  };


  if (!user?.is_class_incharge) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96 text-muted-foreground gap-4">
          <AlertCircle className="w-12 h-12 text-destructive/60" />
          <p className="text-lg font-medium">You are not assigned as a Class Incharge.</p>
          <p className="text-sm">Please contact your Department Admin for assignment.</p>
        </div>
      </MainLayout>
    );
  }

  const filteredStudents = (data?.students || []).filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesSearch =
      !search ||
      fullName.includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const classInfo = data?.incharge?.class;

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-start justify-between"
      >
        <div>
          <h1 className="page-header font-serif">Class Incharge</h1>
          <p className="text-muted-foreground -mt-4">
            Manage your assigned class and students
          </p>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      ) : !data ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
          <AlertCircle className="w-10 h-10 text-yellow-500" />
          <p>No active class assignment found. Please contact your Department Admin.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Class Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="bg-card rounded-xl border p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="font-semibold text-lg">{classInfo?.name || '—'}</p>
              </div>
            </div>
            <div className="bg-card rounded-xl border p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Hash className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Semester</p>
                <p className="font-semibold text-lg">Sem {classInfo?.semester}</p>
              </div>
            </div>
            <div className="bg-card rounded-xl border p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="font-semibold text-lg">{data.totalStudents}</p>
              </div>
            </div>
            <div className="bg-card rounded-xl border p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Academic Year</p>
                <p className="font-semibold text-lg">{classInfo?.batch || '—'}</p>
              </div>
            </div>

          </motion.div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('students')}
              className={cn(
                "px-6 py-3 font-medium text-sm transition-colors relative",
                activeTab === 'students' ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Students
              {activeTab === 'students' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={cn(
                "px-6 py-3 font-medium text-sm transition-colors relative flex items-center gap-2",
                activeTab === 'leaves' ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Leave Requests
              {leaves.length > 0 && (
                <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {leaves.filter(l => l.status === 'pending').length}
                </span>
              )}
              {activeTab === 'leaves' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {activeTab === 'students' ? (
            /* Students Table */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-xl border p-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-semibold text-lg">Students of {classInfo?.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {classInfo?.department?.short_name} — Batch {classInfo?.batch} — Section {classInfo?.section}
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by name or ID..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">#</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                          No students found.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, idx) => (
                        <tr
                          key={student.id}
                          className={cn(
                            'border-b transition-colors hover:bg-muted/30',
                            idx % 2 === 0 ? '' : 'bg-muted/10'
                          )}
                        >
                          <td className="py-3 px-4 text-muted-foreground">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono font-medium">{student.studentId}</td>
                          <td className="py-3 px-4">
                            <span className="font-medium">{student.firstName} {student.lastName}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate max-w-[180px]">{student.email || '—'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                              {student.phone || '—'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                student.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              )}
                            >
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredStudents.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Showing {filteredStudents.length} of {data.totalStudents} students
                </p>
              )}
            </motion.div>
          ) : (
            /* Leave Requests Table */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-xl border p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  Leave Requests
                </h2>
                <button
                  onClick={fetchLeaveRequests}
                  className="text-xs text-primary hover:underline"
                >
                  Refresh
                </button>
              </div>

              {leavesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Dates</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Days</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Reason</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-muted-foreground">
                            No leave applications found for this class.
                          </td>
                        </tr>
                      ) : (
                        leaves.map((leave, idx) => (
                          <tr
                            key={leave.id}
                            className={cn(
                              'border-b transition-colors hover:bg-muted/30',
                              idx % 2 === 0 ? '' : 'bg-muted/10'
                            )}
                          >
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {leave.student ? `${leave.student.firstName} ${leave.student.lastName}` : 'Unknown Student'}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {leave.student?.studentId}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-primary">{leave.leaveType}</span>
                              <p className="text-[10px] text-muted-foreground">{leave.leaveSubType}</p>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col text-xs">
                                <span>{new Date(leave.startDate).toLocaleDateString()}</span>
                                <span className="text-muted-foreground">to {new Date(leave.endDate).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium">{leave.totalDays}</td>
                            <td className="py-3 px-4 max-w-[200px]">
                              <p className="truncate text-muted-foreground" title={leave.reason}>
                                {leave.reason}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={cn(
                                  'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                                  leave.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                                      leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                )}
                              >
                                {leave.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                {leave.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {leave.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                {leave.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {leave.status === 'pending' ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleLeaveApproval(leave.id, 'approved')}
                                    className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                    title="Approve"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleLeaveApproval(leave.id, 'rejected')}
                                    className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                    title="Reject"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </MainLayout>
  );
}
