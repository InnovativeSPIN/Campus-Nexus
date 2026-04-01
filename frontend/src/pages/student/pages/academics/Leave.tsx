import { useState, useEffect } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import Badge from '@/pages/student/components/common/Badge';
import Modal from '@/pages/student/components/common/Modal';
import { Plus, Calendar, Send, CheckCircle, Clock, XCircle, Download, Loader2, X } from 'lucide-react';
import { useToast } from '@/pages/student/hooks/use-toast';
import { formatDate } from '@/pages/student/utils/formatDate';
import { getMyLeaves, applyLeave, cancelLeave } from '@/pages/student/services/studentApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LeaveRequest {
  id: string | number;
  startDate: string;
  endDate: string;
  reason: string;
  totalDays: number;
  leaveType: string;
  leaveSubType?: string;
  recipient?: string;
  submitted_to?: string;
  attachment?: string;
  overall_status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  class_incharge_approval_status?: string;
  department_admin_approval_status?: string;
  createdAt: string;
  approvedBy?: { name: string };
  approvalDate?: string;
  approvalRemarks?: string;
}

export default function Leave() {
  const { toast } = useToast();
  console.log('[DEBUG-LEAVE] COMPONENT MOUNTED');
  
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('all');
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'Leave',
    leaveSubType: '',
    recipient: 'Class Incharge',
    attachment: null as File | null,
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      console.log('[DEBUG-LEAVE] Fetching leaves, token exists:', !!token);
      
      const res: any = await getMyLeaves();
      console.log('[DEBUG-LEAVE] Fetched data:', res);
      setLeaveRequests(res.data || []);
    } catch (error: any) {
      console.error('[DEBUG-LEAVE] Fetch Error:', error);
      toast({ title: 'Error', description: error.message || 'Failed to fetch leaves', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[DEBUG-LEAVE] useEffect running');
    fetchLeaves();
  }, []);

  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate || !formData.reason.trim() || !formData.leaveSubType) {
      toast({
        title: 'Validation Error',
        description: 'Start date, end date, reason, and sub-type are required.',
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

    try {
      setLoading(true);
      console.log('[DEBUG-LEAVE] Starting submission with data:', {
        ...formData,
        attachment: formData.attachment ? formData.attachment.name : null
      });

      const days = calculateDays(formData.startDate, formData.endDate);
      const submitData = new FormData();
      submitData.append('startDate', formData.startDate);
      submitData.append('endDate', formData.endDate);
      submitData.append('reason', formData.reason);
      submitData.append('leaveType', formData.leaveType);
      submitData.append('leaveSubType', formData.leaveSubType);
      submitData.append('recipient', formData.recipient);
      submitData.append('totalDays', String(days));

      if (formData.attachment) {
        submitData.append('attachment', formData.attachment);
      }

      const result = await applyLeave(submitData);
      console.log('[DEBUG-LEAVE] Result:', result);

      toast({
        title: 'Leave Request Submitted',
        description: `Your leave request for ${days} days has been submitted.`,
      });
      fetchLeaves();
      closeModal();
    } catch (error: any) {
      console.error('[DEBUG-LEAVE] Submission failed:', error);
      const errorMsg = error.error || error.message || 'Failed to submit leave';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      setLoading(true);
      await cancelLeave(id);
      toast({ title: 'Cancelled', description: 'Leave request cancelled successfully.' });
      fetchLeaves();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to cancel leave', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = (request: LeaveRequest) => {
    toast({
      title: 'Generating PDF',
      description: 'Please wait while we generate your leave certificate.',
    });

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Add College Header (Customize with actual college details later)
      doc.setFontSize(18);
      doc.setTextColor(0, 51, 102);
      doc.text('NADAR SARASWATHI COLLEGE OF', pageWidth / 2, 20, { align: 'center' });
      doc.text('ENGINEERING & TECHNOLOGY', pageWidth / 2, 28, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(100);
      doc.text('Leave Authorization Certificate', pageWidth / 2, 38, { align: 'center' });

      doc.setDrawColor(0, 51, 102);
      doc.setLineWidth(0.5);
      doc.line(14, 43, pageWidth - 14, 43);

      // Certificate content
      doc.setFontSize(11);
      doc.setTextColor(0);
      
      const submitDate = formatDate(request.createdAt);
      const approveDate = request.approvalDate ? formatDate(request.approvalDate) : 'N/A';
      
      let startY = 53;
      
      doc.setFont('', 'bold');
      doc.text('Application Details:', 14, startY);
      
      doc.setFont('', 'normal');
      startY += 10;
      doc.text(`Reference No: LEAVE-${new Date(request.createdAt).getFullYear()}-${request.id || Math.floor(Math.random() * 1000)}`, 14, startY);
      doc.text(`Submitted On: ${submitDate}`, pageWidth - 14, startY, { align: 'right' });
      
      startY += 10;
      
      // Create summary table
      autoTable(doc, {
        startY: startY,
        head: [['Leave Summary', 'Details']],
        body: [
          ['Leave Type', `${request.leaveType} ${request.leaveSubType ? `(${request.leaveSubType})` : ''}`],
          ['Reason', request.reason],
          ['From Date', formatDate(request.startDate)],
          ['To Date', formatDate(request.endDate)],
          ['Total Days', `${request.totalDays} Days`],
          ['Status', request.overall_status.toUpperCase()]
        ],
        theme: 'grid',
        headStyles: { fillColor: [0, 51, 102] },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
      });

      const finalY = (doc as any).lastAutoTable.finalY || startY + 50;
      
      // Approval details
      let approvalY = finalY + 15;
      doc.setFont('', 'bold');
      doc.text('Approval Information:', 14, approvalY);
      
      doc.setFont('', 'normal');
      approvalY += 10;
      doc.text(`Submitted To: ${request.submitted_to || 'Class Incharge'}`, 14, approvalY);
      
      approvalY += 10;
      doc.text(`Approved By: ${request.approvedBy?.name || 'Authorized Faculty'}`, 14, approvalY);
      doc.text(`Approval Date: ${approveDate}`, pageWidth - 14, approvalY, { align: 'right' });
      
      if (request.approvalRemarks) {
        approvalY += 10;
        doc.text(`Remarks: ${request.approvalRemarks}`, 14, approvalY);
      }
      
      // Signatures
      approvalY += 30;
      doc.setDrawColor(0);
      doc.line(14, approvalY, 64, approvalY);
      doc.text('Applicant Signature', 39, approvalY + 5, { align: 'center' });
      
      doc.line(pageWidth - 64, approvalY, pageWidth - 14, approvalY);
      doc.text('Authorized Signature', pageWidth - 39, approvalY + 5, { align: 'center' });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('This is a computer-generated document. No signature is required.', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });

      // Save PDF
      doc.save(`Leave_Certificate_${formatDate(request.startDate).replace(/ /g, '_')}.pdf`);
      
      toast({
        title: 'Download Complete',
        description: 'Your leave certificate has been downloaded successfully.',
        variant: 'default'
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Download Failed',
        description: 'There was an error generating the PDF certificate.',
        variant: 'destructive',
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      startDate: '',
      endDate: '',
      reason: '',
      leaveType: 'Leave',
      leaveSubType: '',
      recipient: 'Class Incharge',
      attachment: null as File | null,
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
      case 'cancelled':
        return 'info';
      default:
        return 'info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const filteredRequests = activeTab === 'all'
    ? leaveRequests
    : leaveRequests.filter(r => r.overall_status === activeTab);

  const stats = {
    pending: leaveRequests.filter(r => r.overall_status === 'pending').length,
    approved: leaveRequests.filter(r => r.overall_status === 'approved').length,
    rejected: leaveRequests.filter(r => r.overall_status === 'rejected').length,
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
        <div className="stat-card border border-border/50 group hover:border-warning/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <p className="text-2xl font-bold font-display">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="stat-card border border-border/50 group hover:border-success/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved Leaves</p>
              <p className="text-2xl font-bold font-display">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="stat-card border border-border/50 group hover:border-destructive/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected Requests</p>
              <p className="text-2xl font-bold font-display">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-border">
        {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((tab) => (
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
        {loading && !leaveRequests.length ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredRequests.length === 0 ? (
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
              className="section-card p-6 animate-slide-in shadow-sm border border-border/50 hover:shadow-md transition-shadow"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    {getStatusIcon(request.overall_status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">
                        {request.leaveType} Leave
                        {request.leaveSubType && <span className="text-sm font-normal text-muted-foreground ml-2">({request.leaveSubType})</span>}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(request.overall_status)}>
                          {request.overall_status.charAt(0).toUpperCase() + request.overall_status.slice(1)}
                        </Badge>
                        {request.overall_status === 'pending' && (
                          <button
                            onClick={() => handleCancel(request.id)}
                            className="px-3 py-1.5 text-sm font-medium text-destructive hover:text-white hover:bg-destructive transition-colors rounded-md border border-destructive/30 hover:border-destructive"
                            title="Cancel Request"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-3">{request.reason}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">From</p>
                        <p className="font-medium">{formatDate(request.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">To</p>
                        <p className="font-medium">{formatDate(request.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Days</p>
                        <p className="font-medium font-mono text-primary">{request.totalDays} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Submitted To</p>
                        <p className="font-medium">{request.submitted_to || 'Class Incharge'}</p>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-lg">
                      <p>Submitted on: {formatDate(request.createdAt)}</p>
                      {request.approvalDate && (
                        <>
                          <p>
                            {request.overall_status === 'approved' ? 'Approved' : 'Reviewed'} by:{' '}
                            <span className="font-semibold text-foreground">{request.approvedBy?.name || 'Faculty Member'}</span>
                          </p>
                          <p>
                            {request.overall_status === 'approved' ? 'Approved' : 'Reviewed'} on:{' '}
                            {formatDate(request.approvalDate)}
                          </p>
                        </>
                      )}
                      {request.approvalRemarks && (
                        <div className="mt-2 text-foreground">
                          <span className="font-semibold text-muted-foreground">Remarks:</span> {request.approvalRemarks}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {request.overall_status === 'approved' && (
                  <button
                    onClick={() => handleDownloadCertificate(request)}
                    className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Download</span>
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
        title="Apply for Leave"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto px-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">From Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">To Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input-field w-full"
              />
            </div>
          </div>

          {formData.startDate && formData.endDate && (
            <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
              <p className="text-sm font-medium text-primary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Total Duration: {calculateDays(formData.startDate, formData.endDate)} days
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Submit To *</label>
              <select
                required
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                className="input-field w-full cursor-pointer"
              >
                <option value="Class Incharge">Class Incharge</option>
                <option value="Faculty Advisor">Mentor</option>
                <option value="HOD">Head of Department (HOD)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Leave Type *</label>
              <select
                required
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="input-field w-full cursor-pointer"
              >
                <option value="Leave">Leave</option>
                <option value="On-Duty">On-Duty</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Reason for Leave *</label>
            <textarea
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input-field w-full resize-none min-h-[100px]"
              placeholder="Please provide a clear reason for your leave request..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Leave Sub-Type *</label>
              <select
                required
                value={formData.leaveSubType}
                onChange={(e) => setFormData({ ...formData, leaveSubType: e.target.value })}
                className="input-field w-full cursor-pointer"
              >
                <option value="">Select Sub-Type</option>
                {formData.leaveType === 'Leave' && (
                  <>
                    <option value="Medical Leave">Medical Leave</option>
                    <option value="Personal Leave">Personal Leave</option>
                  </>
                )}
                {formData.leaveType === 'On-Duty' && (
                  <>
                    <option value="Seminar">Seminar</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Competition">Competition</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Upload Document (Optional)</label>
              <input
                type="file"
                onChange={(e) => setFormData({ ...formData, attachment: e.target.files?.[0] || null })}
                className="input-field w-full py-1.5"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Accepts PDF, JPG, PNG (Max 5MB)</p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              disabled={loading}
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 shadow-lg shadow-primary/20 w-full sm:w-auto"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


