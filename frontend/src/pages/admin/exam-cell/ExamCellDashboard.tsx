import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileClock,
  CheckSquare,
  Globe,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Bell,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  pending: number;
  underReview: number;
  published: number;
  rejected: number;
}

interface Submission {
  id: number;
  batch: string;
  semester: number;
  academic_year: string;
  internal_number: number;
  status: string;
  total_students: number;
  submitted_at: string;
  faculty?: {
    Name: string;
  };
  subject?: {
    subject_name: string;
    subject_code: string;
  };
  class?: {
    name: string;
    section: string;
  };
}

export default function ExamCellDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    pending: 0,
    underReview: 0,
    published: 0,
    rejected: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch stats
        const statsRes = await fetch('/api/v1/exam-cell/dashboard/stats', { headers });
        const statsResult = await statsRes.json();
        if (statsResult.success) {
          setStats(statsResult.data);
        }

        // Fetch submissions for "recent" list
        const subsRes = await fetch('/api/v1/exam-cell/submissions', { headers });
        const subsResult = await subsRes.json();
        if (subsResult.success) {
          setRecentSubmissions((subsResult.data || []).slice(0, 5));
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Pending Review',
      value: stats.pending,
      description: 'Awaiting initial check',
      icon: <FileClock className="h-6 w-6 text-amber-500" />,
      color: 'from-amber-500/10 to-amber-500/5',
      borderColor: 'border-amber-500/20',
      statusFilter: 'submitted'
    },
    {
      title: 'Under Review',
      value: stats.underReview,
      description: 'Verified & being audited',
      icon: <CheckSquare className="h-6 w-6 text-blue-500" />,
      color: 'from-blue-500/10 to-blue-500/5',
      borderColor: 'border-blue-500/20',
      statusFilter: 'under_review'
    },
    {
      title: 'Published Results',
      value: stats.published,
      description: 'Released to students',
      icon: <Globe className="h-6 w-6 text-emerald-500" />,
      color: 'from-emerald-500/10 to-emerald-500/5',
      borderColor: 'border-emerald-500/20',
      statusFilter: 'published'
    },
    {
      title: 'Rejected Batches',
      value: stats.rejected,
      description: 'Sent back to faculty',
      icon: <AlertTriangle className="h-6 w-6 text-rose-500" />,
      color: 'from-rose-500/10 to-rose-500/5',
      borderColor: 'border-rose-500/20',
      statusFilter: 'rejected'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 to-secondary p-8 text-white shadow-xl"
      >
        <div className="relative z-10 space-y-2">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wider uppercase">
            Exam Cell Controller
          </span>
          <h1 className="text-3xl font-bold font-serif md:text-4xl">Exam Cell Administration</h1>
          <p className="max-w-xl text-white/80 text-sm md:text-base">
            Review, verify, and publish internal assessment scores. Audit faculty marks and issue broadcasts to the campus community.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_right,rgba(255,255,255,0.15)_0%,transparent_70%)]" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              className={`relative overflow-hidden border bg-gradient-to-br ${card.color} ${card.borderColor} cursor-pointer hover:shadow-md transition-all group`}
              onClick={() => navigate(`/admin/exam-cell/submissions?status=${card.statusFilter}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{card.title}</p>
                    <h3 className="text-3xl font-black tracking-tight text-foreground">{loading ? '...' : card.value}</h3>
                  </div>
                  <div className="rounded-xl bg-background p-3 shadow-sm border group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{card.description}</span>
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Submissions */}
        <Card className="lg:col-span-2 border border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-serif">Recent Marks Submissions</CardTitle>
              <CardDescription>Awaiting audit and publishing</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 border-primary/20 text-primary hover:bg-primary/5"
              onClick={() => navigate('/admin/exam-cell/submissions')}
            >
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-[280px] items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : recentSubmissions.length === 0 ? (
              <div className="flex h-[280px] flex-col items-center justify-center text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                <FileClock className="h-10 w-10 opacity-30 mb-2" />
                <p className="font-semibold text-sm">No submissions found</p>
                <p className="text-xs">Faculty members have not submitted marks yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSubmissions.map((sub, idx) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigate(`/admin/exam-cell/submissions/${sub.id}`)}
                    className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/40 cursor-pointer transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`rounded-xl p-2.5 font-bold text-xs ${
                        sub.status === 'published' ? 'bg-green-50 text-green-700 border border-green-200' :
                        sub.status === 'under_review' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        sub.status === 'rejected' ? 'bg-red-50 text-red-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        IA #{sub.internal_number}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-foreground">
                          {sub.subject?.subject_name} ({sub.subject?.subject_code})
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Class: <span className="font-semibold text-foreground">{sub.class?.name} - {sub.class?.section}</span> • 
                          Faculty: <span className="font-semibold text-foreground">{sub.faculty?.Name}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <p className="font-semibold text-foreground">
                          {sub.total_students} Students
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          {new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-40" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="border border-border/60 shadow-sm flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle className="font-serif">Quick Controls</CardTitle>
              <CardDescription>Shortcut utilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 border-primary/20 text-foreground hover:bg-primary/5"
                onClick={() => navigate('/admin/exam-cell/submissions?status=submitted')}
              >
                <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-600">
                  <FileClock className="h-4 w-4" />
                </div>
                Verify New Submissions
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 border-primary/20 text-foreground hover:bg-primary/5"
                onClick={() => navigate('/admin/exam-cell/results')}
              >
                <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
                View Grade Ledgers
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 border-primary/20 text-foreground hover:bg-primary/5"
                onClick={() => navigate('/admin/exam-cell/notifications')}
              >
                <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-600">
                  <Bell className="h-4 w-4" />
                </div>
                Broadcast Announcement
              </Button>
            </CardContent>
          </div>

          <div className="p-6 border-t bg-muted/10 rounded-b-xl">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Exam Cell Audit Session: Active</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
