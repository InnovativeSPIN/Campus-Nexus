import { useState, useEffect } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import ProgressBar from '@/pages/student/components/common/ProgressBar';
import Badge from '@/pages/student/components/common/Badge';

import { getAttendanceStatus, getAttendanceMessage, calculateAttendancePercentage } from '@/pages/student/utils/calculateAttendance';
import { SEMESTERS, ATTENDANCE_THRESHOLD } from '@/pages/student/utils/constants';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyAttendance } from '@/pages/student/services/studentApi';

export default function Attendance() {
  const { user } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState<number>(user?.semester || 6);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await getMyAttendance({ 
          studentId: user.id,
          semester: selectedSemester 
        }) as any;
        
        if (res.success && res.data) {
          // Backend returns subjectWiseStats: [{subjectId, subjectName, subjectCode, totalPeriodsRequired, attended, percentage}]
          const subjects = res.data.subjectWiseStats.map((s: any) => ({
            code: s.subjectCode,
            name: s.subjectName,
            attended: s.attended || 0, // Periods attended
            total: s.totalPeriodsRequired || 0 // Total periods from course plan
          }));
          
          const overallAttended = subjects.reduce((acc: number, s: any) => acc + s.attended, 0);
          const overallTotal = subjects.reduce((acc: number, s: any) => acc + s.total, 0);
          
          setAttendanceData({
            overall: { attended: overallAttended, total: overallTotal },
            subjects: subjects
          });
        } else {
          setAttendanceData({
            overall: { attended: 0, total: 0 },
            subjects: []
          });
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError('Failed to load attendance records');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendance();
  }, [user?.id, selectedSemester]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading attendance records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-destructive/10 border border-destructive/20 rounded-xl">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-bold text-destructive mb-2">Error</h3>
        <p className="text-muted-foreground">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const data = attendanceData || { overall: { attended: 0, total: 0 }, subjects: [] };

  const overallPercentage = calculateAttendancePercentage(data.overall.attended, data.overall.total);
  const overallStatus = getAttendanceStatus(overallPercentage);

  const lowAttendanceSubjects = data.subjects.filter(
    (s: any) => calculateAttendancePercentage(s.attended, s.total) < ATTENDANCE_THRESHOLD
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Attendance"
        subtitle="View your attendance records by semester"
        breadcrumbs={[
          { label: 'Academics', path: '/student/academics/attendance' },
          { label: 'Attendance' },
        ]}
        actions={
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
            className="input-field py-2 pr-8"
          >
            {SEMESTERS.filter(sem => sem <= (user?.semester || 8)).reverse().map((sem) => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        }
      />


      {/* Low Attendance Alert */}
      {lowAttendanceSubjects.length > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-warning/10 border border-warning/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <p className="font-medium text-warning">Attendance Alert</p>
              <p className="text-sm text-muted-foreground mt-1">
                Low attendance in: {lowAttendanceSubjects.map((s: any) => s.name).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overall Attendance */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2">
          <SectionCard title="Overall Attendance" subtitle={`Semester ${selectedSemester}`}>
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-muted"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={`${overallPercentage * 2.83} 283`}
                    strokeLinecap="round"
                    className={overallStatus === 'success' ? 'text-success' : overallStatus === 'warning' ? 'text-warning' : 'text-destructive'}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{overallPercentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Classes Attended</p>
                    <p className="text-xl font-bold">{data.overall.attended}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Classes</p>
                    <p className="text-xl font-bold">{data.overall.total}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge variant={overallStatus}>{getAttendanceMessage(overallPercentage)}</Badge>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Quick Stats">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Minimum Required</span>
              <span className="font-medium">{ATTENDANCE_THRESHOLD}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Attendance</span>
              <span className="font-medium">{overallPercentage.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subjects Below 75%</span>
              <span className="font-medium text-destructive">{lowAttendanceSubjects.length}</span>
            </div>
            <div className="pt-3 border-t border-border">
              {overallPercentage >= ATTENDANCE_THRESHOLD ? (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Meeting requirements</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Below requirements</span>
                </div>
              )}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Subject-wise Attendance */}
      <SectionCard title="Subject-wise Attendance">
        <div className="space-y-4">
          {data.subjects.map((subject: any) => {
            const percentage = calculateAttendancePercentage(subject.attended, subject.total);
            const status = getAttendanceStatus(percentage);

            return (
              <div key={subject.code} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{subject.name}</p>
                    <p className="text-sm text-muted-foreground">{subject.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{subject.attended} / {subject.total}</p>
                    <Badge variant={status} className="mt-1">{percentage.toFixed(1)}%</Badge>
                  </div>
                </div>
                <ProgressBar value={percentage} status={status} showLabel={false} />
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}


