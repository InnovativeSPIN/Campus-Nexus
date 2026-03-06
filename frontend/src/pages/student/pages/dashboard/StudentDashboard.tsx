import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAnnouncementNotification } from '@/hooks/useAnnouncementNotification';
import { AnnouncementNotificationModal } from '@/components/common/AnnouncementNotificationModal';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import InfoCard from '@/pages/student/components/common/InfoCard';
import SectionCard from '@/pages/student/components/common/SectionCard';
import {
  User,
  Building2,
  Calendar,
  GraduationCap,
  BookOpen,
  Target,
  TrendingUp,
  Loader2,
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
import {
  getMarksSummary,
  getMyMarks,
  getMyProjects,
  getMyCertifications,
  getMySports,
  getMyEvents
} from '@/pages/student/services/studentApi';

interface SemesterSummary {
  semester: number;
  gpa: number;
  totalCredits: number;
}

interface Mark {
  subject?: { subject_name: string; subject_code: string };
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { announcement, showNotification, setShowNotification } = useAnnouncementNotification();

  const [cgpa, setCgpa] = useState<number | null>(null);
  const [gpaTrend, setGpaTrend] = useState<{ sem: string; gpa: number }[]>([]);
  const [recentMarks, setRecentMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

  const [portfolioStats, setPortfolioStats] = useState({
    projects: 0,
    certifications: 0,
    sports: 0,
    events: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, marksRes]: any = await Promise.allSettled([
          getMarksSummary(),
          getMyMarks(),
        ]);

        if (summaryRes.status === 'fulfilled' && summaryRes.value?.data) {
          const { cgpa: c, semesters } = summaryRes.value.data;
          setCgpa(c);
          setGpaTrend(
            (semesters as SemesterSummary[]).map((s) => ({
              sem: `Sem ${s.semester}`,
              gpa: s.gpa,
            }))
          );
        }

        if (marksRes.status === 'fulfilled' && marksRes.value?.data) {
          setRecentMarks((marksRes.value.data as Mark[]).slice(0, 5));
        }

        // Fetch portfolio counts
        const portfolioPromises = [
          getMyProjects(),
          getMyCertifications(),
          getMySports(),
          getMyEvents()
        ];

        const results = await Promise.allSettled(portfolioPromises);
        setPortfolioStats({
          projects: results[0].status === 'fulfilled' ? (results[0].value as any).data?.length || 0 : 0,
          certifications: results[1].status === 'fulfilled' ? (results[1].value as any).data?.length || 0 : 0,
          sports: results[2].status === 'fulfilled' ? (results[2].value as any).data?.length || 0 : 0,
          events: results[3].status === 'fulfilled' ? (results[3].value as any).data?.length || 0 : 0,
        });
      } catch (_) {
        // silently ignore errors — empty state will show
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const attendanceData = [
    { name: 'Present', value: 82.5, color: '#0d9488' },
    { name: 'Absent', value: 17.5, color: '#991b1b' },
  ];

  return (
    <div className="animate-fade-in">
      {announcement && (
        <AnnouncementNotificationModal
          isOpen={showNotification}
          onClose={() => setShowNotification(false)}
          title={announcement.title}
          message={announcement.message}
          creatorRole={announcement.creatorRole}
          createdAt={announcement.createdAt}
          updatedAt={announcement.updatedAt}
        />
      )}
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}!`}
        subtitle="Here's an overview of your academic progress"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <InfoCard label="Roll Number" value={user?.rollNo || 'N/A'} icon={User} variant="primary" />
        <InfoCard
          label="Department"
          value={
            typeof user?.department === 'object'
              ? user?.department?.short_name || user?.department?.full_name || 'N/A'
              : user?.department || 'N/A'
          }
          icon={Building2}
        />
        <InfoCard
          label="Year / Semester"
          value={`${user?.year || '-'} / ${user?.semester || '-'}`}
          icon={Calendar}
        />
        <InfoCard
          label="CGPA"
          value={loading ? '...' : cgpa !== null ? cgpa.toFixed(2) : 'N/A'}
          icon={GraduationCap}
          variant="secondary"
        />
      </div>

      {/* Attendance & GPA Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Attendance" subtitle="Current Semester Overview" icon={Target}>
          <div className="h-[240px] w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              {attendanceData.map((entry, index) => (
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

        <SectionCard title="GPA Trend" subtitle="Semester-wise" icon={TrendingUp}>
          <div className="h-[240px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : gpaTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gpaTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="sem" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'oklch(var(--muted-foreground))' }} />
                  <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'oklch(var(--muted-foreground))' }} />
                  <ChartTooltip />
                  <Line type="monotone" dataKey="gpa" stroke="#0d9488" strokeWidth={2} dot={{ fill: '#0d9488', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No marks data available yet
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Marks */}
        <SectionCard title="Recent Marks" subtitle="Latest examination results">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentMarks.length > 0 ? (
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
                  {recentMarks.map((mark, index) => (
                    <tr key={index} className="border-b border-border last:border-0">
                      <td className="py-3 px-2 font-medium">{mark.subject?.subject_name || '—'}</td>
                      <td className="text-center py-3 px-2">{mark.internalMarks}</td>
                      <td className="text-center py-3 px-2">{mark.externalMarks}</td>
                      <td className="text-center py-3 px-2 font-semibold">{mark.totalMarks}</td>
                      <td className="text-center py-3 px-2">
                        <Badge variant={mark.grade?.startsWith('A') ? 'success' : 'info'}>
                          {mark.grade || '—'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8 text-sm">No marks recorded yet</p>
          )}
        </SectionCard>

        {/* Portfolio Overview */}
        <SectionCard title="Portfolio Overview" subtitle="Achievements and activities summary">
          <div className="grid grid-cols-2 gap-4 h-full">
            {[
              { label: 'Projects', value: portfolioStats.projects, desc: 'Technical & Academic', icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Certifications', value: portfolioStats.certifications, desc: 'Skills & Achievements', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
              { label: 'Sports', value: portfolioStats.sports, desc: 'Extra-curricular Activities', icon: Target, color: 'text-info', bg: 'bg-info/10' },
              { label: 'Events', value: portfolioStats.events, desc: 'Participation & Honors', icon: Calendar, color: 'text-warning', bg: 'bg-warning/10' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col p-4 rounded-xl border border-border bg-card/50 hover:bg-card transition-all hover:shadow-md animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`p-2.5 rounded-lg ${item.bg} ${item.color} w-fit mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">{item.value}</span>
                    <h4 className="text-sm font-semibold text-foreground mt-1">{item.label}</h4>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 uppercase tracking-wider font-medium">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
