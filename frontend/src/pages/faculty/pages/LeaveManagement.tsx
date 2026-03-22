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
  Calendar, Trash2, Wallet, Users, CheckIcon, XIcon, RefreshCw, Search
} from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";
import { toast } from '@/components/ui/sonner';
import { Select as ShadSelect, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue } from "@/components/ui/select";

interface Faculty {
  faculty_id: number;
  name: string;
  email: string;
  phone_number?: string;
  designation?: string;
  department_id?: number;
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

interface Period {
  id: number;
  date: string;
  day: string;
  period_number: number;
  start_time: string;
  end_time: string;
  type: string;
  subject?: {
    id: number;
    code: string;
    name: string;
  };
  class?: {
    id: number;
    name: string;
    semester: number;
  };
  academic_year: string;
  semester: number;
}

interface PeriodWithFaculty {
  period: Period;
  alternative_faculty: Faculty[];
  selected_faculty_id?: number;
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
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("apply");

  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [periodsWithFaculty, setPeriodsWithFaculty] = useState<PeriodWithFaculty[]>([]);
  const [fetchingPeriods, setFetchingPeriods] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchMyLeaves();
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

  const fetchPeriodsForDateRange = async () => {
    if (!form.startDate || !form.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    try {
      setFetchingPeriods(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/v1/faculty/leave-request/periods-for-dates?startDate=${form.startDate}&endDate=${form.endDate}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        // Fetch alternative faculty for these periods
        await fetchAlternativeFaculty(result.data);
        toast.success(`Found ${result.data.length} class periods`);
      } else {
        toast.error("No class periods found for the selected date range");
        setPeriodsWithFaculty([]);
      }
    } catch (error) {
      console.error("Error fetching periods:", error);
      toast.error("Failed to fetch class periods");
    } finally {
      setFetchingPeriods(false);
    }
  };

  const fetchAlternativeFaculty = async (periods: Period[]) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/v1/faculty/leave-request/alternative-faculty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ periods }),
      });
      const result = await response.json();

      if (result.success) {
        setPeriodsWithFaculty(result.data || []);
      } else {
        toast.error("Failed to fetch alternative faculty");
      }
    } catch (error) {
      console.error("Error fetching alternative faculty:", error);
      toast.error("Failed to fetch alternative faculty");
    }
  };

  const handleSelectFaculty = (periodIndex: number, facultyId: number) => {
    const updated = [...periodsWithFaculty];
    updated[periodIndex].selected_faculty_id = facultyId;
    setPeriodsWithFaculty(updated);
  };

  const calculateTotalDays = () => {
    if (!form.startDate || !form.endDate) return "0";
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return totalDays.toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.leaveType || !form.startDate || !form.endDate || !form.reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if all periods have selected faculty
    const unselected = periodsWithFaculty.filter(p => !p.selected_faculty_id);
    if (unselected.length > 0) {
      toast.error("Please select alternative faculty for all periods");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken");

      // Prepare affected_periods with selected faculty
      const affected_periods = periodsWithFaculty.map(p => ({
        date: p.period.date,
        period_slot_id: p.period.period_number,
        class_id: p.period.class?.id,
        subject_id: p.period.subject?.id,
        master_id: p.period.id,
        requested_substitute_faculty_id: p.selected_faculty_id,
      }));

      const payload = {
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        substitute_faculty_id: periodsWithFaculty[0]?.selected_faculty_id, // Use first selected faculty
        affected_periods,
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
        toast.success("Leave request submitted successfully!");
        setForm({
          leaveType: "",
          startDate: "",
          endDate: "",
          reason: "",
        });
        setPeriodsWithFaculty([]);
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

  const formatTime = (time: string) => {
    if (!time) return "";
    return time.substring(0, 5); // HH:MM format
  };

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
            <p className="text-muted-foreground">Apply for leave with automatic alternative faculty assignment</p>
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
                    Enter your leave dates, and we'll automatically assign alternative faculty to cover your classes
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

                  {/* Total Days Info */}
                  {form.startDate && form.endDate && (
                    <div className="space-y-2">
                      <Label className="font-medium flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        Total Days
                      </Label>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-3">
                        <p className="font-semibold text-primary">{calculateTotalDays()} days</p>
                        {parseInt(calculateTotalDays()) > 2 && (
                          <p className="text-xs text-primary/70">
                            Requires executive admin approval
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label className="font-medium flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      Start Date *
                    </Label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => {
                        setForm({ ...form, startDate: e.target.value });
                        setPeriodsWithFaculty([]);
                      }}
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
                      onChange={(e) => {
                        setForm({ ...form, endDate: e.target.value });
                        setPeriodsWithFaculty([]);
                      }}
                    />
                  </div>
                </div>

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

                {/* Fetch Periods Button */}
                {form.startDate && form.endDate && !fetchingPeriods && periodsWithFaculty.length === 0 && (
                  <div className="flex justify-center pt-4">
                    <Button
                      type="button"
                      onClick={fetchPeriodsForDateRange}
                      className="gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Find Classes & Alternative Faculty
                    </Button>
                  </div>
                )}

                {fetchingPeriods && (
                  <div className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-muted-foreground">Fetching your classes and finding alternative faculty...</p>
                  </div>
                )}

                {/* Periods with Faculty Selection */}
                {periodsWithFaculty.length > 0 && (
                  <div className="space-y-4 bg-secondary/5 border border-secondary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Select Alternative Faculty ({periodsWithFaculty.length} classes)
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPeriodsWithFaculty([]);
                          setForm({ ...form, startDate: "", endDate: "" });
                        }}
                      >
                        Change Dates
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {periodsWithFaculty.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-card border border-border rounded-lg p-4 space-y-3"
                        >
                          {/* Period Info */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs">Date</p>
                              <p className="font-medium">{formatDate(item.period.date)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Period</p>
                              <p className="font-medium">{formatTime(item.period.start_time)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Subject</p>
                              <p className="font-medium">{item.period.subject?.name || "—"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Class</p>
                              <p className="font-medium">{item.period.class?.name || "—"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Room</p>
                              <p className="font-medium">{item.period.type || "—"}</p>
                            </div>
                          </div>

                          {/* Faculty Selection */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Select Alternative Faculty *</Label>
                            {item.alternative_faculty.length === 0 ? (
                              <div className="bg-warning/10 border border-warning/30 rounded p-3 text-sm">
                                <p className="text-warning">No alternative faculty available for this subject-class combination</p>
                              </div>
                            ) : (
                              <ShadSelect
                                value={item.selected_faculty_id?.toString() || ""}
                                onValueChange={(value) => handleSelectFaculty(index, parseInt(value))}
                              >
                                <ShadSelectTrigger>
                                  <ShadSelectValue placeholder="Select a faculty member" />
                                </ShadSelectTrigger>
                                <ShadSelectContent>
                                  {item.alternative_faculty.map((faculty) => (
                                    <ShadSelectItem key={faculty.faculty_id} value={faculty.faculty_id.toString()}>
                                      <div className="flex items-center gap-2">
                                        <span>{faculty.name}</span>
                                        {faculty.designation && (
                                          <span className="text-xs text-muted-foreground">({faculty.designation})</span>
                                        )}
                                      </div>
                                    </ShadSelectItem>
                                  ))}
                                </ShadSelectContent>
                              </ShadSelect>
                            )}
                          </div>

                          {/* Selected Faculty Info */}
                          {item.selected_faculty_id && (
                            <div className="bg-success/10 border border-success/20 rounded p-3 flex items-center gap-2">
                              <CheckIcon className="w-4 h-4 text-success" />
                              <span className="text-sm text-success font-medium">
                                {item.alternative_faculty.find(f => f.faculty_id === item.selected_faculty_id)?.name} selected
                              </span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setForm({
                        leaveType: "",
                        startDate: "",
                        endDate: "",
                        reason: "",
                      });
                      setPeriodsWithFaculty([]);
                    }}
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || periodsWithFaculty.length === 0}
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
                          <p className="text-muted-foreground">Assigned Faculty</p>
                      <p className="font-medium">{leave.substituteFaculty?.name || "—"}</p>
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
                                Alternative Faculty {leave.substitute_approval_status === 'approved' ? '✓ Approved' : leave.substitute_approval_status === 'rejected' ? '✗ Rejected' : '- Pending'}
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
                          <p className="font-medium text-destructive">Alternative Faculty Rejection Reason:</p>
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
