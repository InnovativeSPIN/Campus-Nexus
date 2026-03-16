import { useState, useEffect } from 'react';
import { MainLayout } from '@/pages/student/components/layout/MainLayout';
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
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Eye,
} from 'lucide-react';
import { cn } from '@/pages/student/lib/utils';
import { toast } from '@/pages/student/hooks/use-toast';

interface Leave {
  id: number;
  leaveType: string;
  leaveSubType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  created_at: string;
  overall_status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  class_incharge_approval_status: string;
  class_incharge_remarks?: string;
  classInchargeApprover?: { Name: string };
  department_admin_approval_status: string;
  department_admin_remarks?: string;
  deptAdminApprover?: { Name: string };
}

export default function MyLeaveTracker() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/v1/student-leaves/approvals/my-applications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLeaves(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
      toast({
        title: 'Error',
        description: 'Failed to load leave applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (leaveId: number) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/v1/student-leaves/approvals/${leaveId}/withdraw`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        toast({
          title: '✅ Success',
          description: 'Leave application withdrawn',
        });
        fetchLeaves();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to withdraw application',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error withdrawing leave:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const ApprovalTimeline = ({ leave }: { leave: Leave }) => (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
            1
          </div>
          <div className="w-0.5 h-8 bg-gray-200" />
        </div>
        <div>
          <p className="font-medium text-sm">Your Submission</p>
          <p className="text-xs text-muted-foreground">
            {new Date(leave.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
              leave.class_incharge_approval_status === 'pending'
                ? 'bg-yellow-100 text-yellow-600'
                : leave.class_incharge_approval_status === 'approved'
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
            )}
          >
            2
          </div>
          <div className="w-0.5 h-8 bg-gray-200" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">Class Incharge Review</p>
          <p className="text-xs text-muted-foreground capitalize">
            {leave.class_incharge_approval_status}
          </p>
          {leave.class_incharge_remarks && (
            <p className="text-xs mt-1 p-2 bg-muted rounded">
              <strong>Remarks:</strong> {leave.class_incharge_remarks}
            </p>
          )}
          {leave.classInchargeApprover && (
            <p className="text-xs text-muted-foreground mt-1">
              By: {leave.classInchargeApprover.Name}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
              leave.class_incharge_approval_status !== 'approved'
                ? 'bg-gray-100 text-gray-600'
                : leave.department_admin_approval_status === 'pending'
                ? 'bg-yellow-100 text-yellow-600'
                : leave.department_admin_approval_status === 'approved'
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
            )}
          >
            3
          </div>
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">Department Admin Approval</p>
          <p className="text-xs text-muted-foreground capitalize">
            {leave.class_incharge_approval_status !== 'approved'
              ? 'Awaiting...'
              : leave.department_admin_approval_status}
          </p>
          {leave.department_admin_remarks && (
            <p className="text-xs mt-1 p-2 bg-muted rounded">
              <strong>Remarks:</strong> {leave.department_admin_remarks}
            </p>
          )}
          {leave.deptAdminApprover && (
            <p className="text-xs text-muted-foreground mt-1">
              By: {leave.deptAdminApprover.Name}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="page-header font-serif">My Leave Applications</h1>
          <p className="text-muted-foreground -mt-4">
            Track your leave requests and approval status
          </p>
        </div>
        <Button
          onClick={() => window.location.href = '/student/submit-leave'}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + New Application
        </Button>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : leaves.length === 0 ? (
        <Card className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No leave applications yet</p>
          <Button onClick={() => window.location.href = '/student/submit-leave'}>
            Submit Your First Leave
          </Button>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {leaves.map((leave) => (
            <Card key={leave.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {leave.leaveType}
                      {leave.leaveSubType && (
                        <span className="text-sm font-normal text-muted-foreground">
                          ({leave.leaveSubType})
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {new Date(leave.startDate).toLocaleDateString()} →{' '}
                      {new Date(leave.endDate).toLocaleDateString()} • {leave.totalDays} days
                    </CardDescription>
                  </div>
                  <div className={cn('flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border', getStatusBadge(leave.overall_status))}>
                    {getStatusIcon(leave.overall_status)}
                    {leave.overall_status.toUpperCase()}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Reason:</strong> {leave.reason}
                </p>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedLeave(leave)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Approval Timeline
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Leave Approval Timeline</DialogTitle>
                    </DialogHeader>
                    {selectedLeave && <ApprovalTimeline leave={selectedLeave} />}
                  </DialogContent>
                </Dialog>

                {leave.overall_status === 'pending' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleWithdraw(leave.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Withdraw Application
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </MainLayout>
  );
}
