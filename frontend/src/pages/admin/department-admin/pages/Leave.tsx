import { useState, useEffect } from "react";
import { MainLayout } from "@/pages/admin/department-admin/components/layout/MainLayout";
import { LeaveApprovals } from "@/pages/admin/department-admin/components/LeaveApprovals";
import { motion } from "framer-motion";
import { Button } from "@/pages/admin/department-admin/components/ui/button";
import { Input } from "@/pages/admin/department-admin/components/ui/input";
import { Label } from "@/pages/admin/department-admin/components/ui/label";
import { Textarea } from "@/pages/admin/department-admin/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/pages/admin/department-admin/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/admin/department-admin/components/ui/tabs";
import {
  CalendarDays,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  FileText,
  ArrowRight,
  Wallet,
  Trash2,
  UserCheck,
} from "lucide-react";
import { cn } from "@/pages/admin/department-admin/lib/utils";
import { toast } from "@/pages/admin/department-admin/hooks/use-toast";

interface LeaveRequest {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: string;
  approvalRemarks?: string;
  reassignFacultyName?: string;
}

interface Colleague {
  faculty_id: number;
  Name: string;
  designation: string;
}

interface LeaveBalance {
  total_allowed: number;
  used_leaves: number;
  remaining_leaves: number;
}

interface LeaveBalanceMap {
  [leaveType: string]: LeaveBalance;
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
  },
  hod_approved: {
    label: "HOD Approved",
    icon: UserCheck,
    color: "text-blue-500", // using blue for intermediate
    bg: "bg-blue-100",
    border: "border-blue-200",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
  },
  cancelled: {
    label: "Cancelled",
    icon: AlertCircle,
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "border-secondary/30",
  },
};

