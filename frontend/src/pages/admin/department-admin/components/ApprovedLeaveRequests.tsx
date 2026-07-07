import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, User, Calendar, FileText, GraduationCap, Download } from "lucide-react";
import { Button } from "@/pages/admin/department-admin/components/ui/button";
import { toast } from "@/pages/admin/department-admin/hooks/use-toast";
import { getStudentDocumentUrl } from "@/utils/imageUrl";
import { downloadLeaveReport } from "@/utils/leaveReport";
import { cn } from "@/pages/admin/department-admin/lib/utils";

interface Leave {
  id: number;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  totalDays: number;
  status: string;
  applicantType: string;
  createdAt: string;
  applicantId: number;
  // Based on your backend, the raw leaves don't auto-join name unless enriched, 
  // but we can try to display available info or just basic details.
}

export function ApprovedLeaveRequests() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedLeaves();
  }, []);

  const fetchApprovedLeaves = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      // HOD approved or fully approved leaves
      const res = await fetch("/api/v1/leave?status=hod_approved", { headers });
      const data = await res.json();

      const res2 = await fetch("/api/v1/leave?status=approved", { headers });
      const data2 = await res2.json();

      let combined: Leave[] = [];
      if (data.success && data.data) combined = [...combined, ...data.data];
      if (data2.success && data2.data) combined = [...combined, ...data2.data];

      // Sort by latest
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setLeaves(combined);
    } catch (error) {
      console.error("Error fetching approved leaves:", error);
      toast({
        title: "Error",
        description: "Failed to load approved leaves",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full" />
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
        <h3 className="text-lg font-semibold text-foreground mb-1">No Approved Requests</h3>
        <p className="text-muted-foreground text-center max-w-md">
          There are no approved leave requests to display.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-success" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Approved Requests</h2>
          <p className="text-sm text-muted-foreground">
            {leaves.length} approved request{leaves.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {leaves.map((leave, index) => (
          <motion.div
            key={`approved-${leave.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-lg p-5 hover:border-success/50 transition-all group"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {leave.applicantType === 'student' ? (
                     <GraduationCap className="w-4 h-4 text-blue-600" />
                  ) : (
                     <User className="w-4 h-4 text-primary" />
                  )}
                  <h3 className="font-bold text-foreground capitalize">
                     {leave.applicantName || leave.applicant?.name || `${leave.applicantType} ID: ${leave.applicantId}`}
                  </h3>
                  <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {leave.status === 'hod_approved' ? 'HOD Approved' : 'Approved'}
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
                
                <div className="mt-4 flex">
                   <Button variant="outline" size="sm" onClick={() => downloadLeaveReport(leave)} className="flex items-center gap-2">
                     <Download className="w-4 h-4" /> Download Report
                   </Button>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Applied on {new Date(leave.createdAt).toLocaleDateString()}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
