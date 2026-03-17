import { useState, useEffect } from "react";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Input } from "@/pages/faculty/components/ui/input";
import { Label } from "@/pages/faculty/components/ui/label";
import { Textarea } from "@/pages/faculty/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/faculty/components/ui/tabs";
import {
  CalendarDays, PlusCircle, Clock, CheckCircle2, XCircle, AlertCircle, FileText,
  Calendar, User, Trash2, Wallet, Users, CheckIcon, XIcon, RefreshCw
} from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";
import { toast } from "sonner";
import { Select as ShadSelect, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue } from "@/components/ui/select";

interface Faculty {
  faculty_id: number;
  Name: string;
  email: string;
  phone_number?: string;
  designation?: string;
  matching_subjects?: number;
  subjects?: Array<{
    subject_id: number;
    subject_name: string;
    subject_code: string;
  }>;
}

interface LeaveRequest {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  overall_status: string;
  substitute_faculty_id?: number;
  substitute_approval_status?: string;
  timetable_incharge_approval_status?: string;
  executive_admin_approval_status?: string;
  substitute_rejection_reason?: string;
  timetable_incharge_rejection_reason?: string;
  executive_admin_rejection_reason?: string;
  createdAt: string;
  substituteFaculty?: Faculty;
  timetableIncharge?: Faculty;
  executiveAdmin?: Faculty;
  affected_periods?: any[];
}