export default function Leave() {
  const [activeTab, setActiveTab] = useState("approvals");
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalanceMap>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    loadAssign: "",
    reassignFacultyId: "",
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMyLeaves();
    fetchColleagues();
    fetchLeaveBalances();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/v1/leave/my-leaves", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await res.json();
      if (result.success) setMyLeaves(result.data || []);
    } catch (e) {
      console.error("Error fetching leaves:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchColleagues = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/v1/faculty/me/department-colleagues", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await res.json();
      if (result.success) setColleagues(result.data || []);
    } catch { }
  };

  const fetchLeaveBalances = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/v1/leave/balance", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await res.json();
      if (result.success && result.data) setLeaveBalances(result.data);
    } catch { }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this leave application?")) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/v1/leave/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await res.json();
      if (result.success) {
        toast({ title: "Leave application deleted." });
        fetchMyLeaves();
      } else {
        toast({ title: result.error || "Failed to delete", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to delete leave application", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.leaveType || !form.startDate || !form.endDate || !form.reason) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast({ title: "End date cannot be before start date", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("leaveType", form.leaveType);
      formData.append("startDate", form.startDate);
      formData.append("endDate", form.endDate);
      formData.append("reason", form.reason);
      formData.append("loadAssign", form.loadAssign);
      if (form.reassignFacultyId) formData.append("reassignFacultyId", form.reassignFacultyId);
      if (file) formData.append("document", file);

      const res = await fetch("/api/v1/leave", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        toast({ title: "Leave application submitted! Notifications sent." });
        setForm({ leaveType: "", startDate: "", endDate: "", reason: "", loadAssign: "", reassignFacultyId: "" });
        setFile(null);
        setActiveTab("status");
        fetchMyLeaves();
      } else {
        toast({ title: result.error || "Failed to submit leave application", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to submit leave application", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const formatApiDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="page-header font-serif">Leave Management</h1>
        <p className="text-muted-foreground -mt-4">Apply for leave and manage department approvals</p>
      </motion.div>

      {/* Leave Balance Summary — dynamic from API */}
      {Object.keys(leaveBalances).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          {(["Medical", "Casual", "Earned", "On-Duty"] as const).map((type, i) => {
            const b = leaveBalances[type];
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="widget-card text-center"
              >
                <p className="text-xs text-muted-foreground mb-2">{type} Leave</p>
                <p className={cn(
                  "text-3xl font-bold",
                  b?.remaining_leaves > 0 ? "text-success" : "text-destructive"
                )}>
                  {b?.remaining_leaves ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">of {b?.total_allowed ?? 0} remaining</p>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="approvals" className="flex items-center gap-2 text-secondary">
            <CheckCircle2 className="w-4 h-4" />
            Leave Approvals
          </TabsTrigger>
          <TabsTrigger value="apply" className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Apply Leave
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            My Requests
          </TabsTrigger>
        </TabsList>

        {/* APPLY LEAVE TAB */}
        <TabsContent value="apply">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="widget-card max-w-2xl">
            <h3 className="section-title flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Leave Application Form
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Leave Type + balance */}
                <div className="space-y-2">
                  <Label>Leave Type *</Label>
                  <Select value={form.leaveType} onValueChange={(v) => setForm((f) => ({ ...f, leaveType: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casual">Casual Leave</SelectItem>
                      <SelectItem value="Medical">Medical Leave</SelectItem>
                      <SelectItem value="On-Duty">On Duty Leave</SelectItem>
                      <SelectItem value="Earned">Earned Leave</SelectItem>
                      <SelectItem value="Personal">Personal Leave</SelectItem>
                      <SelectItem value="Maternity">Maternity Leave</SelectItem>
                      <SelectItem value="Comp-Off">Comp-Off</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.leaveType && leaveBalances[form.leaveType] && (
                    <div className="flex items-center gap-2 mt-2 p-3 rounded-lg bg-primary/5 border border-primary/15">
                      <Wallet className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex flex-wrap gap-3 text-xs w-full">
                        <span className="flex flex-col items-center">
                          <span className="text-muted-foreground">Allowed</span>
                          <span className="font-bold text-foreground text-sm">{leaveBalances[form.leaveType].total_allowed}</span>
                        </span>
                        <span className="w-px bg-border" />
                        <span className="flex flex-col items-center">
                          <span className="text-muted-foreground">Used</span>
                          <span className="font-bold text-warning text-sm">{leaveBalances[form.leaveType].used_leaves}</span>
                        </span>
                        <span className="w-px bg-border" />
                        <span className="flex flex-col items-center">
                          <span className="text-muted-foreground">Remaining</span>
                          <span className={cn("font-bold text-sm", leaveBalances[form.leaveType].remaining_leaves > 0 ? "text-success" : "text-destructive")}>
                            {leaveBalances[form.leaveType].remaining_leaves}
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reassign Faculty */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-primary" />
                    Reassign Faculty
                  </Label>
                  <Select value={form.reassignFacultyId} onValueChange={(v) => setForm((f) => ({ ...f, reassignFacultyId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select faculty to cover classes" /></SelectTrigger>
                    <SelectContent>
                      {colleagues.length === 0 ? (
                        <SelectItem value="none" disabled>No colleagues found</SelectItem>
                      ) : (
                        colleagues.map((c) => (
                          <SelectItem key={c.faculty_id} value={String(c.faculty_id)}>
                            {c.Name} — {c.designation}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Date *</Label>
                  <Input type="date" value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>To Date *</Label>
                  <Input type="date" value={form.endDate} min={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason for Leave *</Label>
                <Textarea value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  placeholder="Please provide a detailed reason for your leave request..."
                  rows={4} required />
              </div>

              <div className="space-y-2">
                <Label>Load Assign</Label>
                <Textarea value={form.loadAssign}
                  onChange={(e) => setForm((f) => ({ ...f, loadAssign: e.target.value }))}
                  placeholder="Describe workload details (classes to handle, syllabus, lab sessions, etc.)..."
                  rows={3} />
              </div>

              {(form.leaveType === "Medical" || form.leaveType === "On-Duty") && (
                <div className="space-y-2">
                  <Label>Supporting Documents (Optional)</Label>
                  <div
                    className={cn(
                      "border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer",
                      file && "border-primary bg-primary/5"
                    )}
                    onClick={() => document.getElementById("dept-leave-doc")?.click()}
                  >
                    <input id="dept-leave-doc" type="file" className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx,image/*" />
                    {file ? (
                      <div className="flex items-center justify-center gap-2 text-primary font-medium">
                        <FileText className="w-5 h-5" />
                        {file.name}
                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-2"
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground flex flex-col items-center gap-2">
                        <PlusCircle className="w-6 h-6" />
                        Drag and drop files or click to upload
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
                <Button type="button" variant="outline"
                  onClick={() => setForm({ leaveType: "", startDate: "", endDate: "", reason: "", loadAssign: "", reassignFacultyId: "" })}>
                  Clear
                </Button>
              </div>
            </form>
          </motion.div>
        </TabsContent>

        {/* MY REQUESTS TAB */}
        <TabsContent value="status">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Clock className="w-8 h-8 text-muted-foreground animate-spin mb-4" />
                <p className="text-muted-foreground">Loading your leave requests...</p>
              </div>
            ) : myLeaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg bg-muted/10">
                <FileText className="w-8 h-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No leave requests yet</p>
                <p className="text-sm text-muted-foreground mt-1">Apply for leave using the form above</p>
              </div>
            ) : (
              myLeaves.map((request, index) => {
                const config = statusConfig[request.status] || statusConfig["pending"];
                const StatusIcon = config.icon;
                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn("widget-card border-l-4", config.border)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-foreground">{request.leaveType}</h4>
                          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1", config.bg, config.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{request.reason}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {formatApiDate(request.startDate)} → {formatApiDate(request.endDate)} ({Math.ceil(request.totalDays)} days)
                          </span>
                          {request.reassignFacultyName && (
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <User className="w-3 h-3" />
                              Reassigned to: {request.reassignFacultyName}
                            </span>
                          )}
                        </div>
                        {request.approvalRemarks && (
                          <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/40 rounded border border-border">
                            <span className="font-medium text-foreground">Remarks: </span>{request.approvalRemarks}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {request.status === "pending" && (
                          <Button variant="ghost" size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                            onClick={() => handleDelete(request.id)} title="Delete application">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                          request.status !== "rejected" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive")}>1</div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                          request.status === "approved" ? "bg-success/20 text-success"
                            : request.status === "rejected" ? "bg-destructive/20 text-destructive"
                              : "bg-muted text-muted-foreground")}>2</div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                          request.status === "approved" ? "bg-success/20 text-success"
                            : request.status === "rejected" ? "bg-destructive/20 text-destructive"
                              : "bg-muted text-muted-foreground")}>3</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </TabsContent>

        {/* LEAVE APPROVALS TAB */}
        <TabsContent value="approvals">
          <LeaveApprovals />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
