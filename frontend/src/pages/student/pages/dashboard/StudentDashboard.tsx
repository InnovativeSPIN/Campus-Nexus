import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import InfoCard from '@/pages/student/components/common/InfoCard';
import SectionCard from '@/pages/student/components/common/SectionCard';
import {
  User,
  Building2,
  Calendar,
  GraduationCap,
  Users,
  BookOpen,
  FileText,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
} from 'recharts';
import Badge from '@/pages/student/components/common/Badge';

// Mock data
const dashboardData = {
  semesterAttendance: 82.5,
  yearAttendance: 78.3,
  cgpa: 8.45,
  totalCredits: 120,
  earnedCredits: 90,
  attendanceData: [
    { name: 'Present', value: 82.5, color: '#0d9488' },
    { name: 'Absent', value: 17.5, color: '#991b1b' },
  ],
  gpaTrend: [
    { sem: 'Sem 1', gpa: 7.8 },
    { sem: 'Sem 2', gpa: 8.0 },
    { sem: 'Sem 3', gpa: 8.2 },
    { sem: 'Sem 4', gpa: 8.3 },
    { sem: 'Sem 5', gpa: 8.45 },
  ],
  quickStats: [
    { label: 'Classmates', value: 42, icon: Users, color: 'text-info', bg: 'bg-info/10' },
    { label: 'Subjects', value: 6, icon: BookOpen, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Assignments', value: 8, icon: FileText, color: 'text-warning', bg: 'bg-warning/10' },
  ],
  upcomingClasses: [
    { subject: 'Data Structures', time: '10:00 AM', room: 'CS-201' },
    { subject: 'Database Systems', time: '11:00 AM', room: 'CS-203' },
    { subject: 'Operating Systems', time: '2:00 PM', room: 'CS-101' },
  ],
  recentMarks: [
    { subject: 'Data Structures', internal: 42, external: 58, total: 100, grade: 'A' },
    { subject: 'Database Systems', internal: 38, external: 52, total: 90, grade: 'A-' },
    { subject: 'Operating Systems', internal: 35, external: 48, total: 83, grade: 'B+' },
  ],
  alerts: [
    { type: 'warning', message: 'Attendance in Operating Systems is below 75%' },
  ],
};

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}!`}
        subtitle="Here's an overview of your academic progress"
      />


      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <InfoCard
          label="Roll Number"
          value={user?.rollNo || 'N/A'}
          icon={User}
          variant="primary"
        />
        <InfoCard
          label="Department"
          value={typeof user?.department === 'object' ? (user?.department?.short_name || user?.department?.full_name || 'N/A') : (user?.department || 'N/A')}
          icon={Building2}
        />
        <InfoCard
          label="Year / Semester"
          value={`${user?.year || '-'} / ${user?.semester || '-'}`}
          icon={Calendar}
        />
        <InfoCard
          label="CGPA"
          value={dashboardData.cgpa.toFixed(2)}
          icon={GraduationCap}
          variant="secondary"
        />
      </div>

      {/* Attendance & GPA Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Attendance Donut */}
        <SectionCard
          title="Attendance"
          subtitle="Current Semester Overview"
          icon={Target}
        >
          <div className="h-[240px] w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={dashboardData.attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dashboardData.attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              {dashboardData.attendanceData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm text-muted-foreground font-medium">
                    {entry.name} ({entry.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* GPA Trend Chart */}
        <SectionCard
          title="GPA Trend"
          subtitle="Semester-wise"
          icon={TrendingUp}
        >
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.gpaTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="sem"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'oklch(var(--muted-foreground))' }}
                />
                <YAxis
                  domain={[6, 10]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'oklch(var(--muted-foreground))' }}
                />
                <ChartTooltip />
                <Line
                  type="monotone"
                  dataKey="gpa"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={{ fill: '#0d9488', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Marks */}
        <SectionCard title="Recent Marks" subtitle="Latest examination results">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-semibold">Subject</th>
                  <th className="text-center py-3 px-2 font-semibold">Int</th>
                  <th className="text-center py-3 px-2 font-semibold">Ext</th>
                  <th className="text-center py-3 px-2 font-semibold">Total</th>
                  <th className="text-center py-3 px-2 font-semibold">Grade</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentMarks.map((mark, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="py-3 px-2 font-medium">{mark.subject}</td>
                    <td className="text-center py-3 px-2">{mark.internal}</td>
                    <td className="text-center py-3 px-2">{mark.external}</td>
                    <td className="text-center py-3 px-2 font-semibold">{mark.total}</td>
                    <td className="text-center py-3 px-2">
                      <Badge variant={mark.grade.startsWith('A') ? 'success' : 'info'}>
                        {mark.grade}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Quick Stats */}
        <SectionCard title="Quick Stats" subtitle="Overview of your classroom">
          <div className="grid grid-cols-3 gap-4 h-full">
            {dashboardData.quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`p-3 rounded-full ${stat.bg} ${stat.color} mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-bold mb-1">{stat.value}</span>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
