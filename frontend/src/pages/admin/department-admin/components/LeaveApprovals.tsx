import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/pages/admin/department-admin/components/ui/button";
import { Textarea } from "@/pages/admin/department-admin/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/pages/admin/department-admin/components/ui/dialog";
import {
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  FileText,
  GraduationCap,
} from "lucide-react";
import { toast } from "@/pages/admin/department-admin/hooks/use-toast";
import { cn } from "@/pages/admin/department-admin/lib/utils";

// Faculty leave (HOD approval)
interface FacultyLeave {
  id: number;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  totalDays: number;
  status: string;
  applicant?: { name: string; email: string; role: string };
  applicantType: string;
  createdAt: string;
  reassignFacultyName?: string;
}

// Student leave (Department Admin approval - after class incharge approved)
interface StudentLeave {
  id: number;
  startDate: string;
  endDate: string;
  leaveType: string;
  leaveSubType?: string;
  reason: string;
  totalDays: number;
  submitted_to: string;
  overall_status: string;
  class_incharge_approval_status: string;
  department_admin_approval_status: string;
  classInchargeApprover?: { Name: string };
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    rollNumber: string;
    studentId: string;
  };
  createdAt: string;
}

type ActiveDialog =
  | { type: "faculty"; leave: FacultyLeave; status: "approved" | "rejected" }
  | { type: "student"; leave: StudentLeave; status: "approved" | "rejected" }
  | null;

