import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface PendingLeave {
  id: number;
  applicant_name: string;
  applicant_email: string;
  department: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  substitute_faculty: string;
  substitute_status: string;
  timetable_incharge: string;
  timetable_incharge_status: string;
  affected_periods: string[];
}

interface RejectionReason {
  id: string;
  label: string;
}

const ExecutiveApprovalDashboard = () => {
  const [pendingLeaves, setPendingLeaves] = useState<PendingLeave[]>([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectionReasons, setRejectionReasons] = useState<RejectionReason[]>([]);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchPendingLeaves();
    fetchRejectionReasons();
  }, []);

  const fetchPendingLeaves = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/faculty/executive/pending-approvals', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending leaves');
      }

      const json = await response.json();
      if (json.success) {
        setPendingLeaves(json.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load pending approvals');
      console.error('Error fetching pending leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRejectionReasons = async () => {
    try {
      const response = await fetch('/api/v1/faculty/executive/rejection-reasons', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setRejectionReasons(json.data);
        }
      }
    } catch (err) {
      console.error('Error fetching rejection reasons:', err);
    }
  };

  const handleApprove = async (leaveId: number) => {
    setApproving(leaveId);
    try {
      const response = await fetch('/api/v1/faculty/executive/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ leaveId }),
      });

      if (!response.ok) {
        throw new Error('Approval failed');
      }

      const json = await response.json();
      if (json.success) {
        toast.success('Leave approved successfully');
        setPendingLeaves(pendingLeaves.filter(l => l.id !== leaveId));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve leave');
      console.error('Error approving leave:', err);
    } finally {
      setApproving(null);
    }
  };

  const handleRejectClick = (leaveId: number) => {
    setSelectedLeaveId(leaveId);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!selectedLeaveId) return;

    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setRejecting(selectedLeaveId);
    try {
      const response = await fetch('/api/v1/faculty/executive/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          leaveId: selectedLeaveId,
          rejectionReason,
        }),
      });

      if (!response.ok) {
        throw new Error('Rejection failed');
      }

      const json = await response.json();
      if (json.success) {
        toast.success('Leave rejected successfully');
        setPendingLeaves(pendingLeaves.filter(l => l.id !== selectedLeaveId));
        setShowRejectModal(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject leave');
      console.error('Error rejecting leave:', err);
    } finally {
      setRejecting(null);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Executive Approval Dashboard</h1>
          <p className="text-gray-600">
            Review and approve/reject leave requests exceeding 2 days
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-gray-600">Pending Approvals</div>
            <div className="text-2xl font-bold text-blue-600">{pendingLeaves.length}</div>
          </div>
        </div>

        {/* Pending Leaves List */}
        {pendingLeaves.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <p className="text-green-700 font-medium">No pending approvals</p>
            <p className="text-green-600 text-sm">All leave requests have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingLeaves.map(leave => (
              <div
                key={leave.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Applicant Info */}
                  <div>
                    <div className="text-sm text-gray-500">Applicant</div>
                    <div className="font-semibold text-gray-900">{leave.applicant_name}</div>
                    <div className="text-xs text-gray-500">{leave.applicant_email}</div>
                  </div>

                  {/* Leave Type */}
                  <div>
                    <div className="text-sm text-gray-500">Leave Type</div>
                    <div className="font-semibold text-gray-900">{leave.leave_type}</div>
                    <div className="text-xs text-gray-500">{leave.department}</div>
                  </div>

                  {/* Dates */}
                  <div>
                    <div className="text-sm text-gray-500">Leave Period</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(leave.start_date).toLocaleDateString()} to{' '}
                      {new Date(leave.end_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Total: {leave.total_days} days
                    </div>
                  </div>

                  {/* Approval Status */}
                  <div>
                    <div className="text-sm text-gray-500">Approval Progress</div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-gray-600">Substitute: {leave.substitute_status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-gray-600">Timetable: {leave.timetable_incharge_status}</span>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="bg-gray-50 p-3 rounded mb-4">
                  <div className="text-sm text-gray-500 mb-1">Reason</div>
                  <p className="text-gray-900 text-sm">{leave.reason}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(leave.id)}
                    disabled={approving === leave.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {approving === leave.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleRejectClick(leave.id)}
                    disabled={rejecting === leave.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {rejecting === leave.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Reject Leave Request</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason
              </label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger className="mb-3">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {rejectionReasons.map(reason => (
                    <SelectItem key={reason.id} value={reason.id}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Additional remarks (optional)"
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={rejecting !== null || !rejectionReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {rejecting !== null ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Confirm Rejection
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ExecutiveApprovalDashboard;
