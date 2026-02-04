import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminLayout } from '@/pages/admin/components/layout/AdminLayout';
import { cn } from '@/pages/admin/executive/lib/utils';
import { StatsCard } from '@/pages/admin/executive/components/dashboard/StatsCard';
import { dashboardStats, mockStudents, mockFaculty } from '@/data/mockData';
import {
  Users,
  GraduationCap,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
  Users2,
  Home,
  Bus,
  MapPin,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/pages/admin/executive/components/ui/card';
import { Badge } from '@/pages/admin/executive/components/ui/badge';
import { Button } from '@/pages/admin/executive/components/ui/button';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/pages/admin/executive/components/ui/dialog';

// Mock Quota Data
const quotaData = [
  { name: 'Management', value: 450, color: '#6366f1' },
  { name: 'Government', value: 820, color: '#10b981' },
  { name: '7.5 Scheme', value: 120, color: '#f59e0b' },
  { name: 'SC/ST Scholarship', value: 210, color: '#ef4444' },
];

const residencyData = [
  { name: 'Day-Scholar', value: 950, color: '#8b5cf6' },
  { name: 'Hostel', value: 650, color: '#ec4899' },
];

const departmentFacultyData = [
  { name: 'CSE', faculty: 45, support: 12, total: 57, male: 30, female: 27 },
  { name: 'Mechanical Engineering', faculty: 35, support: 10, total: 45, male: 40, female: 5 },
  { name: 'ECE', faculty: 40, support: 11, total: 51, male: 22, female: 29 },
  { name: 'EEE', faculty: 32, support: 9, total: 41, male: 18, female: 23 },
  { name: 'IT', faculty: 38, support: 8, total: 46, male: 20, female: 26 },
  { name: 'AI & DS', faculty: 30, support: 6, total: 36, male: 15, female: 21 },
  { name: 'Civil', faculty: 28, support: 8, total: 36, male: 24, female: 12 },
];

const facultyGenderData = [
  { name: 'Male', value: 145, color: '#3b82f6' },
  { name: 'Female', value: 138, color: '#ec4899' },
  { name: 'Others', value: 7, color: '#94a3b8' },
];

const yearlyStudentData = [
  { year: '1st Year', CSE: 150, Mechanical: 120, ECE: 130, EEE: 100, IT: 110, AIDS: 90, Civil: 80 },
  { year: '2nd Year', CSE: 140, Mechanical: 115, ECE: 125, EEE: 95, IT: 105, AIDS: 85, Civil: 75 },
  { year: '3rd Year', CSE: 135, Mechanical: 110, ECE: 120, EEE: 90, IT: 100, AIDS: 0, Civil: 70 },
  { year: '4th Year', CSE: 130, Mechanical: 105, ECE: 115, EEE: 85, IT: 95, AIDS: 0, Civil: 65 },
];

export default function ExecutiveAdminDashboard() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeAnalysisView, setActiveAnalysisView] = useState<'faculty' | 'student'>('student');
  const [selectedDeptForGender, setSelectedDeptForGender] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    if (!selectedCategory) return [];
    // Just mock filtered results based on category name
    return mockStudents.slice(0, 10).map(s => ({
      ...s,
      category: selectedCategory
    }));
  }, [selectedCategory]);

  const recentStudents = mockStudents.slice(0, 4);
  const recentFaculty = mockFaculty.slice(0, 4);

  const activeGenderData = useMemo(() => {
    if (!selectedDeptForGender) return facultyGenderData;
    const dept = departmentFacultyData.find(d => d.name === selectedDeptForGender);
    if (!dept) return facultyGenderData;
    return [
      { name: 'Male', value: dept.male, color: '#3b82f6' },
      { name: 'Female', value: dept.female, color: '#ec4899' },
      { name: 'Others', value: (dept.total - dept.male - dept.female), color: '#94a3b8' },
    ];
  }, [selectedDeptForGender]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-border/10 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Welcome back, Dr. Executive</h1>
            <p className="text-muted-foreground">Institutional overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </header>

        {/* Top Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Students"
            value={dashboardStats.totalStudents}
            icon={<GraduationCap className="h-6 w-6 text-primary" />}
            change="+12 this month"
            changeType="positive"
          />
          <StatsCard
            title="Teaching Faculty"
            value={68}
            icon={<Users className="h-6 w-6 text-secondary" />}
            change="Active"
            changeType="positive"
          />
          <StatsCard
            title="Non-Teaching"
            value={17}
            icon={<Users className="h-6 w-6 text-indigo-500" />}
            change="Support Staff"
          />
          <StatsCard
            title="Attendance Rate"
            value={`${dashboardStats.attendanceRate}%`}
            icon={<TrendingUp className="h-6 w-6 text-success" />}
            change="Overall"
          />
        </div>

        {/* Quota & residency Stats Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quota Distribution */}
          <Card className="border-border shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                Admission Quota & Scholarships
              </CardTitle>
              <PieChartIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={quotaData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {quotaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer outline-none" />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {quotaData.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="flex flex-col items-start h-auto p-3 border border-border/50 hover:bg-slate-50 transition-all text-left"
                    onClick={() => setSelectedCategory(item.name)}
                  >
                    <span className="text-xs text-muted-foreground font-semibold uppercase">{item.name}</span>
                    <span className="text-xl font-bold" style={{ color: item.color }}>{item.value}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Residency Distribution */}
          <Card className="border-border shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-pink-500" />
                Residency (Day-Scholar vs Hostel)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={residencyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {residencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-6">
                <Button
                  className="flex-1 bg-violet-100 hover:bg-violet-200 text-violet-700 h-auto p-4 flex flex-col items-center gap-1"
                  onClick={() => setSelectedCategory('Day-Scholar')}
                >
                  <Bus className="w-5 h-5 mb-1" />
                  <span className="font-bold">950</span>
                  <span className="text-[10px] uppercase font-bold opacity-80">Day-Scholars</span>
                </Button>
                <Button
                  className="flex-1 bg-pink-100 hover:bg-pink-200 text-pink-700 h-auto p-4 flex flex-col items-center gap-1"
                  onClick={() => setSelectedCategory('Hostel')}
                >
                  <Home className="w-5 h-5 mb-1" />
                  <span className="font-bold">650</span>
                  <span className="text-[10px] uppercase font-bold opacity-80">Hostellers</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Category Filter & Analysis Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50">
            <div>
              <h2 className="text-xl font-bold font-serif">Institution Analytics</h2>
              <p className="text-xs text-muted-foreground">Select category to view detailed department & academic trends</p>
            </div>
            <div className="flex bg-white/50 p-1 rounded-xl border border-border shadow-sm w-fit">
              <Button
                variant={activeAnalysisView === 'student' ? 'default' : 'ghost'}
                size="sm"
                className={cn("rounded-lg px-6 transition-all", activeAnalysisView === 'student' ? "shadow-md" : "")}
                onClick={() => setActiveAnalysisView('student')}
              >
                Student Data
              </Button>
              <Button
                variant={activeAnalysisView === 'faculty' ? 'default' : 'ghost'}
                size="sm"
                className={cn("rounded-lg px-6 transition-all", activeAnalysisView === 'faculty' ? "shadow-md" : "")}
                onClick={() => setActiveAnalysisView('faculty')}
              >
                Faculty & Staff
              </Button>
            </div>
          </div>

          <Card className="border-border shadow-md overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {activeAnalysisView === 'student' ? (
                    <><GraduationCap className="w-5 h-5 text-primary" /> Yearly Enrollment by Department</>
                  ) : (
                    <><Users className="w-5 h-5 text-secondary" /> Faculty Strength per Department</>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">Departmental Breakdown</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="min-h-[400px] w-full bg-card/10 rounded-xl overflow-hidden relative">
                {activeAnalysisView === 'student' ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={yearlyStudentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="CSE" name="CSE" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Mechanical" name="Mechanical Engineering" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ECE" name="ECE" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="EEE" name="EEE" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="IT" name="B.Tech IT" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="AIDS" name="AI & DS" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Civil" name="Civil" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col lg:flex-row gap-8 w-full" style={{ height: '400px' }}>
                    <div className="flex-1 min-w-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={departmentFacultyData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}
                          />
                          <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                          <Bar
                            dataKey="faculty"
                            name="Teaching Faculty"
                            fill="#8b5cf6"
                            radius={[4, 4, 0, 0]}
                            onClick={(data) => { if (data && data.name) setSelectedDeptForGender(data.name); }}
                            style={{ cursor: 'pointer' }}
                          />
                          <Bar
                            dataKey="support"
                            name="Support Staff"
                            fill="#ec4899"
                            radius={[4, 4, 0, 0]}
                            onClick={(data) => { if (data && data.name) setSelectedDeptForGender(data.name); }}
                            style={{ cursor: 'pointer' }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                      <p className="text-[10px] text-center text-muted-foreground mt-2 italic">Tip: Click on a department bar to see specific gender distribution</p>
                    </div>

                    <div className="w-full lg:w-[320px] flex flex-col items-center justify-center border-l border-border/50 pl-8 relative">
                      {selectedDeptForGender && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-0 right-0 text-[10px] h-7 px-2"
                          onClick={() => setSelectedDeptForGender(null)}
                        >
                          Reset
                        </Button>
                      )}
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 text-center">
                        {selectedDeptForGender ? `${selectedDeptForGender}` : 'Institutional Total'}
                      </h3>
                      <p className="text-[10px] font-bold text-primary mb-4 uppercase tracking-tighter text-center">Gender Ratio</p>

                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={activeGenderData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={75}
                              paddingAngle={5}
                              dataKey="value"
                              animationDuration={800}
                            >
                              {activeGenderData.map((entry, index) => (
                                <Cell key={`cell-${index}-${entry.name}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }} />
                            <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 flex flex-col gap-1.5 w-full bg-slate-50 p-3 rounded-lg border border-border/30">
                        {activeGenderData.map(gender => (
                          <div key={gender.name} className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: gender.color }} />
                              {gender.name} Staff
                            </span>
                            <span className="font-bold">{gender.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Graphical Totals Display */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
                {activeAnalysisView === 'student' ? (
                  ['CSE', 'Mechanical', 'ECE', 'EEE', 'IT', 'AIDS', 'Civil'].map((dept) => (
                    <div key={dept} className="bg-slate-50 p-4 rounded-xl border border-border/50 text-center animate-in fade-in zoom-in duration-500">
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{dept} Students</p>
                      <p className="text-2xl font-black text-foreground">
                        {yearlyStudentData.reduce((acc, curr) => acc + (curr[dept as keyof typeof curr] as number), 0)}
                      </p>
                    </div>
                  ))
                ) : (
                  departmentFacultyData.map((dept) => (
                    <div key={dept.name} className="bg-slate-50 p-4 rounded-xl border border-border/50 text-center animate-in fade-in zoom-in duration-500">
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{dept.name} Total</p>
                      <p className="text-2xl font-black text-foreground">{dept.total}</p>
                      <p className="text-[9px] text-muted-foreground mt-1">{dept.faculty} Teaching | {dept.support} Staff</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview (Existing logic enhanced) */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Graduation Success Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-foreground">{dashboardStats.graduationRate}%</div>
              <div className="mt-4 h-3 rounded-full bg-muted/50 overflow-hidden border border-border/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dashboardStats.graduationRate}%` }}
                  className="h-3 rounded-full bg-success lg:bg-gradient-to-r lg:from-success lg:to-emerald-400"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">+3.2% increase from previous batch</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Daily Attendance
              </CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-foreground">{dashboardStats.attendanceRate}%</div>
              <div className="mt-4 h-3 rounded-full bg-muted/50 overflow-hidden border border-border/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dashboardStats.attendanceRate}%` }}
                  className="h-3 rounded-full bg-secondary lg:bg-gradient-to-r lg:from-secondary lg:to-blue-400"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">Monitoring 1,600 active students today</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Updates */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2 underline underline-offset-4 decoration-primary">
                  <Users2 className="w-5 h-5 text-primary" />
                  Newly Enrolled Students
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/admin/executive/students')}>View All</Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {recentStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border cursor-pointer group"
                    onClick={() => navigate(`/admin/executive/students/${student.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-black shadow-sm">
                        {student.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-foreground leading-tight">{student.name}</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{student.department}</p>
                      </div>
                    </div>
                    <Badge
                      variant={student.status === 'active' ? 'default' : 'secondary'}
                      className={cn("rounded-md px-3", student.status === 'active' ? 'bg-success hover:bg-success' : '')}
                    >
                      {student.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2 underline underline-offset-4 decoration-secondary">
                  <Award className="w-5 h-5 text-secondary" />
                  Key Faculty Updates
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/admin/executive/faculty')}>Profiles</Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {recentFaculty.map((faculty) => (
                  <div
                    key={faculty.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border cursor-pointer group"
                    onClick={() => navigate(`/admin/executive/faculty/${faculty.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary font-black shadow-sm">
                        {faculty.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-foreground leading-tight">{faculty.name}</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{faculty.designation}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold bg-muted px-2 py-1 rounded text-muted-foreground border border-border/50">
                      {faculty.department}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Drill-down Student List Modal */}
      <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
        <DialogContent className="max-w-3xl bg-card overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl font-serif">
              Students - {selectedCategory}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50 hover:bg-muted/40 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-primary font-bold">
                      {student.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.department} | Batch {student.enrollmentYear}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-primary hover:bg-primary/10"
                    onClick={() => navigate(`/admin/executive/students/${student.id}`)}
                  >
                    View Profile <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setSelectedCategory(null)}>Close View</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
