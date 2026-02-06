import { useState } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import Badge from '@/pages/student/components/common/Badge';
import Modal from '@/pages/student/components/common/Modal';
import { Plus, Calendar, Send, CheckCircle, Clock, XCircle, Download } from 'lucide-react';
import { useToast } from '@/pages/student/hooks/use-toast';
import { formatDate } from '@/pages/student/utils/formatDate';

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  days: number;
  type: string;
  recipient: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedOn: string;
  approvedBy?: string;
  approvedOn?: string;
  remarks?: string;
}

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    startDate: '2024-02-10',
    endDate: '2024-02-12',
    reason: 'Medical appointment',
    days: 3,
    type: 'Medical',
    recipient: 'Class Incharge',
    status: 'approved',
    submittedOn: '2024-02-05',
    approvedBy: 'Prof. Anjali Sharma',
    approvedOn: '2024-02-06',
    remarks: 'Approved. Provide medical certificate if needed.',
  },
  {
    id: '2',
    startDate: '2024-02-20',
    endDate: '2024-02-22',
    reason: 'Family emergency',
    days: 3,
    type: 'Personal',
    recipient: 'Class Incharge',
    status: 'pending',
    submittedOn: '2024-02-18',
  },
  {
    id: '3',
    startDate: '2024-01-25',
    endDate: '2024-01-27',
    reason: 'Semester exam preparation clash',
    days: 3,
    type: 'Academic',
    recipient: 'Class Incharge',
    status: 'rejected',
    submittedOn: '2024-01-20',
    approvedBy: 'Prof. Anjali Sharma',
    approvedOn: '2024-01-21',
    remarks: 'Cannot approve during examination period.',
  },
];

export default function Leave() {
  const { toast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('all');
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'On-duty',
    leaveSubType: '',
    imageFile: null as File | null,
    recipient: 'Class Incharge',
  });

  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Start date, end date, and reason are required.',
        variant: 'destructive',
      });
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (startDate > endDate) {
      toast({
        title: 'Validation Error',
        description: 'End date must be after start date.',
        variant: 'destructive',
      });
      return;
    }

    const days = calculateDays(formData.startDate, formData.endDate);
    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      days,
      type: formData.type,
      recipient: formData.recipient,
      status: 'pending',
      submittedOn: new Date().toISOString().split('T')[0],
    };

    setLeaveRequests([newRequest, ...leaveRequests]);
    toast({
      title: 'Leave Request Submitted',
      description: `Your leave request for ${days} days has been submitted to Class Incharge.`,
    });

    closeModal();
  };

  const handleDownloadCertificate = (id: string) => {
    toast({
      title: 'Download Started',
      description: 'Leave certificate is being downloaded.',
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      startDate: '',
      endDate: '',
      reason: '',
      type: 'On-duty',
      leaveSubType: '',
      imageFile: null,
      recipient: 'Class Incharge',
    });
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const filteredRequests = activeTab === 'all'
    ? leaveRequests
    : leaveRequests.filter(r => r.status === activeTab);

  const stats = {
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    rejected: leaveRequests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Leave Management"
        subtitle="Request and manage your leave"
        breadcrumbs={[
          { label: 'Leave' },
        ]}
        actions={
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Request Leave
          </button>
        }
      />


      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold font-display">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold font-display">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold font-display">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-border">
        {['all', 'pending', 'approved', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === tab
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Leave Requests */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <SectionCard title="Leave Requests">
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No leave requests found</p>
            </div>
          </SectionCard>
        ) : (
          filteredRequests.map((request, index) => (
            <div
              key={request.id}
              className="section-card p-6 animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    {getStatusIcon(request.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{request.type} Leave</h3>
                      <Badge variant={getStatusVariant(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mb-3">{request.reason}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-muted-foreground text-xs">From</p>
                        <p className="font-medium">{formatDate(request.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">To</p>
                        <p className="font-medium">{formatDate(request.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Days</p>
                        <p className="font-medium">{request.days} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Submitted To</p>
                        <p className="font-medium">{request.recipient}</p>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Submitted on: {formatDate(request.submittedOn)}</p>
                      {request.approvedOn && (
                        <>
                          <p>
                            {request.status === 'approved' ? 'Approved' : 'Reviewed'} by:{' '}
                            {request.approvedBy}
                          </p>
                          <p>
                            {request.status === 'approved' ? 'Approved' : 'Reviewed'} on:{' '}
                            {formatDate(request.approvedOn)}
                          </p>
                        </>
                      )}
                      {request.remarks && (
                        <p className="text-foreground mt-2">Remarks: {request.remarks}</p>
                      )}
                    </div>
                  </div>
                </div>

                {request.status === 'approved' && (
                  <button
                    onClick={() => handleDownloadCertificate(request.id)}
                    className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Download</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request Leave Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Request Leave"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">From Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">To Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {formData.startDate && formData.endDate && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                Total Days: {calculateDays(formData.startDate, formData.endDate)} days
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Leave Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value, leaveSubType: '', imageFile: null })}
              className="input-field"
            >
              <option value="Leave">Leave</option>
              <option value="On-duty">On-duty</option>
            </select>
          </div>

          {/* Conditional Leave Sub-Type Dropdown */}
          {formData.type === 'Leave' && (
            <div>
              <label className="block text-sm font-medium mb-2">Leave Sub-Type *</label>
              <select
                value={formData.leaveSubType}
                onChange={(e) => setFormData({ ...formData, leaveSubType: e.target.value, imageFile: null })}
                className="input-field"
              >
                <option value="">Select Leave Sub-Type</option>
                <option value="Medical Leave">Medical Leave</option>
                <option value="Personal Leave">Personal Leave</option>
              </select>
            </div>
          )}

          {/* Conditional Image Upload for Medical Leave */}
          {formData.type === 'Leave' && formData.leaveSubType === 'Medical Leave' && (
            <div>
              <label className="block text-sm font-medium mb-2">Medical Certificate *</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFormData({ ...formData, imageFile: e.target.files?.[0] || null })}
                className="input-field"
                placeholder="Upload your medical certificate"
              />
              {formData.imageFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {formData.imageFile.name}
                </p>
              )}
            </div>
          )}

          {/* Conditional Image Upload for Personal Leave */}
          {formData.type === 'Leave' && formData.leaveSubType === 'Personal Leave' && (
            <div>
              <label className="block text-sm font-medium mb-2">Leave Letter *</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFormData({ ...formData, imageFile: e.target.files?.[0] || null })}
                className="input-field"
                placeholder="Upload leave letter"
              />
              {formData.imageFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {formData.imageFile.name}
                </p>
              )}
            </div>
          )}

          {/* Conditional Image Upload for On-duty */}
          {formData.type === 'On-duty' && (
            <div>
              <label className="block text-sm font-medium mb-2">On-duty Letter *</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFormData({ ...formData, imageFile: e.target.files?.[0] || null })}
                className="input-field"
                placeholder="Upload on-duty letter"
              />
              {formData.imageFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {formData.imageFile.name}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Reason *</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input-field resize-none"
              rows={3}
              placeholder={formData.type === 'On-duty' ? 'Type of Events / category of sports' : 'Enter the reason for leave'}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Send className="w-4 h-4" />
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