export function LeaveApprovals() {
  const [facultyLeaves, setFacultyLeaves] = useState<FacultyLeave[]>([]);
  const [studentLeaves, setStudentLeaves] = useState<StudentLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAllPendingLeaves();
  }, []);

  const fetchAllPendingLeaves = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const [facultyRes, studentRes] = await Promise.all([
        fetch("/api/v1/leave/pending-approvals", { headers }),
        fetch("/api/v1/student-leaves/approvals/pending/dept-admin", { headers }),
      ]);

      const [facultyData, studentData] = await Promise.all([
        facultyRes.json(),
        studentRes.json(),
      ]);

      if (facultyData.success) setFacultyLeaves(facultyData.data || []);
      if (studentData.success) setStudentLeaves(studentData.data || []);
    } catch (error) {
      console.error("Error fetching pending leaves:", error);
      toast({
        title: "Error",
        description: "Failed to load pending leaves",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Faculty leave approval ────────────────────────────────────────────
  const submitFacultyApproval = async () => {
    if (!activeDialog || activeDialog.type !== "faculty") return;
    const leave = activeDialog.leave;
    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/v1/leave/${leave.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ status: activeDialog.status, remarks: approvalRemarks }),
      });
      const result = await res.json();
      if (result.success) {
        toast({ title: activeDialog.status === "approved" ? "Leave Approved" : "Leave Rejected" });
        setFacultyLeaves((prev) => prev.filter((l) => l.id !== leave.id));
        setActiveDialog(null);
      } else {
        toast({ title: result.error || "Failed to process approval", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to submit approval", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Student leave approval ────────────────────────────────────────────
  const submitStudentApproval = async () => {
    if (!activeDialog || activeDialog.type !== "student") return;
    const leave = activeDialog.leave;
    const action = activeDialog.status; // "approved" | "rejected"
    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `/api/v1/student-leaves/approvals/${leave.id}/dept-admin/${action}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ remarks: approvalRemarks }),
        }
      );
      const result = await res.json();
      if (result.success) {
        toast({
          title: action === "approved" ? "Student Leave Approved ✅" : "Student Leave Rejected",
          description:
            action === "approved"
              ? "Student has been notified of the approval."
              : "Student has been notified of the rejection.",
        });
        setStudentLeaves((prev) => prev.filter((l) => l.id !== leave.id));
        setActiveDialog(null);
      } else {
        toast({ title: result.error || "Failed to process approval", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to submit approval", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitApproval = () => {
    if (!activeDialog) return;
    if (activeDialog.type === "faculty") submitFacultyApproval();
    else submitStudentApproval();
  };

  const totalPending = facultyLeaves.length + studentLeaves.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (totalPending === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No Pending Approvals</h3>
        <p className="text-muted-foreground text-center max-w-md">
          All leave requests from your department have been processed.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Leave Approvals</h2>
          <p className="text-sm text-muted-foreground">
            {totalPending} pending leave request{totalPending !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Student Leave Requests ── */}
      {studentLeaves.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-base text-blue-700">
              Student Leave Requests ({studentLeaves.length})
            </h3>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              Class Incharge Approved · Awaiting Your Approval
            </span>
          </div>

          <div className="space-y-3">
            {studentLeaves.map((leave, index) => (
              <motion.div
                key={`student-${leave.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-blue-200 rounded-lg p-5 hover:border-blue-400 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold text-foreground">
                        {leave.student?.firstName} {leave.student?.lastName}
                      </h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Roll: {leave.student?.rollNumber || leave.student?.studentId || "—"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {leave.leaveType || "Leave"}{leave.leaveSubType ? ` — ${leave.leaveSubType}` : ""}
                    </p>

                    {/* Class Incharge approved badge */}
                    {leave.classInchargeApprover && (
                      <p className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded mb-2 inline-block">
                        ✅ Approved by Class Incharge: {leave.classInchargeApprover.Name}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">From</p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(leave.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">To</p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">Days</p>
                        <p className="font-medium">{leave.totalDays}</p>
                      </div>
                    </div>

                    {leave.reason && (
                      <div className="flex items-start gap-2 p-3 bg-muted/40 rounded border border-border/50">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-foreground">{leave.reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setActiveDialog({ type: "student", leave, status: "rejected" });
                        setApprovalRemarks("");
                      }}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="bg-success hover:bg-success/90 text-white"
                      onClick={() => {
                        setActiveDialog({ type: "student", leave, status: "approved" });
                        setApprovalRemarks("");
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Applied on {new Date(leave.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Faculty Leave Requests ── */}
      {facultyLeaves.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-purple-600" />
            <h3 className="font-semibold text-base text-purple-700">
              Faculty Leave Requests ({facultyLeaves.length})
            </h3>
          </div>

          <div className="space-y-3">
            {facultyLeaves.map((leave, index) => (
              <motion.div
                key={`faculty-${leave.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-foreground">{leave.applicant?.name || "Unknown"}</h3>
                      <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded">
                        {leave.applicant?.role || ""}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{leave.leaveType}</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">From</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(leave.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">To</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Days</p>
                        <p className="text-sm font-medium">{leave.totalDays}</p>
                      </div>
                      {leave.reassignFacultyName && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Covered By</p>
                          <p className="text-sm font-medium text-primary">{leave.reassignFacultyName}</p>
                        </div>
                      )}
                    </div>

                    {leave.reason && (
                      <div className="flex items-start gap-2 p-3 bg-muted/40 rounded border border-border/50">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-foreground">{leave.reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setActiveDialog({ type: "faculty", leave, status: "rejected" });
                        setApprovalRemarks("");
                      }}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="bg-success hover:bg-success/90 text-white"
                      onClick={() => {
                        setActiveDialog({ type: "faculty", leave, status: "approved" });
                        setApprovalRemarks("");
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Applied on {new Date(leave.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Dialog */}
      <Dialog open={!!activeDialog} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activeDialog?.status === "approved" ? "Approve" : "Reject"}{" "}
              {activeDialog?.type === "student" ? "Student" : "Faculty"} Leave Request
            </DialogTitle>
          </DialogHeader>

          {activeDialog && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                {activeDialog.type === "student" ? (
                  <>
                    <p>
                      <span className="font-medium">Student:</span>{" "}
                      {(activeDialog.leave as StudentLeave).student?.firstName}{" "}
                      {(activeDialog.leave as StudentLeave).student?.lastName}
                    </p>
                    <p>
                      <span className="font-medium">Roll No:</span>{" "}
                      {(activeDialog.leave as StudentLeave).student?.rollNumber || "—"}
                    </p>
                  </>
                ) : (
                  <p>
                    <span className="font-medium">Applicant:</span>{" "}
                    {(activeDialog.leave as FacultyLeave).applicant?.name}
                  </p>
                )}
                <p>
                  <span className="font-medium">Type:</span> {
                    activeDialog.type === "student" 
                      ? (activeDialog.leave.leaveSubType || activeDialog.leave.leaveType)
                      : activeDialog.leave.leaveType
                  }
                </p>
                <p>
                  <span className="font-medium">Duration:</span>{" "}
                  {new Date(activeDialog.leave.startDate).toLocaleDateString()} to{" "}
                  {new Date(activeDialog.leave.endDate).toLocaleDateString()} (
                  {activeDialog.leave.totalDays} day{activeDialog.leave.totalDays !== 1 ? "s" : ""})
                </p>
                {activeDialog.leave.reason && (
                  <p>
                    <span className="font-medium">Reason:</span> {activeDialog.leave.reason}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Remarks (Optional)</label>
                <Textarea
                  placeholder="Add any remarks or comments..."
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                  className="min-h-24"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitApproval}
              disabled={submitting}
              className={cn(
                "text-white",
                activeDialog?.status === "approved"
                  ? "bg-success hover:bg-success/90"
                  : "bg-destructive hover:bg-destructive/90"
              )}
            >
              {submitting
                ? "Processing..."
                : activeDialog?.status === "approved"
                ? "Approve"
                : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
