import { useState, useEffect } from "react";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Textarea } from "@/pages/faculty/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/faculty/components/ui/tabs";
import { Label } from "@/pages/faculty/components/ui/label";
import {
  Calendar, Clock, CheckCircle2, XCircle, AlertCircle, User, FileText,
  RefreshCw, CheckIcon, ThumbsUp, ThumbsDown
} from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";
import { toast } from '@/components/ui/sonner';

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
  createdAt: string;
  applicant?: Faculty;
}

export default function SubstituteApprovalPanel({ isNested = false }: { isNested?: boolean }) {
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actingOnId, setActingOnId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const user = localStorage.getItem("user");
      const userData = user ? JSON.parse(user) : null;
      const facultyId = userData?.faculty_id;

      if (!facultyId) {
        toast.error("Faculty ID not found");
        return;
      }

      const response = await fetch(
        `/api/v1/faculty/alteration/pending/${facultyId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const result = await response.json();
      if (result.success) {
        setPendingRequests(result.data || []);
      } else {
        toast.error(result.error || "Failed to load pending requests");
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      toast.error("Failed to load pending requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (leaveId: number) => {
    try {
      setActingOnId(leaveId);
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `/api/v1/faculty/alteration/${leaveId}/accept`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({}),
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success("Request accepted successfully!");
        fetchPendingRequests();
      } else {
        toast.error(result.error || "Failed to accept request");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    } finally {
      setActingOnId(null);
    }
  };

  const handleReject = async (leaveId: number) => {
    if (!rejectionReason[leaveId]) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setActingOnId(leaveId);
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `/api/v1/faculty/alteration/${leaveId}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ rejection_reason: rejectionReason[leaveId] }),
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success("Request rejected");
        fetchPendingRequests();
      } else {
        toast.error(result.error || "Failed to reject request");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    } finally {
      setActingOnId(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "numeric"
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const content = (
    <motion.div
      initial={!isNested ? { opacity: 0, x: -20 } : false}
      animate={!isNested ? { opacity: 1, x: 0 } : false}
      className={cn("mb-8", isNested && "mb-0")}
    >
      {!isNested && (
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-serif mb-2">Substitution Requests</h1>
            <p className="text-muted-foreground">Manage alteration requests from your colleagues</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPendingRequests}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Requests
              {pendingRequests.length > 0 && (
                <span className="ml-2 bg-warning text-warning-foreground px-2 py-0.5 rounded-full text-xs font-semibold">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading alteration requests...</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-success/50" />
                <p className="text-muted-foreground mb-3">
                  No pending alteration requests
                </p>
                <p className="text-sm text-muted-foreground/70">
                  All requests have been handled
                </p>
              </div>
            ) : (
              <div className="grid gap-5">
                {pendingRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {request.applicant?.Name || "Faculty"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {request.applicant?.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-warning/10 text-warning px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Awaiting Your Response
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-secondary/5 p-4 rounded-lg border border-secondary/20">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Leave Type
                        </p>
                        <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          {request.leaveType}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Start Date
                        </p>
                        <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          {formatDate(request.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          End Date
                        </p>
                        <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          {formatDate(request.endDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Total Days
                        </p>
                        <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          {request.totalDays} days
                        </p>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="mb-6">
                      <Label className="font-medium text-sm mb-2 block">Reason for Leave</Label>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
                        {request.reason}
                      </p>
                    </div>

                    {/* Requested At */}
                    <div className="text-xs text-muted-foreground mb-6">
                      Requested {formatTime(request.createdAt)} on {formatDate(request.createdAt)}
                    </div>

                    {/* Action Section */}
                    <div className="space-y-4 bg-muted/30 p-4 rounded-lg border border-border">
                      <div>
                        <Label className="font-medium text-sm mb-2 block">
                          Response
                        </Label>
                        <div className="space-y-3">
                          {/* Acceptance Option */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAccept(request.id)}
                            disabled={actingOnId !== null}
                            className={cn(
                              "w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all",
                              actingOnId === request.id
                                ? "border-success bg-success/10"
                                : "border-border hover:border-success hover:bg-success/5"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <CheckIcon className="w-5 h-5 text-success" />
                              <div className="text-left">
                                <p className="font-semibold">Accept</p>
                                <p className="text-xs text-muted-foreground">
                                  I can teach this faculty's classes
                                </p>
                              </div>
                            </div>
                            {actingOnId === request.id && (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            )}
                          </motion.button>

                          {/* Rejection Option */}
                          <div className="space-y-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={cn(
                                "w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all",
                                "border-border hover:border-destructive hover:bg-destructive/5"
                              )}
                              onClick={() => {
                                const elem = document.getElementById(
                                  `rejection-reason-${request.id}`
                                );
                                elem?.focus();
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <XCircle className="w-5 h-5 text-destructive" />
                                <div className="text-left">
                                  <p className="font-semibold">Reject</p>
                                  <p className="text-xs text-muted-foreground">
                                    I cannot teach this class
                                  </p>
                                </div>
                              </div>
                            </motion.button>

                            {/* Rejection Reason Input */}
                            <div className="ml-12 space-y-2">
                              <Label className="text-xs text-muted-foreground">
                                Please provide a reason (required for rejection)
                              </Label>
                              <Textarea
                                id={`rejection-reason-${request.id}`}
                                placeholder="Explain why you cannot substitute..."
                                value={rejectionReason[request.id] || ""}
                                onChange={(e) =>
                                  setRejectionReason({
                                    ...rejectionReason,
                                    [request.id]: e.target.value,
                                  })
                                }
                                className="min-h-20 text-sm"
                              />
                              <Button
                                onClick={() => handleReject(request.id)}
                                disabled={
                                  actingOnId !== null ||
                                  !rejectionReason[request.id]?.trim()
                                }
                                variant="destructive"
                                className="w-full"
                              >
                                {actingOnId === request.id ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Rejecting...
                                  </>
                                ) : (
                                  <>
                                    <ThumbsDown className="w-4 h-4 mr-2" />
                                    Reject Request
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
    </motion.div>
  );

  if (isNested) return content;
  return <MainLayout hideHeader={true}>{content}</MainLayout>;
}
