import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/pages/admin/executive/components/layout/AdminLayout';
import { apiFetch } from '@/lib/apiFetch';
import { 
  FileText, Activity, AlertTriangle, ShieldCheck, Clock, Download, 
  Search, Filter, SlidersHorizontal, User, RefreshCw, Settings, UserCheck, CalendarDays, BarChart2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function AuditAndReports() {
  const [activeTab, setActiveTab] = useState('audit-logs');
  const [stats, setStats] = useState({
    totalLogs: 18742,
    criticalActivities: 356,
    reportsGenerated: 128,
    pendingReviews: 23,
    complianceScore: 92.6,
    severityStats: { Critical: 356, High: 1842, Medium: 6521, Low: 10023 },
    moduleStats: [
      { name: 'Student Management', value: 5750 },
      { name: 'Examinations', value: 4151 },
      { name: 'Academic Management', value: 3301 },
      { name: 'User Management', value: 2204 },
      { name: 'System Settings', value: 1182 },
      { name: 'Others', value: 2154 }
    ]
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const [filterModule, setFilterModule] = useState('All Modules');
  const [filterAction, setFilterAction] = useState('All Actions');
  const [filterUser, setFilterUser] = useState('All Users');
  const [filterDepartment, setFilterDepartment] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAuditData = async (filters: any) => {
    // Mock data fallback
    const mockLogs = [
      { id: 1, timestamp: new Date('2025-05-12T11:25:00'), user_name: 'Dr. R. Principal', role: 'Principal', module: 'User Management', action: 'User Login', details: 'User logged in successfully', ip_address: '192.168.1.10', severity: 'Low' },
      { id: 2, timestamp: new Date('2025-05-12T11:15:00'), user_name: 'Ms. A. Sharma', role: 'Admin', module: 'Student Management', action: 'Update Student', details: 'Updated student profile (ID: STU1234)', ip_address: '192.168.1.15', severity: 'Medium' },
      { id: 3, timestamp: new Date('2025-05-12T10:58:00'), user_name: 'Mr. V. Kumar', role: 'Faculty', module: 'Examinations', action: 'Publish Results', details: 'Published results for B.Tech Sem IV', ip_address: '192.168.1.22', severity: 'High' },
      { id: 4, timestamp: new Date('2025-05-12T10:40:00'), user_name: 'Ms. P. Singh', role: 'Admin', module: 'Academic Management', action: 'Add Course', details: 'Added new course (CS502)', ip_address: '192.168.1.17', severity: 'Low' },
      { id: 5, timestamp: new Date('2025-05-12T10:30:00'), user_name: 'Dr. R. Principal', role: 'Principal', module: 'Reports', action: 'Generate Report', details: 'Generated Student Performance Report', ip_address: '192.168.1.10', severity: 'Low' },
      { id: 6, timestamp: new Date('2025-05-12T10:22:00'), user_name: 'Mr. S. Verma', role: 'Faculty', module: 'Examinations', action: 'Update Marks', details: 'Updated marks for Exam ID: EXM458', ip_address: '192.168.1.25', severity: 'Medium' },
      { id: 7, timestamp: new Date('2025-05-12T10:10:00'), user_name: 'Ms. N. Patel', role: 'Admin', module: 'User Management', action: 'Reset Password', details: 'Password reset for user ID: U2356', ip_address: '192.168.1.18', severity: 'High' },
      { id: 8, timestamp: new Date('2025-05-12T09:58:00'), user_name: 'Mr. R. Kapoor', role: 'HOD', module: 'Academic Management', action: 'Approve Course', details: 'Approved course CS401', ip_address: '192.168.1.21', severity: 'Low' },
    ];

    try {
      const token = localStorage.getItem('authToken');
      
      const queryParams = new URLSearchParams();
      if (filters.module && filters.module !== 'All Modules') queryParams.append('module', filters.module);
      if (filters.action && filters.action !== 'All Actions') queryParams.append('action', filters.action);
      if (filters.user_name && filters.user_name !== 'All Users') queryParams.append('user_name', filters.user_name);
      if (filters.search) queryParams.append('search', filters.search);
      
      const qs = queryParams.toString();
      const statsUrl = `/api/v1/executive/audit/stats${qs ? `?${qs}` : ''}`;
      const logsUrl = `/api/v1/executive/audit/logs?limit=8${qs ? `&${qs}` : ''}`;

      const [statsRes, logsRes] = await Promise.all([
        apiFetch(statsUrl, { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch(logsUrl, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const statsData = await statsRes.json();
      const logsData = await logsRes.json();

      let useMockStats = true;
      let useMockLogs = true;

      if (statsData.success && statsData.data) {
        // If the DB has actual audit logs, use them
        if (statsData.data.totalLogs > 0) {
          useMockStats = false;
          setStats(prev => ({
            ...prev,
            totalLogs: statsData.data.totalLogs,
            criticalActivities: statsData.data.criticalActivities,
            severityStats: {
              ...prev.severityStats,
              ...statsData.data.severityStats
            },
            moduleStats: statsData.data.moduleStats?.length ? statsData.data.moduleStats : prev.moduleStats
          }));
        }
      }

      if (logsData.success && logsData.data && logsData.data.length > 0) {
        useMockLogs = false;
        setRecentLogs(logsData.data);
      }

      if (useMockLogs) {
        // Simple client-side mock filtering for demonstration if API fails/empty
        let filteredMock = [...mockLogs];
        if (filters.module && filters.module !== 'All Modules') filteredMock = filteredMock.filter(l => l.module === filters.module);
        if (filters.action && filters.action !== 'All Actions') filteredMock = filteredMock.filter(l => l.action === filters.action);
        if (filters.user_name && filters.user_name !== 'All Users') filteredMock = filteredMock.filter(l => l.user_name === filters.user_name);
        if (filters.search) filteredMock = filteredMock.filter(l => l.details.toLowerCase().includes(filters.search.toLowerCase()) || l.action.toLowerCase().includes(filters.search.toLowerCase()) || l.user_name.toLowerCase().includes(filters.search.toLowerCase()));
        setRecentLogs(filteredMock);
      }
    } catch (err) {
      console.error('API failed, falling back to mock data', err);
      setRecentLogs(mockLogs);
    }
  };

  useEffect(() => {
    fetchAuditData({ module: 'All Modules', action: 'All Actions', user_name: 'All Users', search: '' });
  }, []);

  const handleFilter = () => {
    fetchAuditData({ module: filterModule, action: filterAction, user_name: filterUser, search: searchQuery });
  };

  const handleReset = () => {
    setFilterModule('All Modules');
    setFilterAction('All Actions');
    setFilterUser('All Users');
    setFilterDepartment('All Departments');
    setSearchQuery('');
    fetchAuditData({ module: 'All Modules', action: 'All Actions', user_name: 'All Users', search: '' });
  };

  const COLORS = [
    { hex: '#3B82F6', tw: 'bg-blue-500' }, 
    { hex: '#8B5CF6', tw: 'bg-purple-500' }, 
    { hex: '#F59E0B', tw: 'bg-amber-500' }, 
    { hex: '#EF4444', tw: 'bg-red-500' }, 
    { hex: '#10B981', tw: 'bg-emerald-500' }, 
    { hex: '#6B7280', tw: 'bg-gray-500' }
  ];
  const SEVERITY_COLORS = {
    Low: '#10B981',
    Medium: '#F59E0B',
    High: '#EF4444',
    Critical: '#991B1B'
  };

  const trendData = [
    { name: '06 May', value: 1200 },
    { name: '07 May', value: 2500 },
    { name: '08 May', value: 3800 },
    { name: '09 May', value: 2400 },
    { name: '10 May', value: 3700 },
    { name: '11 May', value: 2800 },
    { name: '12 May', value: 1300 }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-2 shadow-sm rounded-md text-xs">
          <p className="font-bold">{label}</p>
          <p className="text-gray-700 font-medium">{`${payload[0].name} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit & Reports</h1>
          <p className="text-muted-foreground">Monitor system activities, audits and view comprehensive audit reports.</p>
        </div>

        {/* Top Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl bg-card p-5 shadow-sm border border-border flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2 gap-2">
              <p className="text-sm font-semibold text-muted-foreground leading-tight">Total Audit Logs</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.totalLogs.toLocaleString()}</p>
              <p className="mt-1 text-xs font-medium text-success flex items-center"><TrendingUpIcon className="w-3 h-3 mr-1" /> 15.42%</p>
            </div>
          </div>
          
          <div className="rounded-xl bg-card p-5 shadow-sm border border-border flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2 gap-2">
              <p className="text-sm font-semibold text-muted-foreground leading-tight">Critical Activities</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.criticalActivities.toLocaleString()}</p>
              <p className="mt-1 text-xs font-medium text-destructive flex items-center"><TrendingUpIcon className="w-3 h-3 mr-1" /> 8.67%</p>
            </div>
          </div>

          <div className="rounded-xl bg-card p-5 shadow-sm border border-border flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2 gap-2">
              <p className="text-sm font-semibold text-muted-foreground leading-tight">Reports Generated</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 shrink-0">
                <FileText className="w-5 h-5 text-success" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.reportsGenerated}</p>
              <p className="mt-1 text-xs font-medium text-success flex items-center"><TrendingUpIcon className="w-3 h-3 mr-1" /> 12.28%</p>
            </div>
          </div>

          <div className="rounded-xl bg-card p-5 shadow-sm border border-border flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2 gap-2">
              <p className="text-sm font-semibold text-muted-foreground leading-tight">Pending Reviews</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 shrink-0">
                <Clock className="w-5 h-5 text-warning" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.pendingReviews}</p>
              <p className="mt-1 text-xs font-medium text-warning flex items-center"><TrendingDownIcon className="w-3 h-3 mr-1" /> -4</p>
            </div>
          </div>

          <div className="rounded-xl bg-card p-5 shadow-sm border border-border flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2 gap-2">
              <p className="text-sm font-semibold text-muted-foreground leading-tight">Compliance Score</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 shrink-0">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.complianceScore}%</p>
              <p className="mt-1 text-xs font-medium text-success flex items-center"><TrendingUpIcon className="w-3 h-3 mr-1" /> 6.31%</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-white border rounded-xl shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by user, action, module..." 
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
            />
          </div>
          <select 
            title="Filter by Module" 
            className="px-3 py-2 text-sm border rounded-lg text-gray-600 bg-white min-w-[120px]"
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
          >
            <option>All Modules</option>
            <option>User Management</option>
            <option>Student Management</option>
            <option>Examinations</option>
            <option>Academic Management</option>
            <option>System Settings</option>
            <option>Reports</option>
          </select>
          <select 
            title="Filter by Action" 
            className="px-3 py-2 text-sm border rounded-lg text-gray-600 bg-white min-w-[120px]"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option>All Actions</option>
            <option>User Login</option>
            <option>Update Student</option>
            <option>Publish Results</option>
            <option>Add Course</option>
            <option>Generate Report</option>
            <option>Update Marks</option>
            <option>Reset Password</option>
            <option>Approve Course</option>
          </select>
          <select 
            title="Filter by User" 
            className="px-3 py-2 text-sm border rounded-lg text-gray-600 bg-white min-w-[120px]"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
          >
            <option>All Users</option>
            <option>Dr. R. Principal</option>
            <option>Ms. A. Sharma</option>
            <option>Mr. V. Kumar</option>
            <option>Ms. P. Singh</option>
            <option>Mr. S. Verma</option>
            <option>Ms. N. Patel</option>
            <option>Mr. R. Kapoor</option>
          </select>
          <select 
            title="Filter by Department" 
            className="px-3 py-2 text-sm border rounded-lg text-gray-600 bg-white min-w-[120px]"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option>All Departments</option>
            <option>Computer Science</option>
            <option>Information Technology</option>
            <option>Mechanical Engineering</option>
            <option>Civil Engineering</option>
            <option>Electrical Engineering</option>
            <option>Electronics & Comm.</option>
          </select>
          <div className="flex items-center px-3 py-2 border rounded-lg text-sm text-gray-600 bg-white cursor-pointer hover:bg-gray-50">
            01/05/2025 - 12/05/2025
            <CalendarDays className="w-4 h-4 ml-2" />
          </div>
          <button 
            onClick={handleFilter}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-white text-gray-700 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors ml-auto">
            <Download className="w-4 h-4" /> Export Logs
          </button>
        </div>

        {/* Tabs Row */}
        <div className="flex border-b">
          {['Audit Logs', 'Reports', 'Scheduled Reports', 'Report Templates'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.toLowerCase().replace(' ', '-')
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Trend Chart */}
          <div className="col-span-1 border rounded-xl bg-white p-4 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Audit Activity Trend</h3>
              <select title="Time Range" className="text-xs border rounded px-2 py-1 bg-white text-gray-600">
                <option>Last 7 Days</option>
              </select>
            </div>
            <div className="h-[200px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={(val) => val >= 1000 ? `${(val/1000)}k` : val} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Module Pie */}
          <div className="col-span-1 border rounded-xl bg-white p-4 shadow-sm flex flex-col">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Activities by Module</h3>
            <div className="flex-1 flex items-center justify-between">
              <div className="h-[160px] w-[160px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.moduleStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.moduleStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length].hex} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-gray-800">{stats.totalLogs.toLocaleString()}</span>
                  <span className="text-[10px] font-medium text-gray-500">Total</span>
                </div>
              </div>
              <div className="flex-1 ml-4 space-y-2">
                {stats.moduleStats.map((entry, index) => {
                  const colorObj = COLORS[index % COLORS.length];
                  return (
                    <div key={`legend-${index}`} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colorObj.tw}`} />
                      <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Severity Pie */}
          <div className="col-span-1 border rounded-xl bg-white p-4 shadow-sm flex flex-col">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Activities by Severity</h3>
            <div className="flex-1 flex items-center justify-between">
              <div className="h-[160px] w-[160px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[
                      { name: 'Critical', value: stats.severityStats.Critical },
                      { name: 'High', value: stats.severityStats.High },
                      { name: 'Medium', value: stats.severityStats.Medium },
                      { name: 'Low', value: stats.severityStats.Low }
                    ]} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                      <Cell fill={SEVERITY_COLORS.Critical} />
                      <Cell fill={SEVERITY_COLORS.High} />
                      <Cell fill={SEVERITY_COLORS.Medium} />
                      <Cell fill={SEVERITY_COLORS.Low} />
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-gray-800">{stats.totalLogs.toLocaleString()}</span>
                  <span className="text-[10px] font-medium text-gray-500">Total</span>
                </div>
              </div>
              <div className="flex-1 ml-4 space-y-2">
                {[
                  { name: 'Critical', value: stats.severityStats.Critical, twBg: 'bg-red-800' },
                  { name: 'High', value: stats.severityStats.High, twBg: 'bg-red-500' },
                  { name: 'Medium', value: stats.severityStats.Medium, twBg: 'bg-amber-500' },
                  { name: 'Low', value: stats.severityStats.Low, twBg: 'bg-emerald-500' }
                ].map((m, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${m.twBg}`}></div>
                      <span className="text-gray-600">{m.name}</span>
                    </div>
                    <span className="font-medium text-gray-800">{((m.value/stats.totalLogs)*100).toFixed(1)}% <span className="text-gray-400 font-normal ml-1">({m.value.toLocaleString()})</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tables Row 1 */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Recent Audit Logs Table */}
          <div className="col-span-2 border rounded-xl bg-white p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Recent Audit Logs</h3>
              <a href="#" className="text-xs text-blue-600 font-medium hover:underline">View All</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Date & Time</th>
                    <th className="pb-2 font-medium">User</th>
                    <th className="pb-2 font-medium">Role</th>
                    <th className="pb-2 font-medium">Module</th>
                    <th className="pb-2 font-medium">Action</th>
                    <th className="pb-2 font-medium">Details</th>
                    <th className="pb-2 font-medium">IP Address</th>
                    <th className="pb-2 font-medium">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.slice(0, 8).map((log: any, idx: number) => (
                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 text-gray-900 font-medium">{idx + 1}</td>
                      <td className="py-2.5 text-gray-600">{new Date(log.timestamp).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }).replace(',', '')}</td>
                      <td className="py-2.5 text-gray-900">{log.user_name}</td>
                      <td className="py-2.5 text-gray-600">{log.role}</td>
                      <td className="py-2.5 text-gray-600">{log.module}</td>
                      <td className="py-2.5 text-gray-600">{log.action}</td>
                      <td className="py-2.5 text-gray-600 max-w-[200px] truncate" title={log.details}>{log.details}</td>
                      <td className="py-2.5 text-gray-600">{log.ip_address}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-opacity-10
                          ${log.severity === 'Low' ? 'text-green-600 bg-green-100' : ''}
                          ${log.severity === 'Medium' ? 'text-yellow-600 bg-yellow-100' : ''}
                          ${log.severity === 'High' ? 'text-orange-500 bg-orange-100' : ''}
                          ${log.severity === 'Critical' ? 'text-red-600 bg-red-100' : ''}
                        `}>
                          {log.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 text-center">
                 <button className="text-xs text-blue-600 font-medium hover:underline flex items-center justify-center w-full">View All Audit Logs →</button>
              </div>
            </div>
          </div>

          {/* Reports Summary */}
          <div className="col-span-1 border rounded-xl bg-white p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Reports Summary</h3>
              <a href="#" className="text-xs text-blue-600 font-medium hover:underline">View All</a>
            </div>
            <div className="space-y-4 mt-2">
              {[
                { label: 'Total Reports', value: 128, trend: '12.28%', icon: <FileText className="w-4 h-4 text-blue-500"/>, bg: 'bg-blue-50' },
                { label: 'Scheduled Reports', value: 43, trend: '7.50%', icon: <CalendarDays className="w-4 h-4 text-blue-500"/>, bg: 'bg-blue-50' },
                { label: 'Ad-hoc Reports', value: 56, trend: '15.52%', icon: <FileText className="w-4 h-4 text-orange-500"/>, bg: 'bg-orange-50' },
                { label: 'Downloaded Reports', value: 214, trend: '10.14%', icon: <Download className="w-4 h-4 text-red-500"/>, bg: 'bg-red-50' },
                { label: 'Shared Reports', value: 37, trend: '8.82%', icon: <UserCheck className="w-4 h-4 text-blue-500"/>, bg: 'bg-blue-50' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${r.bg} flex items-center justify-center`}>
                      {r.icon}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{r.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-900">{r.value}</span>
                    <span className="text-xs font-medium text-green-600 flex items-center w-12 justify-end"><TrendingUpIcon className="w-3 h-3 mr-1" /> {r.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables Row 2 */}
        <div className="grid gap-4 md:grid-cols-4">
          
          {/* Top Users */}
          <div className="col-span-1 border rounded-xl bg-white p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Top Users by Activities</h3>
              <a href="#" className="text-xs text-blue-600 font-medium hover:underline">View All</a>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="pb-2 font-medium w-6">#</th>
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium text-right">Total Activities</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Ms. A. Sharma', role: 'Admin', count: 2845, twWidth: 'w-full' },
                  { name: 'Dr. R. Principal', role: 'Principal', count: 2301, twWidth: 'w-[80%]' },
                  { name: 'Mr. V. Kumar', role: 'Faculty', count: 1985, twWidth: 'w-[70%]' },
                  { name: 'Ms. P. Singh', role: 'Admin', count: 1642, twWidth: 'w-[58%]' },
                  { name: 'Mr. S. Verma', role: 'Faculty', count: 1291, twWidth: 'w-[45%]' },
                ].map((u, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-gray-900 font-medium">{i+1}</td>
                    <td className="py-2.5 text-gray-900">{u.name}</td>
                    <td className="py-2.5 text-gray-600">{u.role}</td>
                    <td className="py-2.5 text-right font-medium text-gray-900">
                      <div className="flex items-center justify-end gap-2">
                        {u.count.toLocaleString()}
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-blue-500 rounded-full ${u.twWidth}`}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Scheduled Reports */}
          <div className="col-span-2 border rounded-xl bg-white p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Scheduled Reports</h3>
              <a href="#" className="text-xs text-blue-600 font-medium hover:underline">View All</a>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="pb-2 font-medium">Report Name</th>
                  <th className="pb-2 font-medium">Frequency</th>
                  <th className="pb-2 font-medium">Next Run</th>
                  <th className="pb-2 font-medium">Last Run</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Daily Login Summary', freq: 'Daily', next: '13 May 2025 08:00 AM', last: '12 May 2025 08:00 AM', status: 'Active' },
                  { name: 'Weekly Activity Report', freq: 'Weekly', next: '14 May 2025 09:00 AM', last: '07 May 2025 09:00 AM', status: 'Active' },
                  { name: 'Monthly Audit Summary', freq: 'Monthly', next: '01 Jun 2025 10:00 AM', last: '01 May 2025 10:00 AM', status: 'Active' },
                  { name: 'User Access Review', freq: 'Weekly', next: '14 May 2025 11:00 AM', last: '07 May 2025 11:00 AM', status: 'Active' },
                  { name: 'System Change Report', freq: 'Daily', next: '13 May 2025 06:00 PM', last: '12 May 2025 06:00 PM', status: 'Active' },
                ].map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-2.5 font-semibold text-gray-900">{r.name}</td>
                    <td className="py-2.5 text-gray-600">{r.freq}</td>
                    <td className="py-2.5 text-gray-600">{r.next}</td>
                    <td className="py-2.5 text-gray-600">{r.last}</td>
                    <td className="py-2.5">
                      <span className="text-green-600 font-bold">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Actions */}
          <div className="col-span-1 border rounded-xl bg-white p-4 shadow-sm flex flex-col">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3 flex-1">
              {[
                { label: 'Generate Custom Report', icon: <FileText className="w-4 h-4 text-blue-600"/>, bg: 'bg-blue-50' },
                { label: 'Export Audit Logs', icon: <Download className="w-4 h-4 text-emerald-600"/>, bg: 'bg-emerald-50' },
                { label: 'Schedule New Report', icon: <CalendarDays className="w-4 h-4 text-purple-600"/>, bg: 'bg-purple-50' },
                { label: 'System Audit Settings', icon: <Settings className="w-4 h-4 text-orange-600"/>, bg: 'bg-orange-50' },
                { label: 'User Access Review', icon: <UserCheck className="w-4 h-4 text-rose-600"/>, bg: 'bg-rose-50' },
              ].map((a, i) => (
                <button key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-white shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-left group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.bg} group-hover:scale-110 transition-transform`}>
                    {a.icon}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
          
        </div>

        <p className="text-xs text-gray-500 mt-4 pb-8 flex items-center">
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
          Audit logs are immutable and securely stored as per institutional policy.
        </p>
      </div>
    </AdminLayout>
  );
}

// Helper icons
function TrendingUpIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}

function TrendingDownIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
      <polyline points="17 18 23 18 23 12"></polyline>
    </svg>
  );
}
