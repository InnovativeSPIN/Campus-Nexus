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
} from "lucide-react";
import { toast } from "@/pages/admin/department-admin/hooks/use-toast";
import { cn } from "@/pages/admin/department-admin/lib/utils";

interface Leave {
  id: number;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  totalDays: number;
  status: string;
  applicant?: {
    name: string;
    email: string;
    role: string;
  };
  applicantType: string;
  createdAt: string;
}

export function LeaveApprovals() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<"approved" | "rejected">("approved");
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/v1/leave/pending-approvals", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json();
      if (result.success) {
        setLeaves(result.data || []);
      }
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

  const handleApprovalClick = (leave: Leave) => {
    setSelectedLeave(leave);
    setApprovalStatus("approved");
    setApprovalRemarks("");
    setShowApprovalDialog(true);
  };

  const submitApproval = async () => {
    if (!selectedLeave) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/v1/leave/${selectedLeave.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          status: approvalStatus,
          remarks: approvalRemarks,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: approvalStatus === "approved" ? "Leave Approved" : "Leave Rejected",
          description:
            approvalStatus === "approved"
              ? `The leave request has been approved.`
              : `The leave request has been rejected.`,
        });

        // Remove from list
        setLeaves((prev) => prev.filter((l) => l.id !== selectedLeave.id));
        setShowApprovalDialog(false);
        setSelectedLeave(null);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to process leave approval",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting approval:", error);
      toast({
        title: "Error",
        description: "Failed to submit approval",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (leaves.length === 0) {
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
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Leave Approvals</h2>
          <p className="text-sm text-muted-foreground">
            {leaves.length} pending leave request{leaves.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {leaves.map((leave, index) => (
          <motion.div
            key={leave.id}
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
                    setSelectedLeave(leave);
                    setApprovalStatus("rejected");
                    setApprovalRemarks("");
                    setShowApprovalDialog(true);
                  }}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  className="bg-success hover:bg-success/90 text-white"
                  onClick={() => handleApprovalClick(leave)}
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

      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalStatus === "approved" ? "Approve" : "Reject"} Leave Request
            </DialogTitle>
          </DialogHeader>

          {selectedLeave && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Applicant:</span> {selectedLeave.applicant?.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Type:</span> {selectedLeave.leaveType}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Duration:</span>{" "}
                  {new Date(selectedLeave.startDate).toLocaleDateString()} to{" "}
                  {new Date(selectedLeave.endDate).toLocaleDateString()} ({selectedLeave.totalDays} day
                  {selectedLeave.totalDays !== 1 ? "s" : ""})
                </p>
                {selectedLeave.reason && (
                  <p className="text-sm">
                    <span className="font-medium">Reason:</span> {selectedLeave.reason}
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
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={submitApproval}
              disabled={submitting}
              className={cn(
                "text-white",
                approvalStatus === "approved" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"
              )}
            >
              {submitting ? "Processing..." : approvalStatus === "approved" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