interface AffectedPeriod {
  date: string;
  period_slot_id: number;
  class_id?: number;
  subject_id?: number;
  master_id?: number;
  requested_substitute_faculty_id?: number;
}

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  substitute_pending: { label: "Pending Substitute Approval", icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  substitute_approved: { label: "Substitute Approved", icon: CheckCircle2, color: "text-info", bg: "bg-info/10" },
  substitute_rejected: { label: "Substitute Rejected", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  timetable_pending: { label: "Pending Timetable Application", icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  timetable_approved: { label: "Timetable Approved", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  executive_pending: { label: "Pending Executive Approval", icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  approved: { label: "Approved", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  cancelled: { label: "Cancelled", icon: AlertCircle, color: "text-secondary", bg: "bg-secondary/10" },
};

const leaveTypes = ["Medical", "Casual", "Earned", "On-Duty", "Personal", "Maternity", "Comp-Off"];

export default function FacultyLeaveManagement() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [colleagues, setColleagues] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slotDetailsLoading, setSlotDetailsLoading] = useState<{[key: number]: boolean}>({});
  const [slotDetails, setSlotDetails] = useState<{[key: number]: any}>({});
  const [activeTab, setActiveTab] = useState("apply");

  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    substitute_faculty_id: "",
    affected_periods: [] as AffectedPeriod[],
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchMyLeaves();
    fetchColleagues();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/v1/faculty/leave-request/my-applications", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json();
      if (result.success) {
        setMyLeaves(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast.error("Failed to load leaves");
    } finally {
      setLoading(false);
    }
  };

  const fetchColleagues = async () => {
    try {
      const token = localStorage.getItem("authToken");
      console.log('[fetchColleagues] Starting fetch with token:', !!token);
      const res = await fetch("/api/v1/faculty/leave-management/colleagues?debug=true", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      console.log('[fetchColleagues] Response status:', res.status);
      const result = await res.json();
      console.log('[fetchColleagues] Response data:', result);
      if (result.success) {
        console.log('[fetchColleagues] Setting colleagues:', result.data);
        setColleagues(result.data || []);
      } else {
        console.warn('[fetchColleagues] Success is false:', result);
      }
    } catch (error) {
      console.error("Error fetching colleagues:", error);
      toast.error("Failed to load substitute faculty");
    }
  };

  const fetchSlotDetailsForPeriod = async (index: number, date: string, periodSlotId: number) => {
    if (!date || !periodSlotId) return;

    try {
      setSlotDetailsLoading({ ...slotDetailsLoading, [index]: true });
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/v1/faculty/leave-request/slot-details?date=${date}&period_slot_id=${periodSlotId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await res.json();
      if (result.success && result.data) {
        setSlotDetails({ ...slotDetails, [index]: result.data });
      } else if (result.success && !result.data) {
        setSlotDetails({ ...slotDetails, [index]: null });
      }
    } catch (error) {
      console.error("Error fetching slot details:", error);
      toast.error("Failed to fetch slot details");
    } finally {
      setSlotDetailsLoading({ ...slotDetailsLoading, [index]: false });
    }
  };

  const handleCalculateTotalDays = () => {
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (start && end && end >= start) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return totalDays.toString();
    }
    return "0";
  };

  const handleAddAffectedPeriod = () => {
    const newPeriod: AffectedPeriod = {
      date: "",
      period_slot_id: 0,
      class_id: 0,
      subject_id: 0,
      master_id: 0,
      requested_substitute_faculty_id: parseInt(form.substitute_faculty_id),
    };
    setForm({
      ...form,
      affected_periods: [...form.affected_periods, newPeriod],
    });
  };

  const handleUpdateAffectedPeriod = (index: number, field: string, value: any) => {
    const updated = [...form.affected_periods];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, affected_periods: updated });

    // Fetch slot details if date or period is changed
    if ((field === 'date' || field === 'period_slot_id') && updated[index].date && updated[index].period_slot_id) {
      fetchSlotDetailsForPeriod(index, updated[index].date, updated[index].period_slot_id);
    }
  };

  const handleRemoveAffectedPeriod = (index: number) => {
    setForm({
      ...form,
      affected_periods: form.affected_periods.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.leaveType || !form.startDate || !form.endDate || !form.reason || !form.substitute_faculty_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (form.affected_periods.length === 0) {
      toast.error("Please specify at least one affected period");
      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken");

      const payload = {
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        substitute_faculty_id: parseInt(form.substitute_faculty_id),
        affected_periods: form.affected_periods,
      };

      const response = await fetch("/api/v1/faculty/leave-request/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Leave request submitted! Waiting for substitute faculty approval.");
        setForm({
          leaveType: "",
          startDate: "",
          endDate: "",
          reason: "",
          substitute_faculty_id: "",
          affected_periods: [],
        });
        setActiveTab("status");
        fetchMyLeaves();
      } else {
        toast.error(result.error || "Failed to submit leave request");
      }
    } catch (error) {
      console.error("Error submitting leave:", error);
      toast.error("Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (leaveId: number) => {
    if (!confirm("Are you sure you want to withdraw this request?")) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/v1/faculty/leave-request/${leaveId}/withdraw`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Leave request withdrawn");
        fetchMyLeaves();
      } else {
        toast.error(result.error || "Failed to withdraw request");
      }
    } catch (error) {
      console.error("Error withdrawing request:", error);
      toast.error("Failed to withdraw request");
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

  const getStatusConfig = (status: string) => statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <MainLayout hideHeader={true}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-serif">Leave Management</h1>
            <p className="text-muted-foreground">Apply for leave with timetable alteration</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(currentTime.toISOString())}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="apply">Apply Leave</TabsTrigger>
            <TabsTrigger value="status">My Applications</TabsTrigger>
          </TabsList>

          {/* Apply Leave Tab */}
          <TabsContent value="apply" className="mt-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-6 shadow-sm"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2">New Leave Request</h2>
                  <p className="text-sm text-muted-foreground">
                    Submit a leave request with timetable alteration request for a substitute faculty
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Leave Type */}
                  <div className="space-y-2">
                    <Label className="font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Leave Type *
                    </Label>
                    <ShadSelect value={form.leaveType} onValueChange={(value) => setForm({ ...form, leaveType: value })}>
                      <ShadSelectTrigger>
                        <ShadSelectValue placeholder="Select leave type" />
                      </ShadSelectTrigger>
                      <ShadSelectContent>
                        {leaveTypes.map((type) => (
                          <ShadSelectItem key={type} value={type}>
                            {type}
                          </ShadSelectItem>
                        ))}
                      </ShadSelectContent>
                    </ShadSelect>
                  </div>

                  {/* Substitute Faculty */}
                  <div className="space-y-2">
                    <Label className="font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Substitute Faculty *
                    </Label>
                    <ShadSelect value={form.substitute_faculty_id} onValueChange={(value) => setForm({ ...form, substitute_faculty_id: value })}>
                      <ShadSelectTrigger>
                        <ShadSelectValue placeholder="Select substitute faculty" />
                      </ShadSelectTrigger>
                      <ShadSelectContent>
                        {colleagues.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No matching faculty found for your assigned classes
                          </div>
                        ) : (
                          colleagues.map((colleague) => (
                            <ShadSelectItem key={colleague.faculty_id} value={colleague.faculty_id.toString()}>
                              <div className="flex items-center gap-2">
                                <span>{colleague.Name}</span>
                                {colleague.matching_subjects && colleague.matching_subjects > 0 && (
                                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                    {colleague.matching_subjects} {colleague.matching_subjects === 1 ? 'subject' : 'subjects'}
                                  </span>
                                )}
                              </div>
                            </ShadSelectItem>
                          ))
                        )}
                      </ShadSelectContent>
                    </ShadSelect>
                    {colleagues.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Showing faculty who teach your assigned classes
                      </p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label className="font-medium flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      Start Date *
                    </Label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label className="font-medium flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      End Date *
                    </Label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Total Days Info */}
                {form.startDate && form.endDate && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-primary">Total Days: {handleCalculateTotalDays()} days</p>
                      {parseInt(handleCalculateTotalDays()) > 2 && (
                        <p className="text-sm text-primary/70">
                          This leave requires executive admin approval (more than 2 days)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div className="space-y-2">
                  <Label className="font-medium">Reason for Leave *</Label>
                  <Textarea
                    placeholder="Explain the reason for your leave"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="min-h-24"
                  />
                </div>

                {/* Affected Periods */}
                <div className="space-y-4 bg-secondary/5 border border-secondary/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Affected Periods *
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddAffectedPeriod}
                      disabled={form.affected_periods.length >= 10}
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Period
                    </Button>
                  </div>

                  {form.affected_periods.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No periods added yet. Click "Add Period" to specify affected class periods.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {form.affected_periods.map((period, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-card p-4 rounded-lg border border-border space-y-3"
                        >
                          <div className="flex items-end gap-3">
                            <div className="flex-1">
                              <Label className="text-xs">Date</Label>
                              <Input
                                type="date"
                                value={period.date}
                                onChange={(e) => handleUpdateAffectedPeriod(index, "date", e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs">Period Slot ID</Label>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                value={period.period_slot_id || ""}
                                onChange={(e) => {
                                  const val = e.target.value ? parseInt(e.target.value) : 0;
                                  handleUpdateAffectedPeriod(index, "period_slot_id", val);
                                }}
                                className="mt-1"
                                placeholder="1-10"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAffectedPeriod(index)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Slot Details Section */}
                          {slotDetailsLoading[index] && (
                            <div className="bg-primary/5 border border-primary/20 rounded p-3 flex items-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                              <span className="text-sm text-primary">Loading slot details...</span>
                            </div>
                          )}

                          {!slotDetailsLoading[index] && slotDetails[index] && (
                            <div className="bg-success/5 border border-success/20 rounded p-3 space-y-2">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground text-xs">Subject</p>
                                  <p className="font-medium">{slotDetails[index].subject?.name || "N/A"}</p>
                                  {slotDetails[index].subject?.code && (
                                    <p className="text-xs text-muted-foreground">{slotDetails[index].subject.code}</p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Class</p>
                                  <p className="font-medium">{slotDetails[index].class?.name || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Time</p>
                                  <p className="font-medium">{slotDetails[index].start_time} - {slotDetails[index].end_time}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Room</p>
                                  <p className="font-medium">{slotDetails[index].room || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {!slotDetailsLoading[index] && slotDetails[index] === null && period.date && period.period_slot_id && (
                            <div className="bg-warning/5 border border-warning/20 rounded p-3 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-warning" />
                              <span className="text-sm text-warning">No slot found for this day and period</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm({
                      leaveType: "",
                      startDate: "",
                      endDate: "",
                      reason: "",
                      substitute_faculty_id: "",
                      affected_periods: [],
                    })}
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        Submit Leave Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </TabsContent>

          {/* My Applications Tab */}
          <TabsContent value="status" className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading applications...</p>
              </div>
            ) : myLeaves.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-3">No leave applications yet</p>
                <Button onClick={() => setActiveTab("apply")} variant="outline" size="sm">
                  Apply for Leave
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {myLeaves.map((leave) => {
                  const config = getStatusConfig(leave.overall_status);
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={leave.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "bg-card border rounded-lg p-5 transition-all hover:shadow-md",
                        config.bg,
                        "border-border"
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className={cn("w-5 h-5", config.color)} />
                            <h3 className="font-semibold text-lg">{leave.leaveType}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{leave.reason}</p>
                        </div>
                        <span className={cn("text-sm font-medium px-3 py-1 rounded-full", config.bg, config.color)}>
                          {config.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p className="font-medium">{formatDate(leave.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">End Date</p>
                          <p className="font-medium">{formatDate(leave.endDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Days</p>
                          <p className="font-medium">{leave.totalDays}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Substitute</p>
                          <p className="font-medium">{leave.substituteFaculty?.Name || "—"}</p>
                        </div>
                      </div>

                      {/* Workflow Status */}
                      <div className="mb-4 space-y-2 text-sm">
                        {leave.overall_status !== 'cancelled' && (
                          <>
                            <div className="flex items-center gap-2">
                              {['substitute_pending', 'substitute_approved', 'substitute_rejected', 'timetable_pending', 'timetable_approved', 'executive_pending', 'approved', 'rejected'].includes(leave.overall_status) ? (
                                <CheckIcon className="w-4 h-4 text-success" />
                              ) : (
                                <Clock className="w-4 h-4 text-warning" />
                              )}
                              <span>
                                Substitute Faculty {leave.substitute_approval_status === 'approved' ? '✓ Approved' : leave.substitute_approval_status === 'rejected' ? '✗ Rejected' : '- Pending'}
                              </span>
                            </div>

                            {leave.overall_status !== 'substitute_pending' && leave.overall_status !== 'substitute_rejected' && (
                              <div className="flex items-center gap-2">
                                {['timetable_approved', 'timetable_pending', 'executive_pending', 'approved', 'rejected'].includes(leave.overall_status) ? (
                                  <CheckIcon className="w-4 h-4 text-success" />
                                ) : (
                                  <Clock className="w-4 h-4 text-warning" />
                                )}
                                <span>
                                  Timetable Incharge {leave.timetable_incharge_approval_status === 'approved' ? '✓ Applied' : '- Pending'}
                                </span>
                              </div>
                            )}

                            {['executive_pending', 'approved', 'rejected'].includes(leave.overall_status) && leave.totalDays > 2 && (
                              <div className="flex items-center gap-2">
                                {leave.overall_status === 'approved' ? (
                                  <CheckIcon className="w-4 h-4 text-success" />
                                ) : leave.overall_status === 'rejected' ? (
                                  <XIcon className="w-4 h-4 text-destructive" />
                                ) : (
                                  <Clock className="w-4 h-4 text-warning" />
                                )}
                                <span>
                                  Executive Admin {leave.executive_admin_approval_status === 'approved' ? '✓ Approved' : leave.executive_admin_approval_status === 'rejected' ? '✗ Rejected' : '- Pending'}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Rejection Reasons */}
                      {leave.substitute_rejection_reason && (
                        <div className="bg-destructive/10 border border-destructive/30 rounded p-3 mb-4 text-sm">
                          <p className="font-medium text-destructive">Substitute Rejection Reason:</p>
                          <p className="text-destructive/80">{leave.substitute_rejection_reason}</p>
                        </div>
                      )}

                      {leave.executive_admin_rejection_reason && (
                        <div className="bg-destructive/10 border border-destructive/30 rounded p-3 mb-4 text-sm">
                          <p className="font-medium text-destructive">Executive Admin Rejection Reason:</p>
                          <p className="text-destructive/80">{leave.executive_admin_rejection_reason}</p>
                        </div>
                      )}

                      {/* Actions */}
                      {['pending', 'substitute_pending'].includes(leave.overall_status) && (
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleWithdraw(leave.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Withdraw
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
}
