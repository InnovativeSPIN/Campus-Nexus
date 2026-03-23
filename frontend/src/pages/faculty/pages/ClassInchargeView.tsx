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
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Award,
  Star,
  Flag,
  FileText,
} from 'lucide-react';
import { cn } from '@/pages/faculty/lib/utils';
import { useToast } from '@/pages/faculty/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/pages/faculty/components/ui/dialog';
import { Textarea } from '@/pages/faculty/components/ui/textarea';
import { Button } from '@/pages/faculty/components/ui/button';
import { Label } from '@/pages/faculty/components/ui/label';

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
  overall_status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  class_incharge_approval_status: 'pending' | 'approved' | 'rejected';
  class_incharge_remarks?: string;
  attachment: string | null;
  student: Student;
}

interface PortfolioItem {
  id: number;
  studentId: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  student: Student;
  createdAt: string;
  name?: string;
  eventName?: string;
  title?: string;
  type?: string;
  category?: string;
  level?: string;
  fileUrl?: string;
  issuer?: string;
  joinedDate?: string;
  eventDate?: string;
  issueDate?: string;
  documentUrl?: string;
  certificateUrl?: string;
  techStack?: string | any;
  demoUrl?: string;
  repoUrl?: string;
  organizer?: string;
  role?: string;
  credentialId?: string;
  credentialUrl?: string;
  expiryDate?: string;
  startDate?: string;
  endDate?: string;
  achievements?: string;
  achievement?: string;
  description?: string;
  skills?: string | any;
}

interface ClassInchargeData {
  incharge: { id: number; academic_year: string; class: ClassInfo };
  students: Student[];
  totalStudents: number;
}

