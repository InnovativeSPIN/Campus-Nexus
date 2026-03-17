import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatPeriodDisplay } from '@/utils/periodConfiguration';

interface PeriodAttendanceRecord {
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'On-Duty';
  markedAt: string;
}

interface PeriodStats {
  periodId: number;
  periodLabel: string;
  records: PeriodAttendanceRecord[];
}

interface SubjectWiseStat {
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  onDuty: number;
  percentage: number;
  byPeriod: Record<number, PeriodStats>;
}

interface StudentAttendanceData {
  studentId: string;
  studentName: string;
  rollNumber: string;
  subjectWiseStats: SubjectWiseStat[];
  totalRecords: number;
}

interface StudentAttendanceViewProps {
  studentId: string;
  authToken?: string;
}

export const StudentAttendanceView: React.FC<StudentAttendanceViewProps> = ({
  studentId,
  authToken
}) => {
  const [attendanceData, setAttendanceData] = useState<StudentAttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!authToken) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/v1/student/attendance/student/${studentId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        const result = await response.json();

        if (result.success) {
          setAttendanceData(result.data);
          if (result.data.subjectWiseStats.length > 0) {
            setSelectedSubject(result.data.subjectWiseStats[0].subjectId);
          }
        } else {
          toast.error('Failed to fetch attendance data');
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
        toast.error('Failed to load attendance');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentId, authToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!attendanceData || attendanceData.subjectWiseStats.length === 0) {
    return (
      <div className="text-center p-8 rounded-lg bg-muted/30 border border-border">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No attendance records found</p>
      </div>
    );
  }

  const currentSubject = selectedSubject ? attendanceData.subjectWiseStats.find(s => s.subjectId === selectedSubject) : null;

  // Prepare chart data
  const overallChartData = attendanceData.subjectWiseStats.map(subject => ({
    name: subject.subjectCode,
    attendance: subject.percentage,
    present: subject.present,
    absent: subject.absent
  }));

  const attendanceStatusData = currentSubject ? [
    { name: 'Present', value: currentSubject.present, color: '#22c55e' },
    { name: 'Absent', value: currentSubject.absent, color: '#ef4444' },
    { name: 'Late', value: currentSubject.late, color: '#eab308' },
    { name: 'On Duty', value: currentSubject.onDuty, color: '#8b5cf6' }
  ] : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border border-primary/20">
        <h2 className="text-2xl font-bold">{attendanceData.studentName}</h2>
        <p className="text-sm text-muted-foreground mt-1">Roll Number: {attendanceData.rollNumber}</p>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-3xl font-bold mt-2">{attendanceData.totalRecords}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-primary opacity-50" />
          </div>
        </motion.div>

        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Subjects</p>
              <p className="text-3xl font-bold mt-2">{attendanceData.subjectWiseStats.length}</p>
            </div>
            <Clock className="w-8 h-8 text-secondary opacity-50" />
          </div>
        </motion.div>

        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average</p>
              <p className="text-3xl font-bold mt-2">
                {attendanceData.subjectWiseStats.length > 0
                  ? Math.round(attendanceData.subjectWiseStats.reduce((a, b) => a + b.percentage, 0) / attendanceData.subjectWiseStats.length)
                  : 0}%
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-success opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Overall Attendance Chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-card border border-border p-6">
        <h3 className="font-semibold mb-4">Attendance by Subject</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={overallChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
            <Legend />
            <Bar dataKey="attendance" fill="var(--primary)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Subject Selection */}
      {attendanceData.subjectWiseStats.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {attendanceData.subjectWiseStats.map(subject => (
            <button
              key={subject.subjectId}
              onClick={() => setSelectedSubject(subject.subjectId)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedSubject === subject.subjectId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border hover:border-primary/50'
              }`}
            >
              {subject.subjectCode} ({subject.percentage}%)
            </button>
          ))}
        </div>
      )}

      {/* Selected Subject Details */}
      {currentSubject && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Subject Header */}
          <div className="rounded-lg bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{currentSubject.subjectName}</h3>
                <p className="text-sm text-muted-foreground">{currentSubject.subjectCode}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className={`text-3xl font-bold ${currentSubject.percentage >= 75 ? 'text-success' : 'text-destructive'}`}>
                  {currentSubject.percentage}%
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mt-6">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-blue-600">{currentSubject.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <p className="text-xs text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600">{currentSubject.present}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                <p className="text-xs text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600">{currentSubject.absent}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <p className="text-xs text-muted-foreground">Late/OD</p>
                <p className="text-2xl font-bold text-yellow-600">{currentSubject.late + currentSubject.onDuty}</p>
              </div>
            </div>
          </div>

          {/* Attendance Status Pie Chart */}
          <div className="rounded-lg bg-card border border-border p-6">
            <h4 className="font-semibold mb-4">Attendance Breakdown</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Period-wise Attendance */}
          <div className="rounded-lg bg-card border border-border p-6">
            <h4 className="font-semibold mb-4">Period-wise Records</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.values(currentSubject.byPeriod).map((period) => (
                <div key={period.periodId} className="border border-border rounded-lg p-4">
                  <h5 className="font-medium mb-3">{period.periodLabel}</h5>
                  <div className="space-y-2 text-sm">
                    {period.records.map((record, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-muted-foreground">{record.date}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          record.status === 'Present' ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                          record.status === 'Absent' ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                          record.status === 'Late' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' :
                          'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StudentAttendanceView;
