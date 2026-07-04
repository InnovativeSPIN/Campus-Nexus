import { useState, useEffect } from 'react';
import MainLayout from '@/pages/student/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { Button } from '@/pages/student/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/pages/student/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/pages/student/components/ui/dialog';
import {
  Textarea,
} from '@/pages/student/components/ui/textarea';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { cn } from '@/pages/student/lib/utils';
import { toast } from '@/pages/student/hooks/use-toast';
import { getStudentDocumentUrl } from '@/utils/imageUrl';

interface PendingLeave {
  id: number;
  student_id: number;
  Student: {
    id: number;
    Name: string;
    email: string;
    rollNo: string;
  };
  leaveType: string;
  leaveSubType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachment?: string | null;
  created_at: string;
}

export default function ClassInchargeApprovalDashboard() {
  const [leaves, setLeaves] = useState<PendingLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<PendingLeave | null>(null);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/v1/student-leaves/approvals/pending/class-incharge', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLeaves(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending leaves:', err);
      toast({
        title: 'Error',
        description: 'Failed to load pending applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId: number, action: 'approved' | 'rejected') => {
    setProcessing(true);
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
          body: JSON.stringify({ remarks: remarks || undefined }),
        }
      );

      if (res.ok) {
        toast({
          title: '✅ Success',
          description: `Leave ${action}`,
        });
        setRemarks('');
        setSelectedLeave(null);
        fetchPendingLeaves();
      } else {
        const error = await res.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to process request',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error processing leave:', err);
      toast({
        title: 'Error',
        description: 'An error occurred while processing the request',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="page-header font-serif">Leave Approval Dashboard</h1>
        <p className="text-muted-foreground -mt-4">
          Review and approve student leave applications
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : leaves.length === 0 ? (
        <Card className="text-center py-12">
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <p className="text-muted-foreground mb-2 font-semibold">All caught up!</p>
          <p className="text-muted-foreground">No pending leave applications</p>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-sm text-muted-foreground mb-4">
            {leaves.length} pending application{leaves.length !== 1 ? 's' : ''}
          </div>

          {leaves.map((leave) => (
            <Card key={leave.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {leave.Student.Name}
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div>Roll No: {leave.Student.rollNo}</div>
                      <div>{leave.Student.email}</div>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                      <Clock className="w-3 h-3" />
                      PENDING
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Leave Type</p>
                    <p className="font-medium">
                      {leave.leaveType}
                      {leave.leaveSubType && ` - ${leave.leaveSubType}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Duration</p>
                    <p className="font-medium">{leave.totalDays} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">From</p>
                    <p className="font-medium">{new Date(leave.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">To</p>
                    <p className="font-medium">{new Date(leave.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Reason</p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {leave.reason}
                  </p>
                </div>

                {leave.attachment && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                  >
                    <a
                      href={getStudentDocumentUrl(leave.attachment)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View Attachment
                    </a>
                  </Button>
                )}

                <Dialog open={selectedLeave?.id === leave.id} onOpenChange={(open) => {
                  if (!open) {
                    setSelectedLeave(null);
                    setRemarks('');
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLeave(leave)}
                      className="w-full"
                    >
                      Review & Take Action
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Approve or Reject Leave</DialogTitle>
                    </DialogHeader>
                    {selectedLeave && (
                      <div className="space-y-4">
                        <div className="bg-muted p-3 rounded">
                          <p className="font-semibold text-sm mb-2">{selectedLeave.Student.Name}</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            {selectedLeave.leaveType} • {selectedLeave.totalDays} days
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(selectedLeave.startDate).toLocaleDateString()} −{' '}
                            {new Date(selectedLeave.endDate).toLocaleDateString()}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-semibold mb-2 block">
                            Remarks (Optional)
                          </label>
                          <Textarea
                            placeholder="Add remarks or feedback..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="resize-none"
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleApprove(selectedLeave.id, 'rejected')}
                            disabled={processing}
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(selectedLeave.id, 'approved')}
                            disabled={processing}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </MainLayout>
  );
}
