import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/pages/admin/executive/components/ui/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/pages/admin/executive/components/ui/dialog';
import {
  Users, GraduationCap, Building, ClipboardCheck, IndianRupee,
  ChevronDown, FileText, UserCheck, CalendarDays, Activity,
  Megaphone, CheckCircle2, AlertTriangle, Mail, ArrowUpRight,
  BookOpen, Bell, Calendar, LogOut, TrendingUp, TrendingDown,
  Award, Briefcase, FlaskConical, BarChart2, GaugeCircle,
  BarChart3, RefreshCw, Download,
  ChevronRight, Star, Clock, AlertCircle, Info,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  LabelList, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { AdminLayout } from '@/pages/admin/executive/components/layout/AdminLayout';
import { apiFetch } from '@/lib/apiFetch';

/* ══════════════════════════════════════════════
   DATA SETS
   ══════════════════════════════════════════════ */

const semesterOptions = ['Even Semester 2025', 'Odd Semester 2024', 'Even Semester 2024', 'Odd Semester 2023'];
const batchOptions = ['Batch 2025', 'Batch 2024', 'Batch 2023', 'Batch 2022'];
const programOptions = ['All Programs', 'B.E./B.Tech', 'M.E./M.Tech', 'MBA/MCA', 'Ph.D.'];

const academicDataBySemester: Record<string, { dept: string; result: number; attendance: number }[]> = {
  'Even Semester 2025': [
    { dept: 'CSE', result: 88, attendance: 91 }, { dept: 'ECE', result: 82, attendance: 87 },
    { dept: 'EEE', result: 79, attendance: 84 }, { dept: 'MECH', result: 85, attendance: 89 },
    { dept: 'CIVIL', result: 80, attendance: 86 }, { dept: 'AI & DS', result: 76, attendance: 82 },
  ],
  'Odd Semester 2024': [
    { dept: 'CSE', result: 84, attendance: 89 }, { dept: 'ECE', result: 79, attendance: 85 },
    { dept: 'EEE', result: 75, attendance: 81 }, { dept: 'MECH', result: 82, attendance: 87 },
    { dept: 'CIVIL', result: 77, attendance: 84 }, { dept: 'AI & DS', result: 72, attendance: 80 },
  ],
  'Even Semester 2024': [
    { dept: 'CSE', result: 81, attendance: 87 }, { dept: 'ECE', result: 77, attendance: 83 },
    { dept: 'EEE', result: 73, attendance: 79 }, { dept: 'MECH', result: 79, attendance: 85 },
    { dept: 'CIVIL', result: 75, attendance: 82 }, { dept: 'AI & DS', result: 70, attendance: 78 },
  ],
  'Odd Semester 2023': [
    { dept: 'CSE', result: 79, attendance: 85 }, { dept: 'ECE', result: 74, attendance: 81 },
    { dept: 'EEE', result: 71, attendance: 77 }, { dept: 'MECH', result: 76, attendance: 83 },
    { dept: 'CIVIL', result: 73, attendance: 80 }, { dept: 'AI & DS', result: 68, attendance: 76 },
  ],
};

const strengthDataByProgram: Record<string, { name: string; value: number; pct: string; color: string }[]> = {
  'All Programs': [
    { name: 'I Year', value: 635, pct: '25.8%', color: 'hsl(0,83%,26%)' },
    { name: 'II Year', value: 612, pct: '24.9%', color: 'hsl(181,99%,28%)' },
    { name: 'III Year', value: 643, pct: '26.2%', color: 'hsl(38,92%,50%)' },
    { name: 'IV Year', value: 568, pct: '23.1%', color: 'hsl(142,76%,36%)' },
  ],
  'B.E./B.Tech': [
    { name: 'I Year', value: 480, pct: '26.5%', color: 'hsl(0,83%,26%)' },
    { name: 'II Year', value: 462, pct: '25.5%', color: 'hsl(181,99%,28%)' },
    { name: 'III Year', value: 495, pct: '27.3%', color: 'hsl(38,92%,50%)' },
    { name: 'IV Year', value: 375, pct: '20.7%', color: 'hsl(142,76%,36%)' },
  ],
  'M.E./M.Tech': [
    { name: 'I Year', value: 95, pct: '52.8%', color: 'hsl(0,83%,26%)' },
    { name: 'II Year', value: 85, pct: '47.2%', color: 'hsl(181,99%,28%)' },
    { name: 'III Year', value: 0, pct: '0%', color: 'hsl(38,92%,50%)' },
    { name: 'IV Year', value: 0, pct: '0%', color: 'hsl(142,76%,36%)' },
  ],
  'MBA/MCA': [
    { name: 'I Year', value: 45, pct: '52.3%', color: 'hsl(0,83%,26%)' },
    { name: 'II Year', value: 41, pct: '47.7%', color: 'hsl(181,99%,28%)' },
    { name: 'III Year', value: 0, pct: '0%', color: 'hsl(38,92%,50%)' },
    { name: 'IV Year', value: 0, pct: '0%', color: 'hsl(142,76%,36%)' },
  ],
  'Ph.D.': [
    { name: 'I Year', value: 15, pct: '30%', color: 'hsl(0,83%,26%)' },
    { name: 'II Year', value: 24, pct: '48%', color: 'hsl(181,99%,28%)' },
    { name: 'III Year', value: 11, pct: '22%', color: 'hsl(38,92%,50%)' },
    { name: 'IV Year', value: 0, pct: '0%', color: 'hsl(142,76%,36%)' },
  ],
};

const placementDataByBatch: Record<string, { m: string; v: number }[]> = {
  'Batch 2025': [
    { m: 'Jul', v: 15 }, { m: 'Aug', v: 24 }, { m: 'Sep', v: 29 },
    { m: 'Oct', v: 32 }, { m: 'Nov', v: 40 }, { m: 'Dec', v: 48 },
    { m: 'Jan', v: 52 }, { m: 'Feb', v: 58 }, { m: 'Mar', v: 65 },
    { m: 'Apr', v: 72 }, { m: 'May', v: 79 }, { m: 'Jun', v: 87.6 },
  ],
  'Batch 2024': [
    { m: 'Jul', v: 12 }, { m: 'Aug', v: 20 }, { m: 'Sep', v: 26 },
    { m: 'Oct', v: 30 }, { m: 'Nov', v: 37 }, { m: 'Dec', v: 44 },
    { m: 'Jan', v: 49 }, { m: 'Feb', v: 54 }, { m: 'Mar', v: 61 },
    { m: 'Apr', v: 69 }, { m: 'May', v: 76 }, { m: 'Jun', v: 82.4 },
  ],
  'Batch 2023': [
    { m: 'Jul', v: 10 }, { m: 'Aug', v: 18 }, { m: 'Sep', v: 24 },
    { m: 'Oct', v: 28 }, { m: 'Nov', v: 34 }, { m: 'Dec', v: 41 },
    { m: 'Jan', v: 46 }, { m: 'Feb', v: 51 }, { m: 'Mar', v: 57 },
    { m: 'Apr', v: 63 }, { m: 'May', v: 70 }, { m: 'Jun', v: 78.2 },
  ],
  'Batch 2022': [
    { m: 'Jul', v: 9 }, { m: 'Aug', v: 16 }, { m: 'Sep', v: 21 },
    { m: 'Oct', v: 25 }, { m: 'Nov', v: 31 }, { m: 'Dec', v: 38 },
    { m: 'Jan', v: 43 }, { m: 'Feb', v: 48 }, { m: 'Mar', v: 53 },
    { m: 'Apr', v: 59 }, { m: 'May', v: 66 }, { m: 'Jun', v: 73.8 },
  ],
};

const radarData = [
  { subject: 'Teaching', A: 88, fullMark: 100 },
  { subject: 'Research', A: 72, fullMark: 100 },
  { subject: 'Placement', A: 87, fullMark: 100 },
  { subject: 'Attendance', A: 86, fullMark: 100 },
  { subject: 'Infrastructure', A: 78, fullMark: 100 },
  { subject: 'Compliance', A: 91, fullMark: 100 },
];

const pendingApprovals = [
  { label: 'Leave Applications', count: 8, icon: UserCheck, accent: 'text-destructive bg-destructive/10', detail: '3 Faculty leaves (Dr. Kumar, Prof. Anitha, Dr. Raj) + 5 Student leaves pending your review.' },
  { label: 'Faculty Requests', count: 3, icon: Users, accent: 'text-warning bg-warning/10', detail: '2 Transfer requests and 1 new equipment request from Mechanical Dept.' },
  { label: 'Student Requests', count: 12, icon: GraduationCap, accent: 'text-info bg-info/10', detail: '7 Bonafide certificate requests, 3 fee concession appeals, 2 hostel change requests.' },
  { label: 'Budget Approvals', count: 2, icon: ClipboardCheck, accent: 'text-success bg-success/10', detail: 'AI Lab Upgrade: ₹12.5L, Library Digital Resources: ₹3.2L — awaiting your signature.' },
  { label: 'Event Approvals', count: 4, icon: CalendarDays, accent: 'text-secondary bg-secondary/10', detail: 'Tech Symposium (CSE), Cultural Fest (Student Council), Workshop (ECE), Hackathon (AI&DS).' },
];

const alerts = [
  { text: 'NAAC Data Submission Pending', date: '10 Jun 2026', urgent: true, detail: 'Criteria I–VI data must be uploaded to the NAAC portal before the deadline. SSR draft is 85% complete.' },
  { text: 'AICTE Compliance Report Due', date: '15 Jun 2026', urgent: true, detail: 'Annual compliance report including faculty-student ratio, infrastructure, and placement data.' },
  { text: 'Department Budget Review', date: '18 Jun 2026', urgent: false, detail: 'Q2 budget utilisation review meeting with all HODs scheduled in Conference Hall.' },
  { text: 'Scholarship Verification Pending', date: '20 Jun 2026', urgent: false, detail: '42 BC/MBC scholarship applications and 18 SC/ST scholarship applications need verification.' },
  { text: 'Infrastructure Audit Scheduled', date: '25 Jun 2026', urgent: false, detail: 'Annual infrastructure audit by external agency. Labs, classrooms, and hostels to be inspected.' },
];

const recentActivities = [
  { text: 'New faculty Dr. Anitha joined in CSE Dept.', time: '2h ago', icon: UserCheck, color: 'text-success bg-success/10', detail: 'Dr. Anitha M., Ph.D. (IIT Madras), specialising in Machine Learning, appointed as Assistant Professor.' },
  { text: 'Budget approved for AI Lab Upgradation', time: '4h ago', icon: IndianRupee, color: 'text-info bg-info/10', detail: '₹12.5 Lakhs sanctioned for GPU workstations, networking, and software licenses.' },
  { text: 'Workshop on "Cloud Computing" approved', time: '1d ago', icon: Award, color: 'text-warning bg-warning/10', detail: '2-day hands-on workshop sponsored by AWS. 120 participants from CSE and IT departments.' },
  { text: 'Student Achievements data updated', time: '2d ago', icon: Star, color: 'text-primary bg-primary/10', detail: '23 new entries: 8 Hackathon wins, 5 Paper presentations, 6 Sports, 4 Cultural awards.' },
  { text: 'NAAC Criteria VI data verified', time: '3d ago', icon: CheckCircle2, color: 'text-secondary bg-secondary/10', detail: 'Governance, Leadership, and Management data verified by IQAC. Ready for SSR upload.' },
];

const quickActions = [
  { label: 'Generate Reports', icon: FileText, color: 'text-primary', bg: 'bg-primary/10 hover:bg-primary hover:text-white', type: 'report' as const },
  { label: 'Approve Requests', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10 hover:bg-success hover:text-white', type: 'approve' as const },
  { label: 'Add Notice', icon: Megaphone, color: 'text-info', bg: 'bg-info/10 hover:bg-info hover:text-white', type: 'notice' as const },
  { label: 'View Analytics', icon: BarChart2, color: 'text-warning', bg: 'bg-warning/10 hover:bg-warning hover:text-white', type: 'analytics' as const },
  { label: 'Academic Calendar', icon: CalendarDays, color: 'text-destructive', bg: 'bg-destructive/10 hover:bg-destructive hover:text-white', type: 'calendar' as const },
  { label: 'Send Circular', icon: Mail, color: 'text-secondary', bg: 'bg-secondary/10 hover:bg-secondary hover:text-white', type: 'circular' as const },
];

const statDetails: Record<string, { title: string; icon: React.ElementType; rows: { label: string; value: string; trend?: string }[] }> = {
  'Total Students': {
    title: 'Student Breakdown — Academic Year 2025-26',
    icon: GraduationCap,
    rows: [
      { label: 'I Year', value: '635', trend: '↑ 4.2%' }, { label: 'II Year', value: '612', trend: '↑ 2.1%' },
      { label: 'III Year', value: '643', trend: '↑ 7.5%' }, { label: 'IV Year', value: '568', trend: '↑ 1.8%' },
      { label: 'Male Students', value: '1,342' }, { label: 'Female Students', value: '1,116' },
      { label: 'Day Scholars', value: '1,508' }, { label: 'Hostellers', value: '950' },
      { label: 'SC/ST Category', value: '312' }, { label: 'OBC Category', value: '890' },
    ],
  },
  'Total Faculty': {
    title: 'Faculty Split — 2025-26',
    icon: Users,
    rows: [
      { label: 'Professors', value: '18', trend: '↑ 2' }, { label: 'Associate Professors', value: '34', trend: '↑ 3' },
      { label: 'Assistant Professors', value: '82', trend: '↑ 1' }, { label: 'Visiting Faculty', value: '12' },
      { label: 'Non-Teaching Staff', value: '10' }, { label: 'Ph.D. Holders', value: '94', trend: '↑ 6' },
      { label: 'Male Faculty', value: '87' }, { label: 'Female Faculty', value: '69' },
      { label: 'Avg. Experience', value: '11.4 yrs' },
    ],
  },
  'Departments': {
    title: 'Department-wise Strength',
    icon: Building,
    rows: [
      { label: 'CSE', value: '480 students' }, { label: 'ECE', value: '320 students' },
      { label: 'EEE', value: '280 students' }, { label: 'Mechanical', value: '350 students' },
      { label: 'Civil', value: '250 students' }, { label: 'AI & DS', value: '310 students' },
      { label: 'IT', value: '290 students' }, { label: 'Others (5 depts)', value: '178 students' },
      { label: 'Total Depts (UG)', value: '8' }, { label: 'Total Depts (PG)', value: '4' },
    ],
  },
  'Programs': {
    title: 'Program Details',
    icon: BookOpen,
    rows: [
      { label: 'B.E. / B.Tech', value: '12 programs' }, { label: 'M.E. / M.Tech', value: '8 programs' },
      { label: 'MBA', value: '2 programs' }, { label: 'MCA', value: '1 program' },
      { label: 'Ph.D.', value: '5 programs' }, { label: 'AICTE Approved', value: '23' },
      { label: 'NBA Accredited', value: '6' }, { label: 'Intake (Total)', value: '1,980' },
    ],
  },
  'Placement Rate': {
    title: 'Placement Details — Batch 2025',
    icon: Briefcase,
    rows: [
      { label: 'Total Eligible', value: '520' }, { label: 'Placed', value: '455', trend: '↑ 5.8%' },
      { label: 'Higher Studies', value: '38' }, { label: 'Entrepreneurs', value: '12' },
      { label: 'Avg. Package', value: '₹ 5.2 LPA', trend: '↑ ₹0.4 LPA' },
      { label: 'Highest Package', value: '₹ 42 LPA' }, { label: 'Top Recruiter', value: 'TCS (68 offers)' },
      { label: 'Companies Visited', value: '87' }, { label: 'Offers > 10 LPA', value: '42' },
    ],
  },
  'Research Funding': {
    title: 'Research & Funding Breakdown',
    icon: FlaskConical,
    rows: [
      { label: 'DST Projects', value: '₹ 45 L', trend: '↑ 12%' }, { label: 'AICTE Grants', value: '₹ 28 L' },
      { label: 'Industry Sponsored', value: '₹ 32 L', trend: '↑ 18%' },
      { label: 'Internal R&D Fund', value: '₹ 20 L' }, { label: 'Active Projects', value: '14' },
      { label: 'Patents Filed', value: '7', trend: '↑ 3' }, { label: 'Patents Granted', value: '4' },
      { label: 'Publications (2025)', value: '89' }, { label: 'Scopus Indexed', value: '62' },
    ],
  },
};

/* ══════════════════════════════════════════════
   CUSTOM TOOLTIP
   ══════════════════════════════════════════════ */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg font-sans text-xs">
        <p className="font-bold text-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className={`font-semibold chart-tooltip-value-${i}`}
            data-color={p.color || p.stroke}
            ref={(el) => { if (el) el.style.color = p.color || p.stroke || ''; }}>
            {p.name}: <span className="text-foreground">{p.value}{p.unit || ''}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */
export default function ExecutiveAdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const displayName = user?.name || 'Dr. R. Principal';

  /* dropdown states */
  const [selectedSemester, setSelectedSemester] = useState(semesterOptions[0]);
  const [selectedBatch, setSelectedBatch] = useState(batchOptions[0]);
  const [selectedProgram, setSelectedProgram] = useState(programOptions[0]);
  const [chartView, setChartView] = useState<'result' | 'attendance'>('result');

  /* dropdown open states */
  const [semesterOpen, setSemesterOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [programOpen, setProgramOpen] = useState(false);

  /* modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalBody, setModalBody] = useState<React.ReactNode>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  /* notification state */
  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(8);
  const [msgCount, setMsgCount] = useState(5);

  /* live clock */
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [dashboardCharts, setDashboardCharts] = useState<any>(null);
  const [liveActivities, setLiveActivities] = useState<any[]>([]);
  const [livePendingApprovals, setLivePendingApprovals] = useState<any[]>([]);
  const [liveApprovalsLoading, setLiveApprovalsLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const statsRaw = await apiFetch('/api/v1/executive/stats');
      const statsRes = await statsRaw.json();
      if (statsRes.success) setDashboardStats(statsRes.data);

      const approvalsRaw = await apiFetch('/api/v1/executive/pending-approvals');
      const approvalsRes = await approvalsRaw.json();
      if (approvalsRes.success) {
        setLivePendingApprovals(approvalsRes.data.leaveApplications || []);
      }

      const chartsRaw = await apiFetch('/api/v1/executive/charts');
      const chartsRes = await chartsRaw.json();
      if (chartsRes.success) setDashboardCharts(chartsRes.data);

      const activitiesRaw = await apiFetch('/api/v1/executive/activities');
      const activitiesRes = await activitiesRaw.json();
      if (activitiesRes.success) setLiveActivities(activitiesRes.data.recentActivities || []);
    } catch (err) {
      console.error('Failed to fetch executive data', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /* close dropdowns on outside click */
  useEffect(() => {
    const handler = () => { setSemesterOpen(false); setBatchOpen(false); setProgramOpen(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  /* computed data */
  const academicData = dashboardCharts?.academicDataBySemester || academicDataBySemester[selectedSemester] || academicDataBySemester[semesterOptions[0]];
  const strengthData = dashboardCharts?.strengthDataByProgram?.[selectedProgram] || strengthDataByProgram[selectedProgram] || strengthDataByProgram[programOptions[0]];
  const placementData = dashboardCharts?.placementDataByBatch || placementDataByBatch[selectedBatch] || placementDataByBatch[batchOptions[0]];

  // Use real data if available from database endpoints, fallback to default mock
  const totalStudentsVal = dashboardStats?.totalStudents ?? strengthData.reduce((s: any, d: any) => s + d.value, 0);
  const totalFacultyVal = dashboardStats?.totalFaculty ?? 156;
  const totalDeptsVal = dashboardStats?.totalDepartments ?? 12;
  const totalProgramsVal = dashboardStats?.totalPrograms ?? 28;
  const placementRateVal = dashboardStats?.placementRate ?? placementData[placementData.length - 1]?.v ?? 0;
  const researchFundingVal = dashboardStats?.researchFunding ?? 1.25;

  // Dynamic Pending Approvals mapping
  const dynamicApprovals = [
    {
      label: 'Leave Applications',
      count: livePendingApprovals.length || 8, // fallback to mock 8
      icon: UserCheck,
      accent: 'text-destructive bg-destructive/10',
      detail: livePendingApprovals.length > 0
        ? `${livePendingApprovals.length} pending leave requests from Faculty.`
        : '3 Faculty leaves (Dr. Kumar, Prof. Anitha, Dr. Raj) + 5 Student leaves pending your review.',
      originalData: livePendingApprovals
    },
    ...pendingApprovals.slice(1) // Keep the rest as mock for now
  ];

  const openModal = (title: string, body: React.ReactNode) => {
    setModalTitle(title); setModalBody(body); setModalOpen(true);
  };

  /* ── stat card click ── */
  const handleStatClick = (label: string) => {
    const info = statDetails[label];
    if (!info) return;
    const Icon = info.icon;
    openModal(info.title, (
      <div className="space-y-0 font-sans">
        <div className="flex items-center gap-3 mb-4 p-3 bg-primary/5 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Detailed breakdown for Academic Year 2025-26</p>
        </div>
        {info.rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0 group hover:bg-muted/20 px-2 -mx-2 rounded transition-colors">
            <span className="text-sm text-muted-foreground font-medium">{r.label}</span>
            <div className="flex items-center gap-2">
              {r.trend && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${r.trend.startsWith('↑') ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'}`}>
                  {r.trend}
                </span>
              )}
              <span className="text-sm font-bold text-foreground">{r.value}</span>
            </div>
          </div>
        ))}
      </div>
    ));
  };

  /* ── approval click ── */
  const handleApprovalClick = (item: any) => {
    openModal(`${item.label} — ${item.count} Pending`, (
      <div className="space-y-4 font-sans">
        <div className={`p-3 rounded-xl flex items-start gap-3 ${item.accent.replace('text-', 'bg-').split(' ')[0]}/5`}>
          <item.icon className={`w-5 h-5 mt-0.5 shrink-0 ${item.accent.split(' ')[0]}`} />
          <p className="text-sm text-foreground/80 leading-relaxed">{item.detail}</p>
        </div>

        {item.label === 'Leave Applications' && item.originalData?.length > 0 && (
          <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-1">
            {item.originalData.map((leave: any) => (
              <div key={leave.id} className="p-3 bg-muted/30 border border-border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{leave.applicant?.name} <span className="text-xs text-muted-foreground">({leave.department?.department_name})</span></p>
                  <p className="text-xs text-muted-foreground">{leave.leaveType} Leave • {leave.totalDays} Days</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">Reason: {leave.reason}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button disabled={liveApprovalsLoading} onClick={() => handleIndividualApproval('leave', leave.id, 'approve')} className="px-3 py-1 bg-success text-white text-xs font-bold rounded hover:bg-success/90">Approve</button>
                  <button disabled={liveApprovalsLoading} onClick={() => handleIndividualApproval('leave', leave.id, 'reject')} className="px-3 py-1 bg-destructive text-white text-xs font-bold rounded hover:bg-destructive/90">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(!item.originalData || item.originalData.length === 0) && (
          <div className="flex gap-2">
            <button
              onClick={() => { setModalOpen(false); toast({ title: `${item.label} approved`, description: `All ${item.count} items have been approved successfully.` }); }}
              className="flex-1 py-2.5 bg-success text-white rounded-lg text-sm font-bold hover:bg-success/90 transition-colors"
            >
              ✓ Approve All
            </button>
            <button
              onClick={() => { setModalOpen(false); toast({ title: `${item.label} sent back`, description: 'Items returned to department for revision.' }); }}
              className="flex-1 py-2.5 bg-muted text-muted-foreground rounded-lg text-sm font-bold hover:bg-destructive hover:text-white transition-colors"
            >
              ✗ Reject
            </button>
          </div>
        )}
      </div>
    ));
  };

  const handleIndividualApproval = async (type: string, id: number, action: 'approve' | 'reject') => {
    try {
      setLiveApprovalsLoading(true);
      const resRaw = await apiFetch(`/api/v1/executive/approve/${type}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, remarks: `Executive ${action}d` })
      });
      const res = await resRaw.json();
      if (res.success) {
        toast({ title: 'Success', description: `Request ${action}d successfully` });
        await fetchDashboardData();
        setModalOpen(false); // close to refresh data
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to process request', variant: 'destructive' });
    } finally {
      setLiveApprovalsLoading(false);
    }
  };

  /* ── alert click ── */
  const handleAlertClick = (item: typeof alerts[0]) => {
    openModal(item.text, (
      <div className="space-y-4 font-sans">
        <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full w-fit ${item.urgent ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
          <AlertTriangle className="w-3.5 h-3.5" />
          {item.urgent ? 'URGENT' : 'REMINDER'} · {item.date}
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">{item.detail}</p>
        <div className="flex gap-2">
          <button
            onClick={() => { setModalOpen(false); toast({ title: 'Marked as reviewed', description: `"${item.text}" has been acknowledged.` }); }}
            className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            Mark Reviewed
          </button>
          <button
            onClick={() => { setModalOpen(false); toast({ title: 'Reminder set', description: `You will be reminded about "${item.text}" 24 hours before the deadline.` }); }}
            className="flex-1 py-2.5 bg-muted text-foreground rounded-lg text-sm font-bold hover:bg-muted/80 transition-colors"
          >
            Set Reminder
          </button>
        </div>
      </div>
    ));
  };

  /* ── activity click ── */
  const handleActivityClick = (item: typeof recentActivities[0]) => {
    openModal(item.text, (
      <div className="space-y-3 font-sans">
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.color.split(' ')[1]}`}>
            <item.icon className={`w-4 h-4 ${item.color.split(' ')[0]}`} />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">{item.text}</p>
            <p className="text-[11px] text-muted-foreground">{item.time}</p>
          </div>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">{item.detail}</p>
        <button
          onClick={() => { setModalOpen(false); toast({ title: 'Acknowledged', description: 'Activity has been noted in the log.' }); }}
          className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          Acknowledge
        </button>
      </div>
    ));
  };

  /* ── quick action handlers ── */
  const handleReport = () => {
    openModal('Generate Reports', (
      <div className="space-y-3 font-sans">
        <p className="text-sm text-muted-foreground">Select report type to generate and download:</p>
        {[
          { name: 'Academic Performance Report', desc: 'All departments, current semester' },
          { name: 'Placement Statistics Report', desc: 'Batch-wise detailed analysis' },
          { name: 'Faculty Attendance Report', desc: 'Monthly consolidated report' },
          { name: 'Financial Summary Report', desc: 'Revenue, expenses & budget utilization' },
          { name: 'NAAC Compliance Report', desc: 'All 6 criteria consolidated' },
        ].map((r) => (
          <button key={r.name}
            onClick={() => { setModalOpen(false); toast({ title: `${r.name} — Generating`, description: 'PDF will be ready in a few seconds. Check your Downloads.' }); }}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group text-left"
          >
            <div>
              <p className="text-sm font-bold text-foreground">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
            </div>
            <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </button>
        ))}
      </div>
    ));
  };

  const handleApproveModal = () => {
    openModal('Pending Approval Requests', (
      <div className="space-y-2 font-sans max-h-[60vh] overflow-y-auto pr-1">
        {[
          { emoji: '🔴', text: 'Leave: Dr. Kumar (CSE) — 3 days medical leave, Jun 20–22', type: 'leave' },
          { emoji: '🔴', text: 'Leave: Prof. Anitha (ECE) — 2 days personal leave, Jun 21–22', type: 'leave' },
          { emoji: '🔴', text: 'Leave: Dr. Raj (Mech) — 1 day emergency leave, Jun 19', type: 'leave' },
          { emoji: '🟡', text: 'Budget: AI Lab Upgrade — ₹12.5L (pending finance sign-off)', type: 'budget' },
          { emoji: '🟡', text: 'Budget: Library Digital Resources — ₹3.2L', type: 'budget' },
          { emoji: '🔵', text: 'Event: Tech Symposium 2026 — CSE Dept, Jul 15–16', type: 'event' },
          { emoji: '🔵', text: 'Event: National Hackathon — AI&DS Dept, Jul 22–23', type: 'event' },
          { emoji: '🟢', text: 'Transfer: Prof. Suresh (EEE → ECE) — inter-dept transfer', type: 'transfer' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-border hover:bg-muted/20 transition-colors">
            <span className="text-sm text-foreground/80 flex items-center gap-2">{item.emoji} {item.text}</span>
            <div className="flex gap-1 shrink-0 ml-2">
              <button onClick={() => toast({ title: 'Approved!', description: item.text })} className="px-2 py-1 text-[10px] font-bold bg-success/10 text-success hover:bg-success hover:text-white rounded-md transition-colors">✓</button>
              <button onClick={() => toast({ title: 'Rejected', description: item.text, variant: 'destructive' })} className="px-2 py-1 text-[10px] font-bold bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-md transition-colors">✗</button>
            </div>
          </div>
        ))}
      </div>
    ));
  };

  const handleNoticeModal = () => {
    openModal('Create New Notice / Announcement', (
      <div className="space-y-3 font-sans">
        <div className="grid grid-cols-2 gap-2">
          {['General', 'Academic', 'Administrative', 'Urgent'].map((type) => (
            <button key={type} onClick={() => toast({ title: `Notice Type: ${type}`, description: `Creating a new ${type} notice. Redirecting to announcements...` })}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors hover:border-primary/40 hover:bg-primary/5 ${type === 'Urgent' ? 'border-destructive/40 text-destructive bg-destructive/5' : 'border-border text-foreground'}`}>
              {type === 'Urgent' ? '🔴 ' : type === 'General' ? '🔵 ' : type === 'Academic' ? '📚 ' : '⚙️ '}{type}
            </button>
          ))}
        </div>
        <div className="p-3 bg-muted/30 rounded-xl">
          <p className="text-xs font-bold text-foreground mb-2">Recent Notices Published:</p>
          {[
            { text: 'Mid-semester exam schedule', date: 'Jun 12' },
            { text: 'Faculty development program registration', date: 'Jun 10' },
            { text: 'Library extended hours during exams', date: 'Jun 8' },
            { text: 'Campus placement drive by Infosys', date: 'Jun 5' },
          ].map((n, i) => (
            <p key={i} className="text-xs text-muted-foreground py-1 border-b border-border/30 last:border-0 flex justify-between">
              <span>• {n.text}</span><span className="font-medium">{n.date}</span>
            </p>
          ))}
        </div>
        <button onClick={() => { setModalOpen(false); navigate('/admin/executive/announcements'); }}
          className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
          Open Announcements Manager →
        </button>
      </div>
    ));
  };

  const handleCalendarModal = () => {
    openModal('Academic Calendar — Even Semester 2025-26', (
      <div className="space-y-2 font-sans max-h-[60vh] overflow-y-auto pr-1">
        {[
          { emoji: '📝', text: 'Mid-Semester Examinations', date: 'Jun 16–20', status: 'ongoing' },
          { emoji: '📋', text: 'Last date for Internal Assessment submission', date: 'Jun 25', status: 'upcoming' },
          { emoji: '🎭', text: 'Sports Day & Cultural Week', date: 'Jul 1–3', status: 'upcoming' },
          { emoji: '👥', text: 'Staff Council Meeting', date: 'Jul 10', status: 'upcoming' },
          { emoji: '💻', text: 'Tech Symposium (CSE)', date: 'Jul 15–16', status: 'upcoming' },
          { emoji: '📚', text: 'End Semester Examinations', date: 'Aug 1–15', status: 'future' },
          { emoji: '🎓', text: 'Results Publication', date: 'Aug 20', status: 'future' },
          { emoji: '🏫', text: 'Odd Semester begins', date: 'Sep 1', status: 'future' },
        ].map((item, i) => (
          <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors hover:bg-muted/20 cursor-pointer ${item.status === 'ongoing' ? 'border-success/40 bg-success/5' : 'border-border'}`}>
            <span className="text-lg">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{item.text}</p>
              <p className="text-xs text-muted-foreground">{item.date}</p>
            </div>
            {item.status === 'ongoing' && <span className="text-[10px] font-bold bg-success text-white px-2 py-0.5 rounded-full shrink-0">LIVE</span>}
          </div>
        ))}
      </div>
    ));
  };

  const handleCircularModal = () => {
    openModal('Send Circular', (
      <div className="space-y-3 font-sans">
        <p className="text-sm text-muted-foreground">Select recipients for circular:</p>
        <div className="grid grid-cols-2 gap-2">
          {['All Faculty', 'All Students', 'All HODs', 'Admin Staff', 'Parents', 'Custom Group'].map((r) => (
            <button key={r} onClick={() => { setModalOpen(false); toast({ title: `Circular sent to ${r}`, description: 'Circular has been dispatched successfully via email and SMS.' }); }}
              className="py-2 px-3 rounded-lg text-xs font-bold border border-border hover:border-secondary/40 hover:bg-secondary/5 hover:text-secondary transition-colors flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> {r}
            </button>
          ))}
        </div>
        <div className="p-3 bg-muted/30 rounded-xl">
          <p className="text-xs font-bold text-foreground mb-2">Recent Circulars Sent:</p>
          {['Dress code reminder — All Students · Jun 14', 'NAAC preparation meeting — All HODs · Jun 12', 'Exam hall allocation — All Faculty · Jun 10'].map((c, i) => (
            <p key={i} className="text-xs text-muted-foreground py-1 border-b border-border/30 last:border-0">• {c}</p>
          ))}
        </div>
      </div>
    ));
  };

  const handleQuickAction = (type: string) => {
    switch (type) {
      case 'report': handleReport(); break;
      case 'approve': handleApproveModal(); break;
      case 'notice': handleNoticeModal(); break;
      case 'analytics': setAnalyticsOpen(true); break;
      case 'calendar': handleCalendarModal(); break;
      case 'circular': handleCircularModal(); break;
    }
  };

  const handleViewAllApprovals = () => {
    openModal('All Pending Approvals', (
      <div className="space-y-2 font-sans max-h-[60vh] overflow-y-auto pr-1">
        {pendingApprovals.map((a) => (
          <div key={a.label} className="p-3 rounded-xl border border-border hover:bg-muted/20 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-foreground flex items-center gap-2">
                <a.icon className={`w-4 h-4 ${a.accent.split(' ')[0]}`} /> {a.label}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.accent}`}>{a.count} pending</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{a.detail}</p>
          </div>
        ))}
      </div>
    ));
  };

  const handleViewAllAlerts = () => {
    openModal('All Important Alerts', (
      <div className="space-y-2 font-sans max-h-[60vh] overflow-y-auto pr-1">
        {alerts.map((a) => (
          <div key={a.text} onClick={() => handleAlertClick(a)} className="p-3 rounded-xl border border-border hover:bg-muted/20 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-bold flex items-center gap-2 ${a.urgent ? 'text-destructive' : 'text-warning'}`}>
                <AlertTriangle className="w-3.5 h-3.5" /> {a.text}
              </span>
              <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{a.date}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{a.detail}</p>
          </div>
        ))}
      </div>
    ));
  };

  const handleViewAllActivities = () => {
    openModal('All Recent Activities', (
      <div className="space-y-2 font-sans max-h-[60vh] overflow-y-auto pr-1">
        {recentActivities.map((a) => (
          <div key={a.text} onClick={() => handleActivityClick(a)} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/20 transition-colors cursor-pointer">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.color.split(' ')[1]}`}>
              <a.icon className={`w-4 h-4 ${a.color.split(' ')[0]}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{a.text}</p>
              <p className="text-xs text-muted-foreground">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    ));
  };

  const handleNotifClick = () => {
    setNotifCount(0);
    setNotifOpen(true);
    openModal('Notifications', (
      <div className="space-y-2 font-sans max-h-[60vh] overflow-y-auto pr-1">
        {[
          { title: 'NAAC submission deadline approaching', time: '10 min ago', read: false, urgent: true },
          { title: 'Dr. Kumar leave application pending', time: '2h ago', read: false, urgent: false },
          { title: 'Budget approval required: AI Lab ₹12.5L', time: '4h ago', read: false, urgent: false },
          { title: 'AICTE report due in 5 days', time: '6h ago', read: true, urgent: true },
          { title: 'Prof. Anitha leave application', time: '1d ago', read: true, urgent: false },
          { title: 'Tech Symposium event approval pending', time: '1d ago', read: true, urgent: false },
          { title: 'Scholarship verification: 60 applications', time: '2d ago', read: true, urgent: false },
          { title: 'Infrastructure audit scheduled Jun 25', time: '3d ago', read: true, urgent: false },
        ].map((n, i) => (
          <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer hover:bg-muted/20 ${!n.read ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.urgent ? 'bg-destructive' : 'bg-primary'} ${n.read ? 'opacity-30' : ''}`} />
            <div>
              <p className={`text-sm font-semibold ${n.read ? 'text-muted-foreground' : 'text-foreground'}`}>{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    ));
  };

  const handleMsgClick = () => {
    setMsgCount(0);
    openModal('Messages', (
      <div className="space-y-2 font-sans max-h-[60vh] overflow-y-auto pr-1">
        {[
          { from: 'Dr. Subramaniam (HOD-CSE)', msg: 'Sir, the lab equipment procurement...', time: '1h ago', read: false },
          { from: 'Prof. Meena (HOD-ECE)', msg: 'Department seminar schedule...', time: '3h ago', read: false },
          { from: 'Controller of Examinations', msg: 'Regarding hall ticket distribution...', time: '5h ago', read: false },
          { from: 'Finance Officer', msg: 'Q2 budget reconciliation report...', time: '1d ago', read: true },
          { from: 'IQAC Coordinator', msg: 'NAAC SSR draft chapter updates...', time: '2d ago', read: true },
        ].map((m, i) => (
          <div key={i} onClick={() => toast({ title: `Message from ${m.from}`, description: m.msg })}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer hover:bg-muted/20 ${!m.read ? 'border-secondary/30 bg-secondary/5' : 'border-border'}`}>
            <div className={`w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0`}>
              {m.from.split(' ')[0][0]}{m.from.split(' ')[1]?.[0] || ''}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className={`text-sm font-bold truncate ${m.read ? 'text-muted-foreground' : 'text-foreground'}`}>{m.from}</p>
                <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{m.time}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{m.msg}</p>
            </div>
          </div>
        ))}
      </div>
    ));
  };

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* ─── Welcome Header ─── */}
        <div className="widget-card !p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden bg-white border border-slate-200 shadow-sm rounded-2xl">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-black font-sans">
              Principal's Dashboard
            </h1>
            <p className="text-black font-sans text-sm flex items-center gap-1.5 font-medium mt-1">
              Welcome, {displayName}
              <CheckCircle2 className="inline w-4 h-4 text-emerald-600" />
            </p>
            <p className="text-slate-600 font-sans text-xs mt-0.5">
              Executive Overview · {currentTime.toLocaleString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            {/* Notification Bell */}
            <button onClick={handleNotifClick}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-black border border-slate-200"
              aria-label="Notifications">
              <Bell className="w-5 h-5 text-slate-800" />
              {notifCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {notifCount}
                </span>
              )}
            </button>
            {/* Messages */}
            <button onClick={handleMsgClick}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-black border border-slate-200"
              aria-label="Messages">
              <Mail className="w-5 h-5 text-slate-800" />
              {msgCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {msgCount}
                </span>
              )}
            </button>
            {/* Profile */}
            <button onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2.5 p-1 pr-3 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors h-10"
              aria-label="Profile">
              <div className="w-8 h-8 rounded-[10px] bg-[#800000] flex items-center justify-center text-white font-bold text-xs">
                {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-bold text-black font-sans leading-none">{displayName}</p>
                <p className="text-[10px] text-slate-600 font-sans mt-0.5 leading-none">Principal</p>
              </div>
            </button>
            {/* Session */}
            <div onClick={(e) => { e.stopPropagation(); setSemesterOpen(false); setBatchOpen(false); }}
              className="flex items-center justify-center gap-1.5 border border-slate-300 hover:bg-slate-100 transition-colors rounded-xl px-3 h-10 bg-slate-50 text-black text-xs font-bold font-sans cursor-pointer shadow-sm">
              <Calendar className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">2025-26 (Even)</span>
            </div>
          </div>
        </div>

        {/* ─── 6 Stat Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { icon: Users, iconBg: 'bg-primary/10', iconColor: 'text-primary', label: 'Total Students', value: totalStudentsVal !== undefined ? Number(totalStudentsVal).toLocaleString() : '0', change: '+6.3%', sub: 'vs Last Semester', positive: true },
            { icon: UserCheck, iconBg: 'bg-success/10', iconColor: 'text-success', label: 'Total Faculty', value: totalFacultyVal !== undefined ? Number(totalFacultyVal).toLocaleString() : '0', change: '+4.1%', sub: 'vs Last Semester', positive: true },
            { icon: Building, iconBg: 'bg-warning/10', iconColor: 'text-warning', label: 'Departments', value: totalDeptsVal !== undefined ? Number(totalDeptsVal).toLocaleString() : '0', change: '—', sub: 'No Change', positive: null },
            { icon: BookOpen, iconBg: 'bg-secondary/10', iconColor: 'text-secondary', label: 'Programs', value: totalProgramsVal !== undefined ? Number(totalProgramsVal).toLocaleString() : '28', change: '+2', sub: 'vs Last Semester', positive: true },
            { icon: ClipboardCheck, iconBg: 'bg-info/10', iconColor: 'text-info', label: 'Placement Rate', value: `${placementRateVal}%`, change: '+5.8%', sub: 'vs Last Batch', positive: true },
            { icon: IndianRupee, iconBg: 'bg-destructive/10', iconColor: 'text-destructive', label: 'Research Funding', value: `₹${researchFundingVal}Cr`, change: '+12.4%', sub: 'vs Last Year', positive: true },
          ].map((card) => (
            <StatCard key={card.label} {...card} onClick={() => handleStatClick(card.label)} />
          ))}
        </div>

        {/* ─── Middle Row ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Bar Chart — Academic Performance */}
          <div className="lg:col-span-5 widget-card flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title !mb-0 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" /> Academic Performance
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-border overflow-hidden text-[10px] font-bold">
                  <button onClick={() => setChartView('result')}
                    className={`px-2 py-1 transition-colors ${chartView === 'result' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/40'}`}>
                    Result
                  </button>
                  <button onClick={() => setChartView('attendance')}
                    className={`px-2 py-1 transition-colors ${chartView === 'attendance' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/40'}`}>
                    Attendance
                  </button>
                </div>
                <Dropdown
                  label={selectedSemester}
                  options={semesterOptions}
                  open={semesterOpen}
                  onToggle={(e) => { e.stopPropagation(); setSemesterOpen(!semesterOpen); setBatchOpen(false); setProgramOpen(false); }}
                  onSelect={(v) => { setSelectedSemester(v); setSemesterOpen(false); }}
                />
              </div>
            </div>
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={academicData} margin={{ top: 20, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(0,0%,92%)" />
                  <XAxis dataKey="dept" axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(0,10%,45%)', fontFamily: 'Inter' }} dy={8} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(0,10%,45%)', fontFamily: 'Inter' }}
                    tickFormatter={(v) => `${v}%`} domain={[60, 100]} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(210,20%,96%)' }} />
                  <Bar dataKey={chartView} fill={chartView === 'result' ? 'hsl(0,83%,26%)' : 'hsl(181,99%,28%)'}
                    radius={[5, 5, 0, 0]} barSize={28} name={chartView === 'result' ? 'Result %' : 'Attendance %'}>
                    <LabelList dataKey={chartView} position="top" fontSize={10} fontWeight={700}
                      fill={chartView === 'result' ? 'hsl(0,83%,26%)' : 'hsl(181,99%,28%)'}
                      formatter={(v: number) => `${v}%`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2 font-sans">
              <div className={`w-3 h-3 rounded ${chartView === 'result' ? 'bg-primary' : 'bg-secondary'}`} />
              <span className="text-xs text-muted-foreground font-medium">
                {chartView === 'result' ? 'Average Pass Result (%)' : 'Average Attendance (%)'}
              </span>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="lg:col-span-3 widget-card flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title !mb-0 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-primary" /> Pending Approvals
              </h2>
              <span className="text-xs font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                {dynamicApprovals.reduce((s, a) => s + a.count, 0)} Total
              </span>
            </div>
            <div className="flex-1 space-y-0.5 font-sans">
              {dynamicApprovals.map((a) => (
                <div key={a.label} onClick={() => handleApprovalClick(a)}
                  className="flex items-center justify-between group cursor-pointer rounded-xl px-3 py-2.5 hover:bg-muted/40 transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${a.accent.split(' ')[1]}`}>
                      <a.icon className={`w-3.5 h-3.5 ${a.accent.split(' ')[0]}`} />
                    </div>
                    <span className="text-[13px] font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                      {a.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full min-w-[24px] text-center ${a.accent}`}>
                      {a.count}
                    </span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleViewAllApprovals}
              className="mt-3 w-full py-2 text-xs font-bold text-secondary hover:text-secondary/80 flex items-center gap-1 justify-center transition-colors font-sans border border-border rounded-lg hover:bg-muted/20">
              View All Approvals <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {/* Important Alerts */}
          <div className="lg:col-span-4 widget-card flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title !mb-0 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" /> Important Alerts
              </h2>
              <div className="flex gap-1">
                <span className="text-[10px] font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                  {alerts.filter(a => a.urgent).length} Urgent
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-0.5 font-sans">
              {alerts.map((a) => (
                <div key={a.text} onClick={() => handleAlertClick(a)}
                  className="flex items-center justify-between group cursor-pointer rounded-xl px-3 py-2.5 hover:bg-muted/40 transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${a.urgent ? 'text-destructive' : 'text-warning'} group-hover:scale-110 transition-transform`} />
                    <span className="text-[13px] font-semibold text-foreground/80 truncate group-hover:text-foreground transition-colors">
                      {a.text}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium shrink-0 ml-3 whitespace-nowrap">
                    {a.date}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={handleViewAllAlerts}
              className="mt-3 w-full py-2 text-xs font-bold text-secondary hover:text-secondary/80 flex items-center gap-1 justify-center transition-colors font-sans border border-border rounded-lg hover:bg-muted/20">
              View All Alerts <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ─── Bottom Row ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Pie Chart — Student Strength */}
          <div className="lg:col-span-4 widget-card flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title !mb-0 flex items-center gap-2">
                <GaugeCircle className="w-4 h-4 text-primary" /> Student Strength
              </h2>
              <Dropdown
                label={selectedProgram}
                options={programOptions}
                open={programOpen}
                onToggle={(e) => { e.stopPropagation(); setProgramOpen(!programOpen); setSemesterOpen(false); setBatchOpen(false); }}
                onSelect={(v) => { setSelectedProgram(v); setProgramOpen(false); }}
              />
            </div>
            <div className="flex items-center gap-4 flex-1">
              <div className="w-[150px] h-[150px] relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={strengthData.filter((d: any) => d.value > 0)} cx="50%" cy="50%"
                      innerRadius={46} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                      {strengthData.filter((d: any) => d.value > 0).map((d: any, i: number) => (
                        <Cell key={`c-${i}`} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold text-foreground font-sans">{totalStudentsVal.toLocaleString()}</span>
                  <span className="text-[10px] text-muted-foreground font-sans font-semibold">Total</span>
                </div>
              </div>
              <div className="flex-1 space-y-2 font-sans">
                {strengthData.map((d: any) => (
                  d.value > 0 && (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0"
                          ref={(el) => { if (el) el.style.backgroundColor = d.color; }} />
                        <span className="font-semibold text-foreground/70">{d.name}</span>
                      </span>
                      <span className="font-bold text-foreground">
                        {d.value} <span className="font-medium text-muted-foreground">({d.pct})</span>
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Line Chart — Placement */}
          <div className="lg:col-span-4 widget-card flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="section-title !mb-0 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Placement Overview
              </h2>
              <Dropdown
                label={selectedBatch}
                options={batchOptions}
                open={batchOpen}
                onToggle={(e) => { e.stopPropagation(); setBatchOpen(!batchOpen); setSemesterOpen(false); setProgramOpen(false); }}
                onSelect={(v) => { setSelectedBatch(v); setBatchOpen(false); }}
              />
            </div>
            <div className="flex-1 min-h-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={placementData} margin={{ top: 20, right: 16, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="placementGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(181,99%,28%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(181,99%,28%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(0,0%,92%)" />
                  <XAxis dataKey="m" axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: 'hsl(0,10%,45%)', fontFamily: 'Inter' }} dy={8} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: 'hsl(0,10%,45%)', fontFamily: 'Inter' }}
                    tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="v" stroke="hsl(181,99%,28%)" strokeWidth={2.5}
                    fill="url(#placementGrad)" name="Placement %" dot={{ fill: 'hsl(181,99%,28%)', r: 3, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 5, strokeWidth: 0, fill: 'hsl(181,99%,28%)' }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="absolute top-2 right-2 bg-secondary text-white text-[10px] font-black px-2 py-0.5 rounded-md font-sans">
                {placementRateVal}%
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2 font-sans">
              <div className="w-5 h-0.5 bg-secondary rounded relative flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary absolute border border-white" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Cumulative Placement Rate (%)</span>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-4 widget-card flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title !mb-0 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Recent Activities
              </h2>
              <button
                aria-label="Refresh activity feed"
                title="Refresh activity feed"
                onClick={() => { toast({ title: 'Refreshed', description: 'Activity feed is up to date.' }); }}
                className="p-1.5 rounded-lg hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 space-y-0.5 font-sans">
              {(liveActivities.length > 0 ? liveActivities : recentActivities).map((a, i) => (
                <div key={i} onClick={() => handleActivityClick(a)}
                  className="flex items-center gap-3 group cursor-pointer py-2 px-2 -mx-2 rounded-xl hover:bg-muted/40 transition-colors">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${a.color.split(' ')[1]}`}>
                    {typeof a.icon === 'string' ? <Megaphone className={`w-3.5 h-3.5 ${a.color.split(' ')[0]}`} /> : <a.icon className={`w-3.5 h-3.5 ${a.color.split(' ')[0]}`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] font-semibold text-foreground/80 group-hover:text-foreground transition-colors leading-tight line-clamp-1">
                      {a.text}
                    </span>
                    <p className="text-[10px] text-muted-foreground">{a.time}</p>
                  </div>
                  <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              ))}
            </div>
            <button onClick={handleViewAllActivities}
              className="mt-3 w-full py-2 text-xs font-bold text-secondary hover:text-secondary/80 flex items-center gap-1 justify-center transition-colors font-sans border border-border rounded-lg hover:bg-muted/20">
              View All Activities <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ─── Radar Chart Row ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 widget-card flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title !mb-0 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Institution Performance Radar
              </h2>
              <button onClick={() => toast({ title: 'Performance Index', description: 'Overall Institution Performance Score: 83.7 / 100' })}
                className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary hover:text-white transition-colors">
                Score: 83.7
              </button>
            </div>
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(0,0%,88%)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(0,10%,40%)', fontFamily: 'Inter', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="A" stroke="hsl(0,83%,26%)" fill="hsl(0,83%,26%)" fillOpacity={0.12} strokeWidth={2} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-7 widget-card flex flex-col">
            <h2 className="section-title flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
              {quickActions.map((a) => (
                <button key={a.label} onClick={() => handleQuickAction(a.type)}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 border border-border transition-all duration-200 font-sans hover:shadow-md active:scale-[0.97] group ${a.bg}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${a.bg.includes('hover:bg-') ? '' : 'bg-muted/20'}`}>
                    <a.icon className={`w-5 h-5 ${a.color} group-hover:text-inherit transition-colors`} />
                  </div>
                  <span className={`text-[12px] font-bold text-foreground group-hover:text-inherit transition-colors`}>{a.label}</span>
                </button>
              ))}
            </div>

            {/* KPI Summary Strip */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: 'Avg Attendance', value: '86.4%', icon: Users, positive: true },
                { label: 'Pass Rate', value: '81.7%', icon: GraduationCap, positive: true },
                { label: 'Open Tickets', value: '29', icon: AlertCircle, positive: false },
              ].map((kpi) => (
                <button key={kpi.label}
                  onClick={() => toast({ title: kpi.label, description: `Current value: ${kpi.value}. Click View Analytics for detailed breakdown.` })}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border transition-colors text-left">
                  <kpi.icon className={`w-4 h-4 shrink-0 ${kpi.positive ? 'text-success' : 'text-warning'}`} />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium leading-tight">{kpi.label}</p>
                    <p className="text-sm font-bold text-foreground">{kpi.value}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ══════ Generic Detail Modal ══════ */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> {modalTitle}
            </DialogTitle>
            <DialogDescription className="sr-only">Details for {modalTitle}</DialogDescription>
          </DialogHeader>
          <div className="mt-2 max-h-[70vh] overflow-y-auto pr-1">{modalBody}</div>
        </DialogContent>
      </Dialog>

      {/* ══════ Analytics Modal ══════ */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" /> Full Analytics Overview
            </DialogTitle>
            <DialogDescription className="sr-only">Detailed analytics</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Overall Pass Rate', value: '81.7%', change: '+3.2%', icon: TrendingUp, color: 'text-success' },
                { label: 'Avg Attendance', value: '86.4%', change: '+1.8%', icon: TrendingUp, color: 'text-success' },
                { label: 'Placement Rate', value: '87.6%', change: '+5.8%', icon: TrendingUp, color: 'text-success' },
                { label: 'Faculty Retention', value: '94.2%', change: '-0.3%', icon: TrendingDown, color: 'text-destructive' },
              ].map((m) => (
                <div key={m.label} className="p-3 rounded-xl border border-border bg-muted/20 flex items-center gap-3">
                  <m.icon className={`w-5 h-5 ${m.color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{m.label}</p>
                    <p className="text-lg font-bold text-foreground">{m.value} <span className={`text-xs font-bold ${m.color}`}>{m.change}</span></p>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-[180px]">
              <p className="text-xs font-bold text-muted-foreground mb-2">Dept-wise Academic Performance (Current Semester)</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={academicData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(0,0%,92%)" />
                  <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(0,10%,45%)', fontFamily: 'Inter' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(0,10%,45%)', fontFamily: 'Inter' }} tickFormatter={(v) => `${v}%`} domain={[60, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="result" fill="hsl(0,83%,26%)" radius={[4, 4, 0, 0]} barSize={24} name="Result %">
                    <LabelList dataKey="result" position="top" fontSize={9} fontWeight={700} fill="hsl(0,83%,26%)" formatter={(v: number) => `${v}%`} />
                  </Bar>
                  <Bar dataKey="attendance" fill="hsl(181,99%,28%)" radius={[4, 4, 0, 0]} barSize={24} name="Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <button onClick={() => { setAnalyticsOpen(false); navigate('/admin/executive/academic-performance'); }}
              className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
              Open Full Analytics Dashboard →
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══════ Profile Modal ══════ */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>My Profile</DialogTitle>
            <DialogDescription className="sr-only">Principal profile details</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4 font-sans">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{displayName}</p>
              <p className="text-sm text-muted-foreground">Principal & Chief Executive</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email || 'principal@nscet.org'}</p>
            </div>
            <div className="w-full space-y-0">
              {[
                { label: 'Role', value: 'Principal (Executive Admin)' },
                { label: 'Department', value: 'Administration' },
                { label: 'Phone', value: '+91 98765 43210' },
                { label: 'Session', value: '2025-26 (Even)' },
                { label: 'Status', value: 'Active', highlight: true },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-2.5 border-b border-border/50 last:border-0 text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={`font-semibold ${row.highlight ? 'text-success' : 'text-foreground'}`}>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="w-full flex gap-2">
              <button onClick={() => { toast({ title: 'Edit Profile', description: 'Profile editing feature coming soon.' }); }}
                className="flex-1 py-2.5 rounded-lg bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-colors">
                Edit Profile
              </button>
              <button onClick={() => { setProfileOpen(false); logout(); navigate('/login'); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-destructive/10 text-destructive font-bold text-sm hover:bg-destructive hover:text-white transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

/* ══════════════════════════════════════════════
   HELPER COMPONENTS
   ══════════════════════════════════════════════ */

function StatCard({
  icon: Icon, iconBg, iconColor, label, value, change, sub, positive, onClick,
}: {
  icon: React.ElementType; iconBg: string; iconColor: string;
  label: string; value: string; change: string; sub: string;
  positive: boolean | null; onClick?: () => void;
}) {
  return (
    <div onClick={onClick}
      className="widget-card p-4 flex flex-col justify-between cursor-pointer hover:ring-2 hover:ring-primary/20 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97] transition-all duration-200 group h-full min-h-[120px]">
      <div className="flex justify-between items-start mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {positive !== null ? (
          <span className={`text-[10px] font-bold ${positive ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'} px-1.5 py-0.5 rounded flex items-center gap-0.5`}>
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded">{change}</span>
        )}
      </div>
      <div>
        <p className="text-xl font-bold text-foreground leading-none">{value}</p>
        <p className="text-[11px] font-semibold text-muted-foreground mt-1.5 leading-snug">{label}</p>
      </div>
    </div>
  );
}

function Dropdown({
  label, options, open, onToggle, onSelect,
}: {
  label: string; options: string[]; open: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="relative">
      <button onClick={onToggle}
        className="flex items-center gap-1 px-2.5 py-1.5 bg-card border border-border rounded-lg text-[11px] font-medium text-foreground cursor-pointer hover:bg-muted/40 transition-colors font-sans shrink-0">
        <span className="max-w-[100px] truncate">{label}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl z-50 min-w-[160px] py-1 overflow-hidden">
          {options.map((opt) => (
            <button key={opt} onClick={(e) => { e.stopPropagation(); onSelect(opt); }}
              className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-muted/40 transition-colors ${opt === label ? 'text-primary font-bold bg-primary/5' : 'text-foreground'}`}>
              {opt === label && '✓ '}{opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
