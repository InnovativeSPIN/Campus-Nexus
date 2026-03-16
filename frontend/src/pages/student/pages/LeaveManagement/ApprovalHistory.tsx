import { useState, useEffect } from 'react';
import { MainLayout } from '@/pages/student/components/layout/MainLayout';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/pages/student/components/ui/card';
import {
  Check,
  Clock,
  X,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/pages/student/lib/utils';
import { toast } from '@/pages/student/hooks/use-toast';

interface TimelineEvent {
  step: number;
  stage: string;
  actor: string;
  role: string;
  timestamp: string | null;
  status: 'completed' | 'pending' | 'approved' | 'rejected';
  remarks?: string | null;
}

interface ApprovalHistory {
  leave: {
    id: number;
    studentName: string;
    studentRollNo: string;
    leaveType: string;
    leaveSubType: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    overallStatus: string;
  };
  timeline: TimelineEvent[];
}

export default function ApprovalHistory() {
  const [history, setHistory] = useState<ApprovalHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const leaveId = new URLSearchParams(window.location.search).get('leaveId');

  useEffect(() => {
    if (!leaveId) {
      toast({
        title: 'Error',
        description: 'Leave ID not provided',
        variant: 'destructive',
      });
      return;
    }
    fetchApprovalHistory();
  }, [leaveId]);

  const fetchApprovalHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/v1/approval-history/${leaveId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setHistory(data.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load approval history',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Failed to fetch approval history:', err);
      toast({
        title: 'Error',
        description: 'An error occurred while fetching history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 border-green-300';
      case 'pending':
        return 'bg-yellow-100 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!history) {
    return (
      <MainLayout>
        <Card className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No data available</p>
        </Card>
      </MainLayout>
    );
  }

  const { leave, timeline } = history;

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="page-header font-serif">Approval History</h1>
        <p className="text-muted-foreground -mt-4">
          Track the complete approval journey of your leave request
        </p>
      </motion.div>

      {/* Leave Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{leave.leaveType}</span>
              <span
                className={cn(
                  'text-sm font-semibold px-3 py-1 rounded-full',
                  leave.overallStatus === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : leave.overallStatus === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : leave.overallStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                )}
              >
                {leave.overallStatus.toUpperCase()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Student Name</p>
                <p className="font-medium">{leave.studentName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Roll No</p>
                <p className="font-medium">{leave.studentRollNo}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Duration</p>
                <p className="font-medium">{leave.totalDays} days</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Date Range</p>
                <p className="font-medium text-sm">
                  {new Date(leave.startDate).toLocaleDateString()} −{' '}
                  {new Date(leave.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            {leave.leaveSubType && (
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">Sub Type</p>
                <p className="font-medium">{leave.leaveSubType}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">Reason</p>
              <p className="text-sm text-muted-foreground">{leave.reason}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold mb-6">Approval Timeline</h2>

        {timeline.map((event, index) => (
          <div key={event.step} className="flex gap-4">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2',
                  getStatusColor(event.status)
                )}
              >
                {getStatusIcon(event.status)}
              </div>
              {index < timeline.length - 1 && (
                <div className="w-0.5 h-24 bg-gray-200 mt-2" />
              )}
            </div>

            {/* Event Details */}
            <Card className="flex-1">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{event.stage}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.role}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-muted">
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>

                {event.actor && (
                  <div className="text-sm mb-2">
                    <span className="text-muted-foreground">
                      {event.status === 'pending'
                        ? 'Awaiting action from'
                        : 'Reviewed by'}
                      :{' '}
                    </span>
                    <span className="font-medium">{event.actor}</span>
                  </div>
                )}

                {event.timestamp && (
                  <div className="text-xs text-muted-foreground mb-2">
                    {new Date(event.timestamp).toLocaleDateString()} at{' '}
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                )}

                {event.remarks && (
                  <div className="mt-3 p-3 bg-muted rounded-lg border border-muted-foreground/20">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Remarks:
                    </p>
                    <p className="text-sm">{event.remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </motion.div>
    </MainLayout>
  );
}