export default function ClassInchargeView() {
  const { user, refreshUserData } = useAuth();
  const { toast } = useToast();
  const refreshedRef = useRef(false);
  const [data, setData] = useState<ClassInchargeData | null>(null);
  const [leaves, setLeaves] = useState<StudentLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'students' | 'leaves' | 'portfolio'>('students');
  const [portfolioData, setPortfolioData] = useState<{
    sports: PortfolioItem[];
    events: PortfolioItem[];
    certs: PortfolioItem[];
    projects: PortfolioItem[];
  }>({ sports: [], events: [], certs: [], projects: [] });
  const [activePortfolioCategory, setActivePortfolioCategory] = useState<'sports' | 'events' | 'certs' | 'projects'>('sports');
  const [selectedLeave, setSelectedLeave] = useState<StudentLeave | null>(null);
  const [leaveRemarks, setLeaveRemarks] = useState('');
  const [processingLeaveId, setProcessingLeaveId] = useState<number | null>(null);

  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
  const [portfolioRemarks, setPortfolioRemarks] = useState('');
  const [processingPortfolioId, setProcessingPortfolioId] = useState<number | null>(null);

  useEffect(() => {
    if (!refreshedRef.current) {
      refreshedRef.current = true;
      refreshUserData();
    }
  }, [refreshUserData]);

  useEffect(() => {
    fetchClassIncharge();
    fetchLeaveRequests();
    fetchPortfolioVerification();
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
      const res = await fetch('/api/v1/student-leaves/approvals/pending/class-incharge', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setLeaves(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
    } finally {
      setLeavesLoading(false);
    }
  };

  const handleLeaveApproval = async (leaveId: number, action: 'approved' | 'rejected') => {
    setProcessingLeaveId(leaveId);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(
        `/api/v1/student-leaves/approvals/${leaveId}/class-incharge/${action}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ remarks: leaveRemarks || undefined }),
        }
      );

      if (res.ok) {
        toast({ title: '✅ Success', description: `Leave ${action} successfully.` });
        setLeaveRemarks('');
        setSelectedLeave(null);
        fetchLeaveRequests();
      }
    } catch (err) {
      console.error('Error processing leave:', err);
    } finally {
      setProcessingLeaveId(null);
    }
  };

  const fetchPortfolioVerification = async () => {
    setPortfolioLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const fetchOpts = { headers: { 'Authorization': `Bearer ${token}` } };

      const [sportsRes, eventsRes, certsRes, projectsRes] = await Promise.all([
        fetch('/api/v1/student/extracurricular/sports/class-incharge?approvalStatus=pending', fetchOpts),
        fetch('/api/v1/student/extracurricular/events/class-incharge?approvalStatus=pending', fetchOpts),
        fetch('/api/v1/student/certifications/class-incharge?approvalStatus=pending', fetchOpts),
        fetch('/api/v1/student/projects/class-incharge?approvalStatus=pending', fetchOpts),
      ]);

      const [sportsData, eventsData, certsData, projectsData] = await Promise.all([
        sportsRes.ok ? sportsRes.json() : { data: [] },
        eventsRes.ok ? eventsRes.json() : { data: [] },
        certsRes.ok ? certsRes.json() : { data: [] },
        projectsRes.ok ? projectsRes.json() : { data: [] },
      ]);

      setPortfolioData({
        sports: sportsData.data || [],
        events: eventsData.data || [],
        certs: certsData.data || [],
        projects: projectsData.data || []
      });
    } catch (err) {
      console.error('Failed to fetch portfolio verification:', err);
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handlePortfolioApproval = async (id: number, category: string, status: 'approved' | 'rejected') => {
    setProcessingPortfolioId(id);
    try {
      const token = localStorage.getItem('authToken');
      let endpoint = '';
      switch (category) {
        case 'sports': endpoint = `/api/v1/student/extracurricular/sports/${id}/approval`; break;
        case 'events': endpoint = `/api/v1/student/extracurricular/events/${id}/approval`; break;
        case 'certs': endpoint = `/api/v1/student/certifications/${id}/approval`; break;
        case 'projects': endpoint = `/api/v1/student/projects/${id}/approval`; break;
      }

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          approvalStatus: status, 
          approvalRemarks: portfolioRemarks || undefined 
        }),
      });

      if (res.ok) {
        toast({ title: '✅ Success', description: `Portfolio item ${status} successfully.` });
        setIsPortfolioDialogOpen(false);
        setSelectedPortfolioItem(null);
        setPortfolioRemarks('');
        fetchPortfolioVerification();
      }
    } catch (err) {
      console.error('Error updating portfolio status:', err);
    } finally {
      setProcessingPortfolioId(null);
    }
  };

  if (!user?.is_class_incharge && !data && !loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96 text-muted-foreground gap-4">
          <AlertCircle className="w-12 h-12 text-destructive/60" />
          <p className="text-lg font-medium">You are not assigned as a Class Incharge.</p>
        </div>
      </MainLayout>
    );
  }

  const filteredStudents = (data?.students || []).filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesSearch = !search || fullName.includes(search.toLowerCase()) || s.studentId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const classInfo = data?.incharge?.class;

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="page-header font-serif">Class Incharge</h1>
        <p className="text-muted-foreground -mt-4">Manage your assigned class and students</p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Clock className="animate-spin text-primary" /></div>
      ) : !data ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
          <AlertCircle className="w-10 h-10 text-yellow-500" />
          <p>No active class assignment found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Class', val: classInfo?.name, icon: BookOpen, color: 'text-primary' },
              { label: 'Semester', val: `Sem ${classInfo?.semester}`, icon: Hash, color: 'text-blue-600' },
              { label: 'Students', val: data.totalStudents, icon: Users, color: 'text-green-600' },
              { label: 'Academic Year', val: data.incharge.academic_year, icon: GraduationCap, color: 'text-orange-600' }
            ].map((stat, i) => (
              <div key={i} className="bg-card rounded-xl border p-5 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-full bg-muted flex items-center justify-center")}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div><p className="text-xs text-muted-foreground">{stat.label}</p><p className="font-bold text-lg">{stat.val || '—'}</p></div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex border-b overflow-x-auto scrollbar-hide">
            {[
              { id: 'students', label: 'Students', icon: Users, count: filteredStudents.length },
              { id: 'leaves', label: 'Leave Requests', icon: CalendarDays, count: leaves.length },
              { id: 'portfolio', label: 'Portfolio Verification', icon: Trophy, count: portfolioData.sports.length + portfolioData.events.length + portfolioData.certs.length + portfolioData.projects.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-6 py-3 font-medium text-sm transition-all whitespace-nowrap flex items-center gap-2 relative border-b-2",
                  activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">{tab.count}</span>}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'students' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-muted-foreground/10 overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-muted/20 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 ring-primary outline-none"
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    {['all', 'active', 'inactive'].map(f => (
                      <button key={f} onClick={() => setStatusFilter(f)} className={cn("px-3 py-1.5 text-xs rounded-full border capitalize transition-all", statusFilter === f ? "bg-primary text-white" : "hover:bg-muted")}>{f}</button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 border-b text-muted-foreground font-medium">
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Contact</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Semester</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr><td colSpan={4} className="py-12 text-center text-muted-foreground">No students found.</td></tr>
                      ) : (
                        filteredStudents.map((s, idx) => (
                          <tr key={s.id} className={cn("border-b hover:bg-muted/10 transition-colors", idx % 2 && "bg-muted/5")}>
                            <td className="py-3 px-4 font-medium">{s.firstName} {s.lastName}</td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-1 text-xs">
                                <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {s.email}</span>
                                <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {s.phone}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={cn("px-2 py-0.5 rounded-full text-[10px] uppercase font-bold", s.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{s.status}</span>
                            </td>
                            <td className="py-3 px-4 text-center font-bold">Sem {s.semester}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'leaves' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-muted-foreground/10 overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                   <h2 className="font-bold flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /> Pending Leave Requests</h2>
                   <Button variant="ghost" size="sm" onClick={fetchLeaveRequests} className="h-8 text-xs">Refresh</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 border-b text-muted-foreground px-4">
                        <th className="py-3 px-4 text-left">Student</th>
                        <th className="py-3 px-4 text-left">Type</th>
                        <th className="py-3 px-4 text-left">Duration</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leavesLoading ? (
                        <tr><td colSpan={4} className="py-12 text-center"><Clock className="animate-spin inline mr-2" /> Loading...</td></tr>
                      ) : leaves.length === 0 ? (
                        <tr><td colSpan={4} className="py-12 text-center text-muted-foreground">No pending leaves.</td></tr>
                      ) : (
                        leaves.map(l => (
                          <tr key={l.id} className="border-b hover:bg-muted/10">
                            <td className="py-3 px-4 font-medium">{l.student?.firstName} {l.student?.lastName}</td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-primary capitalize">{l.leaveType}</p>
                              <p className="text-[10px] text-muted-foreground italic">{l.leaveSubType}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-bold">{l.totalDays} Days</p>
                              <p className="text-[10px] text-muted-foreground">{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</p>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Button size="sm" variant="outline" onClick={() => setSelectedLeave(l)} className="h-8 text-[10px] font-bold">Review</Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'portfolio' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'sports', icon: Trophy, color: 'bg-orange-600', count: portfolioData.sports.length },
                    { id: 'events', icon: Flag, color: 'bg-blue-600', count: portfolioData.events.length },
                    { id: 'certs', icon: Award, color: 'bg-purple-600', count: portfolioData.certs.length },
                    { id: 'projects', icon: Star, color: 'bg-green-600', count: portfolioData.projects.length }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActivePortfolioCategory(cat.id as any)}
                      className={cn(
                        "px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all",
                        activePortfolioCategory === cat.id ? `${cat.color} text-white shadow-lg` : "bg-card hover:bg-muted"
                      )}
                    >
                      <cat.icon className="w-3.5 h-3.5" />
                      {cat.id.toUpperCase()} ({cat.count})
                    </button>
                  ))}
                </div>

                <div className="bg-card rounded-xl border border-muted-foreground/10 overflow-hidden">
                   <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                       <thead>
                         <tr className="bg-muted/30 border-b text-muted-foreground">
                            <th className="py-3 px-4 text-left">Student</th>
                            <th className="py-3 px-4 text-left">Item Details</th>
                            <th className="py-3 px-4 text-left">Date</th>
                            <th className="py-3 px-4 text-center">Action</th>
                         </tr>
                       </thead>
                       <tbody>
                        {portfolioLoading ? (
                          <tr><td colSpan={4} className="py-12 text-center">Loading submissions...</td></tr>
                        ) : portfolioData[activePortfolioCategory].length === 0 ? (
                          <tr><td colSpan={4} className="py-12 text-center text-muted-foreground">No pending submissions in this category.</td></tr>
                        ) : (
                          portfolioData[activePortfolioCategory].map(item => (
                            <tr key={item.id} className="border-b hover:bg-muted/10 transition-colors">
                              <td className="py-3 px-4 font-semibold">{item.student?.firstName} {item.student?.lastName}</td>
                              <td className="py-3 px-4">
                                <p className="font-bold text-primary">{item.name || item.eventName || item.title}</p>
                                <p className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">{item.issuer || item.category || item.type}</p>
                              </td>
                              <td className="py-3 px-4 text-xs italic text-muted-foreground">
                                {new Date(item.joinedDate || item.eventDate || item.issueDate || item.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Button size="sm" onClick={() => { setSelectedPortfolioItem(item); setIsPortfolioDialogOpen(true); }} className="h-8 text-[10px] font-bold">Review</Button>
                              </td>
                            </tr>
                          ))
                        )}
                       </tbody>
                     </table>
                   </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* DIALOGS */}
      
      {/* Leave Dialog */}
      <Dialog open={!!selectedLeave} onOpenChange={o => !o && setSelectedLeave(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Review Leave Request</DialogTitle></DialogHeader>
          {selectedLeave && (
            <div className="space-y-4 pt-2">
              <div className="bg-muted/30 p-4 rounded-xl border space-y-2">
                <div className="flex justify-between text-sm"><strong>Student:</strong> <span>{selectedLeave.student?.firstName} {selectedLeave.student?.lastName}</span></div>
                <div className="flex justify-between text-sm"><strong>Type:</strong> <span className="capitalize">{selectedLeave.leaveType}</span></div>
                <div className="flex justify-between text-sm"><strong>Duration:</strong> <span>{selectedLeave.totalDays} Days ({new Date(selectedLeave.startDate).toLocaleDateString()}...)</span></div>
                <div className="border-t pt-2 mt-2"><strong>Reason:</strong> <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{selectedLeave.reason}</p></div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">REMARKS</Label>
                <Textarea value={leaveRemarks} onChange={e => setLeaveRemarks(e.target.value)} placeholder="Entry notes here..." className="min-h-[100px] text-sm resize-none" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedLeave(null)}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleLeaveApproval(selectedLeave.id, 'rejected')} disabled={!!processingLeaveId}>Reject</Button>
                <Button className="flex-1" onClick={() => handleLeaveApproval(selectedLeave.id, 'approved')} disabled={!!processingLeaveId}>{processingLeaveId ? '...' : 'Approve'}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Portfolio Review Dialog */}
      <Dialog open={isPortfolioDialogOpen} onOpenChange={o => !o && setIsPortfolioDialogOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-serif text-xl border-b pb-2 italic">Portfolio Submission Review</DialogTitle></DialogHeader>
          {selectedPortfolioItem && (
            <div className="space-y-6 pt-2">
              <div className="bg-muted/40 p-5 rounded-2xl border-2 border-muted-foreground/10 space-y-5">
                <div className="flex flex-col gap-1 border-b border-muted-foreground/10 pb-3">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">STUDENT NAME</Label>
                  <p className="font-black text-xl text-primary tracking-tight">{selectedPortfolioItem.student ? `${selectedPortfolioItem.student.firstName} ${selectedPortfolioItem.student.lastName}` : '—'}</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">CATEGORY</Label>
                    <p className="font-bold capitalize text-sm">{activePortfolioCategory === 'certs' ? 'Certifications' : activePortfolioCategory}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <Label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">SUBMISSION TITLE</Label>
                    <p className="font-bold text-primary text-sm">{selectedPortfolioItem.name || selectedPortfolioItem.eventName || selectedPortfolioItem.title}</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-8 pt-4 border-t border-muted-foreground/10">
                  {[
                    { show: !!selectedPortfolioItem.issuer, label: 'ISSUER', val: selectedPortfolioItem.issuer },
                    { show: !!selectedPortfolioItem.category, label: 'CATEGORY', val: selectedPortfolioItem.category },
                    { show: !!selectedPortfolioItem.level, label: 'LEVEL', val: selectedPortfolioItem.level, cap: true },
                    { show: !!selectedPortfolioItem.type, label: 'TYPE', val: selectedPortfolioItem.type, cap: true },
                    { show: true, label: 'DATE', val: (selectedPortfolioItem.joinedDate || selectedPortfolioItem.eventDate || selectedPortfolioItem.issueDate || selectedPortfolioItem.startDate) ? new Date(selectedPortfolioItem.joinedDate || selectedPortfolioItem.eventDate || selectedPortfolioItem.issueDate || selectedPortfolioItem.startDate || '').toLocaleDateString() : '—' },
                  ].filter(f => f.show).map((field, i) => (
                    <div key={i} className="space-y-1">
                      <Label className="text-[9px] text-muted-foreground font-bold tracking-widest">{field.label}</Label>
                      <p className={cn("text-xs font-semibold", field.cap && "capitalize")}>{field.val}</p>
                    </div>
                  ))}
                </div>

                {/* Evidence Link */}
                {(selectedPortfolioItem.documentUrl || selectedPortfolioItem.certificateUrl || selectedPortfolioItem.fileUrl) && (
                  <div className="pt-4 border-t border-muted-foreground/10 flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2">
                       <FileText className="w-5 h-5 text-blue-600" />
                       <span className="text-xs font-bold text-blue-800">Supportive Evidence Provided</span>
                    </div>
                    <a
                      href={`/uploads/students/${selectedPortfolioItem.documentUrl || selectedPortfolioItem.certificateUrl || selectedPortfolioItem.fileUrl}`}
                      target="_blank" rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition-all uppercase tracking-wider"
                    >
                      View File
                    </a>
                  </div>
                )}

                {/* Tech & Links */}
                {(selectedPortfolioItem.techStack || selectedPortfolioItem.demoUrl || selectedPortfolioItem.repoUrl) && (
                  <div className="space-y-4 pt-4 border-t border-muted-foreground/10">
                    {selectedPortfolioItem.techStack && (
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">TECH STACK / TOOLS</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {(() => {
                            try {
                              const tags = typeof selectedPortfolioItem.techStack === 'string' ? JSON.parse(selectedPortfolioItem.techStack) : selectedPortfolioItem.techStack;
                              return (Array.isArray(tags) ? tags : [tags]).map((t: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-black uppercase">{t}</span>
                              ));
                            } catch { return <span className="text-xs">{selectedPortfolioItem.techStack}</span>; }
                          })()}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {selectedPortfolioItem.demoUrl && <div className="space-y-1"><Label className="text-[9px] text-muted-foreground font-bold tracking-widest">LIVE DEMO</Label><a href={selectedPortfolioItem.demoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold hover:underline truncate block">Visit Link</a></div>}
                      {selectedPortfolioItem.repoUrl && <div className="space-y-1"><Label className="text-[9px] text-muted-foreground font-bold tracking-widest">SOURCE CODE</Label><a href={selectedPortfolioItem.repoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold hover:underline truncate block">GitHub Repository</a></div>}
                    </div>
                  </div>
                )}

                {/* Description & Achievement */}
                {(selectedPortfolioItem.description || selectedPortfolioItem.achievements || selectedPortfolioItem.achievement) && (
                  <div className="space-y-4 pt-4 border-t border-muted-foreground/10">
                    {(selectedPortfolioItem.achievements || selectedPortfolioItem.achievement) && (
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">KEY ACHIEVEMENTS</Label>
                        <p className="text-xs font-bold leading-relaxed">{selectedPortfolioItem.achievements || selectedPortfolioItem.achievement}</p>
                      </div>
                    )}
                    {selectedPortfolioItem.description && (
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">DESCRIPTION / SCOPE</Label>
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap italic">{selectedPortfolioItem.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Skills Section */}
                {selectedPortfolioItem.skills && (
                  <div className="pt-4 border-t border-muted-foreground/10 space-y-2">
                    <Label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">VALIDATED SKILLS</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {(() => {
                        try {
                          const s = typeof selectedPortfolioItem.skills === 'string' ? JSON.parse(selectedPortfolioItem.skills) : selectedPortfolioItem.skills;
                          return (Array.isArray(s) ? s : [s]).map((skill: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-[9px] font-black uppercase">{skill}</span>
                          ));
                        } catch { return <span className="text-xs">{selectedPortfolioItem.skills}</span>; }
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Area */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-muted-foreground tracking-widest flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> VERIFICATION FEEDBACK</Label>
                  <Textarea
                    value={portfolioRemarks}
                    onChange={e => setPortfolioRemarks(e.target.value)}
                    placeholder="Provide feedback on the submission (e.g. proof invalid, missing details)..."
                    className="min-h-[120px] text-sm bg-background border-2 focus-visible:ring-primary/40 resize-none font-medium p-4 rounded-2xl"
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black h-14 shadow-xl shadow-emerald-600/20 rounded-2xl transition-all active:scale-[0.98]"
                    onClick={() => handlePortfolioApproval(selectedPortfolioItem.id, activePortfolioCategory, 'approved')}
                    disabled={!!processingPortfolioId}
                  >
                    {processingPortfolioId ? <Clock className="animate-spin w-5 h-5" /> : 'VERIFY & APPROVE'}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 font-black h-14 shadow-xl shadow-red-600/20 rounded-2xl transition-all active:scale-[0.98]"
                    onClick={() => handlePortfolioApproval(selectedPortfolioItem.id, activePortfolioCategory, 'rejected')}
                    disabled={!!processingPortfolioId}
                  >
                    {processingPortfolioId ? '...' : 'REJECT SUBMISSION'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
