import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    email: string;
    department?: {
      short_name: string;
      full_name: string;
    };
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

export default function SubmissionsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Status filter state synced with searchParams or defaulting to 'all'
  const currentStatus = searchParams.get('status') || 'all';

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      
      let url = '/api/v1/exam-cell/submissions';
      if (currentStatus !== 'all') {
        url += `?status=${currentStatus}`;
      }

      const response = await fetch(url, { headers });
      const result = await response.json();
      if (result.success) {
        setSubmissions(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [currentStatus]);

  const handleStatusFilterChange = (status: string) => {
    if (status === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  // Filter submissions by search query locally
  const filteredSubmissions = submissions.filter(sub => {
    const query = searchQuery.toLowerCase();
    const subjectName = sub.subject?.subject_name?.toLowerCase() || '';
    const subjectCode = sub.subject?.subject_code?.toLowerCase() || '';
    const facultyName = sub.faculty?.Name?.toLowerCase() || '';
    const className = sub.class?.name?.toLowerCase() || '';
    
    return subjectName.includes(query) || 
           subjectCode.includes(query) || 
           facultyName.includes(query) || 
           className.includes(query);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 uppercase">
            <CheckCircle2 className="h-3 w-3" /> Published
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
            <Clock className="h-3 w-3 animate-pulse" /> Verified (Review)
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-rose-200 uppercase">
            <AlertCircle className="h-3 w-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
            <Clock className="h-3 w-3" /> Submitted
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Marks Submission Batches</h1>
          <p className="text-muted-foreground text-sm">Review, verify and publish faculty submissions</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 self-start" onClick={fetchSubmissions}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'All', value: 'all' },
                { label: 'Submitted (Pending)', value: 'submitted' },
                { label: 'Under Review', value: 'under_review' },
                { label: 'Published', value: 'published' },
                { label: 'Rejected', value: 'rejected' }
              ].map(tab => (
                <Button
                  key={tab.value}
                  variant={currentStatus === tab.value ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full px-4"
                  onClick={() => handleStatusFilterChange(tab.value)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search subject, faculty, class..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid of Submissions */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <Card className="border border-dashed border-border/80">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <FolderOpen className="h-12 w-12 opacity-35 mb-3" />
            <p className="font-semibold text-foreground">No submissions found</p>
            <p className="text-sm">Try modifying your filters or search query.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSubmissions.map((sub, idx) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Card className="overflow-hidden border border-border/70 hover:shadow-md hover:border-primary/20 transition-all flex flex-col justify-between h-full group bg-card">
                <div>
                  <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
                    <span className="text-xs font-mono font-bold tracking-wider text-muted-foreground">
                      {sub.academic_year} • SEM {sub.semester}
                    </span>
                    {getStatusBadge(sub.status)}
                  </div>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors">
                          {sub.subject?.subject_name}
                        </CardTitle>
                        <CardDescription className="text-xs font-mono">
                          {sub.subject?.subject_code}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs bg-muted/20 p-3 rounded-lg border border-border/40">
                      <div>
                        <p className="text-muted-foreground mb-0.5">Class / Section</p>
                        <p className="font-bold text-foreground">
                          {sub.class?.name || sub.batch} - {sub.class?.section || ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">Assessment</p>
                        <p className="font-bold text-foreground text-primary">
                          Internal #{sub.internal_number}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="text-muted-foreground">Faculty In-charge</p>
                      <p className="font-semibold text-foreground">{sub.faculty?.Name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {sub.faculty?.department?.full_name || sub.faculty?.email}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t pt-3 text-muted-foreground">
                      <span>Total Students: <strong className="text-foreground">{sub.total_students}</strong></span>
                      <span>
                        Submitted: {new Date(sub.submitted_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </CardContent>
                </div>
                
                <div className="p-5 pt-0">
                  <Button
                    onClick={() => navigate(`/admin/exam-cell/submissions/${sub.id}`)}
                    className="w-full gap-2 text-xs"
                    variant={sub.status === 'submitted' ? 'default' : 'outline'}
                  >
                    <Eye className="h-4 w-4" /> 
                    {sub.status === 'submitted' ? 'Review & Verify' : 'View Details'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
