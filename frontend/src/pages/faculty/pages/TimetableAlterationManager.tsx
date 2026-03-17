import { useState, useEffect } from "react";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/faculty/components/ui/tabs";
import {
  Calendar, Clock, CheckCircle2, XCircle, User, FileText,
  RefreshCw, CheckIcon, AlertCircle, Grid3x3, ArrowRight
} from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";
import { toast } from "sonner";

interface Faculty {
  faculty_id: number;
  Name: string;
  email: string;
}

interface LeaveRequest {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  overall_status: string;
  substitute_approval_status?: string;
  timetable_incharge_approval_status?: string;
  createdAt: string;
  applicant?: Faculty;
  substituteFaculty?: Faculty;
  timetableIncharge?: Faculty;
  affected_periods?: any[];
}

export default function TimetableAlterationManager() {
  const [applyQueue, setApplyQueue] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("queue");

  useEffect(() => {
    fetchApplyQueue();
  }, []);

  const fetchApplyQueue = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await fetch("/api/v1/faculty/alteration/apply-queue", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const result = await response.json();
      if (result.success) {
        setApplyQueue(result.data || []);
      } else {
        toast.error(result.error || "Failed to load queue");
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
      toast.error("Failed to load queue");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAlteration = async (leaveId: number) => {
    try {
      setApplyingId(leaveId);
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `/api/v1/faculty/alteration/${leaveId}/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({}),
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success(
          result.data.needsExecutiveApproval
            ? "Alterations applied! Pending executive admin approval for multi-day leave."
            : "Alterations applied successfully! Leave approved."
        );
        fetchApplyQueue();
      } else {
        toast.error(result.error || "Failed to apply alterations");
      }
    } catch (error) {
      console.error("Error applying alterations:", error);
      toast.error("Failed to apply alterations");
    } finally {
      setApplyingId(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <MainLayout hideHeader={true}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-serif">Timetable Alterations</h1>
            <p className="text-muted-foreground">
              Review and apply approved alteration requests to the timetable
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchApplyQueue}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4" />
              Pending Alterations
              {applyQueue.length > 0 && (
                <span className="ml-2 bg-warning text-warning-foreground px-2 py-0.5 rounded-full text-xs font-semibold">
                  {applyQueue.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading alteration queue...</p>
              </div>
            ) : applyQueue.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-success/50" />
                <p className="text-muted-foreground mb-3">
                  No pending alterations to apply
                </p>
                <p className="text-sm text-muted-foreground/70">
                  All approved alterations have been processed
                </p>
              </div>
            ) : (
              <div className="grid gap-5">
                {applyQueue.map((leave) => (
                  <motion.div
                    key={leave.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-info" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {leave.applicant?.Name || "Faculty"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {leave.leaveType} Leave
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-info/10 text-info px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                        <CheckIcon className="w-4 h-4" />
                        Ready to Apply
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-secondary/5 p-4 rounded-lg border border-secondary/20">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Leave Period
                        </p>
                        <p className="text-sm font-semibold mt-1">
                          {formatDate(leave.startDate)} to{" "}
                          {formatDate(leave.endDate)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {leave.totalDays} days total
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Substitute Faculty
                        </p>
                        <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          {leave.substituteFaculty?.Name || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Status
                        </p>
                        <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-warning" />
                          Pending Apply
                        </p>
                      </div>
                    </div>

                    {/* Leave Reason */}
                    <div className="mb-6">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
                        Leave Reason
                      </p>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
                        {leave.reason}
                      </p>
                    </div>

                    {/* Affected Periods */}
                    {leave.affected_periods && leave.affected_periods.length > 0 && (
                      <div className="mb-6">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">
                          Affected Periods ({leave.affected_periods.length})
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {leave.affected_periods.map((period, idx) => (
                            <div
                              key={idx}
                              className="bg-muted/30 border border-border rounded p-2 text-center text-sm"
                            >
                              <p className="font-semibold text-primary">
                                Period {period.period_slot_id}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(period.date)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Execution Details */}
                    <div className="mb-6 bg-success/5 border border-success/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-success text-sm mb-1">
                            Ready to Apply
                          </p>
                          <p className="text-xs text-success/80">
                            Click the button below to create timetable overlays for all affected periods,
                            update attendance records, and notify the department admin.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="text-xs text-muted-foreground mb-6">
                      Requested {formatTime(leave.createdAt)} on {formatDate(leave.createdAt)}
                      {leave.totalDays > 2 && (
                        <>
                          <br />
                          <span className="inline-block mt-2 px-2 py-1 bg-warning/10 text-warning rounded text-xs font-medium">
                            ⚠ Multi-day leave - will require executive admin approval
                          </span>
                        </>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleApplyAlteration(leave.id)}
                        disabled={applyingId !== null}
                        size="lg"
                        className="gap-2"
                      >
                        {applyingId === leave.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Applying Alterations...
                          </>
                        ) : (
                          <>
                            <Grid3x3 className="w-4 h-4" />
                            Apply to Timetable
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
}
